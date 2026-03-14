const showDownEl = document.getElementById("showDown");
const showUpEl = document.getElementById("showUp");
const pushIntervalEl = document.getElementById("pushIntervalMs");
const statusEl = document.getElementById("status");

const MIN_INTERVAL_MS = 500;
const MAX_INTERVAL_MS = 10000;
const DEFAULT_INTERVAL_MS = 1000;

function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.classList.toggle("error", !!isError);
}

function sanitizeIntervalInput(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return { ok: true, value: DEFAULT_INTERVAL_MS };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, message: "只能输入整数" };
  }

  const n = Number(trimmed);

  if (!Number.isSafeInteger(n)) {
    return { ok: false, message: "数值无效" };
  }

  if (n < MIN_INTERVAL_MS || n > MAX_INTERVAL_MS) {
    return { ok: false, message: `范围必须是 ${MIN_INTERVAL_MS} ~ ${MAX_INTERVAL_MS}` };
  }

  return { ok: true, value: n };
}

function loadSettings() {
  chrome.runtime.sendMessage({ type: "TSM_GET_SETTINGS" }, (res) => {
    if (chrome.runtime.lastError || !res) {
      setStatus("读取设置失败", true);
      return;
    }

    showDownEl.checked = !!res.showDown;
    showUpEl.checked = !!res.showUp;
    pushIntervalEl.value = String(res.pushIntervalMs ?? DEFAULT_INTERVAL_MS);
  });
}

function saveSettings() {
  const intervalResult = sanitizeIntervalInput(pushIntervalEl.value);

  if (!intervalResult.ok) {
    setStatus(intervalResult.message, true);
    return;
  }

  const payload = {
    type: "TSM_SET_SETTINGS",
    showDown: showDownEl.checked,
    showUp: showUpEl.checked,
    pushIntervalMs: intervalResult.value
  };

  chrome.runtime.sendMessage(payload, (res) => {
    if (chrome.runtime.lastError || !res?.ok || !res.settings) {
      setStatus("保存失败", true);
      return;
    }

    showDownEl.checked = !!res.settings.showDown;
    showUpEl.checked = !!res.settings.showUp;
    pushIntervalEl.value = String(res.settings.pushIntervalMs);

    setStatus("已保存");
    setTimeout(() => setStatus(""), 1000);
  });
}

function onIntervalBlur() {
  const result = sanitizeIntervalInput(pushIntervalEl.value);

  if (!result.ok) {
    setStatus(result.message, true);
    return;
  }

  pushIntervalEl.value = String(result.value);
  saveSettings();
}

showDownEl.addEventListener("change", saveSettings);
showUpEl.addEventListener("change", saveSettings);
pushIntervalEl.addEventListener("change", saveSettings);
pushIntervalEl.addEventListener("blur", onIntervalBlur);

pushIntervalEl.addEventListener("input", () => {
  const cleaned = pushIntervalEl.value.replace(/[^\d]/g, "");
  if (pushIntervalEl.value !== cleaned) {
    pushIntervalEl.value = cleaned;
  }
  setStatus("");
});

loadSettings();