const DEFAULT_SETTINGS = {
  showDown: true,
  showUp: true,
  pushIntervalMs: 1000
};

const MIN_INTERVAL_MS = 500;
const MAX_INTERVAL_MS = 10000;

let activeTabId = null;
let activeTimer = null;
let activeIntervalMs = DEFAULT_SETTINGS.pushIntervalMs;

const tabStats = new Map();
const requestMap = new Map();

function getTabStats(tabId) {
  if (!tabStats.has(tabId)) {
    tabStats.set(tabId, {
      downBytes: 0,
      upBytes: 0,
      lastAt: Date.now()
    });
  }
  return tabStats.get(tabId);
}

function resetTabStats(tabId) {
  const s = getTabStats(tabId);
  s.downBytes = 0;
  s.upBytes = 0;
  s.lastAt = Date.now();
}

function isBlockedUrl(url) {
  if (!url) return true;

  return [
    "chrome://",
    "edge://",
    "about:",
    "chrome-extension://",
    "devtools://"
  ].some(prefix => url.startsWith(prefix));
}

function sanitizeInterval(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.pushIntervalMs;
  if (!Number.isInteger(n)) return DEFAULT_SETTINGS.pushIntervalMs;
  if (n < MIN_INTERVAL_MS) return MIN_INTERVAL_MS;
  if (n > MAX_INTERVAL_MS) return MAX_INTERVAL_MS;

  return n;
}

async function getSettings() {
  const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  return {
    showDown: data.showDown !== false,
    showUp: data.showUp !== false,
    pushIntervalMs: sanitizeInterval(data.pushIntervalMs)
  };
}

function formatShortSpeed(bytesPerSec) {
  if (!Number.isFinite(bytesPerSec) || bytesPerSec <= 0) return "0";

  const units = ["B", "K", "M", "G"];
  let value = bytesPerSec;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  if (value >= 100) return `${value.toFixed(0)}${units[i]}`;
  if (value >= 10) return `${value.toFixed(0)}${units[i]}`;
  return `${value.toFixed(1)}${units[i]}`;
}

function buildPrefix(downBps, upBps, settings) {
  const parts = [];

  if (settings.showDown) {
    parts.push(`↓${formatShortSpeed(downBps)}`);
  }

  if (settings.showUp) {
    parts.push(`↑${formatShortSpeed(upBps)}`);
  }

  return parts.length ? `[${parts.join(" ")}]` : "";
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "TSM_PING" });
    return true;
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content-script.js"]
      });
      return true;
    } catch {
      return false;
    }
  }
}

async function sendToTab(tabId, message) {
  const ok = await ensureContentScript(tabId);
  if (!ok) return false;

  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch {
    return false;
  }
}

async function applyPrefix(tabId, downBps = 0, upBps = 0) {
  const settings = await getSettings();
  const prefix = buildPrefix(downBps, upBps, settings);

  await sendToTab(tabId, {
    type: "TSM_SET_PREFIX",
    prefix
  });
}

async function clearPrefix(tabId) {
  await sendToTab(tabId, {
    type: "TSM_CLEAR_PREFIX"
  });
}

function stopTimer() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
}

function startTimer(tabId, intervalMs) {
  stopTimer();

  activeIntervalMs = sanitizeInterval(intervalMs);

  activeTimer = setInterval(async () => {
    if (activeTabId !== tabId) return;

    const s = getTabStats(tabId);
    const now = Date.now();
    const elapsedMs = Math.max(1, now - s.lastAt);

    const downBps = (s.downBytes * 1000) / elapsedMs;
    const upBps = (s.upBytes * 1000) / elapsedMs;

    s.downBytes = 0;
    s.upBytes = 0;
    s.lastAt = now;

    try {
      await applyPrefix(tabId, downBps, upBps);
    } catch {}
  }, activeIntervalMs);
}

async function restartActiveTimerIfNeeded() {
  if (activeTabId == null) return;

  const settings = await getSettings();
  resetTabStats(activeTabId);
  startTimer(activeTabId, settings.pushIntervalMs);
  await applyPrefix(activeTabId, 0, 0);
}

async function activateTabMonitoring(tabId) {
  let tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch {
    return;
  }

  if (!tab || isBlockedUrl(tab.url || "")) return;

  if (activeTabId !== null && activeTabId !== tabId) {
    try {
      await clearPrefix(activeTabId);
    } catch {}
  }

  activeTabId = tabId;

  const settings = await getSettings();
  resetTabStats(tabId);
  startTimer(tabId, settings.pushIntervalMs);
  await applyPrefix(tabId, 0, 0);
}

function estimateRequestBodyBytes(requestBody) {
  if (!requestBody) return 0;

  let total = 0;

  if (Array.isArray(requestBody.raw)) {
    for (const item of requestBody.raw) {
      if (item && item.bytes) {
        total += item.bytes.byteLength || 0;
      }
    }
  }

  if (requestBody.formData && typeof requestBody.formData === "object") {
    try {
      const json = JSON.stringify(requestBody.formData);
      total += new TextEncoder().encode(json).length;
    } catch {}
  }

  return total;
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await activateTabMonitoring(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== activeTabId && changeInfo.status !== "complete") return;
  if (isBlockedUrl(tab.url || "")) return;

  if (changeInfo.status === "complete") {
    if (tab.active) {
      await activateTabMonitoring(tabId);
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  tabStats.delete(tabId);

  for (const [requestId, meta] of requestMap.entries()) {
    if (meta.tabId === tabId) {
      requestMap.delete(requestId);
    }
  }

  if (tabId === activeTabId) {
    activeTabId = null;
    stopTimer();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  await chrome.storage.sync.set({
    showDown: data.showDown !== false,
    showUp: data.showUp !== false,
    pushIntervalMs: sanitizeInterval(data.pushIntervalMs)
  });

  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id) {
      await activateTabMonitoring(tab.id);
    }
  } catch {}
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id) {
      await activateTabMonitoring(tab.id);
    }
  } catch {}
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "sync") return;

  const settingsChanged =
    "showDown" in changes ||
    "showUp" in changes ||
    "pushIntervalMs" in changes;

  if (!settingsChanged) return;

  await restartActiveTimerIfNeeded();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "TSM_GET_SETTINGS") {
    getSettings()
      .then(sendResponse)
      .catch(() => sendResponse(DEFAULT_SETTINGS));
    return true;
  }

  if (message?.type === "TSM_SET_SETTINGS") {
    const safeSettings = {
      showDown: !!message.showDown,
      showUp: !!message.showUp,
      pushIntervalMs: sanitizeInterval(message.pushIntervalMs)
    };

    chrome.storage.sync.set(safeSettings)
      .then(() => sendResponse({ ok: true, settings: safeSettings }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { requestId, tabId, requestBody } = details;
    if (tabId < 0) return;

    const uploadBytes = estimateRequestBodyBytes(requestBody);

    requestMap.set(requestId, {
      tabId,
      uploadBytes,
      responseBytes: 0
    });

    if (tabId === activeTabId && uploadBytes > 0) {
      const s = getTabStats(tabId);
      s.upBytes += uploadBytes;
    }
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    const { requestId, tabId, requestHeaders } = details;
    if (tabId < 0) return;

    let headerBytes = 0;

    if (Array.isArray(requestHeaders)) {
      for (const h of requestHeaders) {
        const name = h?.name || "";
        const value = h?.value || "";
        headerBytes += name.length + value.length + 4;
      }
    }

    let meta = requestMap.get(requestId);
    if (!meta) {
      meta = { tabId, uploadBytes: 0, responseBytes: 0 };
      requestMap.set(requestId, meta);
    }

    meta.uploadBytes += headerBytes;

    if (tabId === activeTabId && headerBytes > 0) {
      const s = getTabStats(tabId);
      s.upBytes += headerBytes;
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const { requestId, tabId, responseHeaders } = details;
    if (tabId < 0) return;

    let contentLength = 0;
    let headerBytes = 0;

    if (Array.isArray(responseHeaders)) {
      for (const h of responseHeaders) {
        const name = h?.name || "";
        const value = h?.value || "";
        headerBytes += name.length + value.length + 4;

        if (name.toLowerCase() === "content-length") {
          const n = Number(value);
          if (Number.isFinite(n) && n > 0) {
            contentLength = n;
          }
        }
      }
    }

    let meta = requestMap.get(requestId);
    if (!meta) {
      meta = { tabId, uploadBytes: 0, responseBytes: 0 };
      requestMap.set(requestId, meta);
    }

    meta.responseBytes = Math.max(meta.responseBytes, contentLength + headerBytes);
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const { requestId, tabId, fromCache } = details;
    if (tabId < 0) {
      requestMap.delete(requestId);
      return;
    }

    const meta = requestMap.get(requestId);
    if (!meta) return;

    if (tabId === activeTabId && !fromCache && meta.responseBytes > 0) {
      const s = getTabStats(tabId);
      s.downBytes += meta.responseBytes;
    }

    requestMap.delete(requestId);
  },
  { urls: ["<all_urls>"] }
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    requestMap.delete(details.requestId);
  },
  { urls: ["<all_urls>"] }
);