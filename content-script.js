(() => {
  if (window.__TSM_INSTALLED__) return;
  window.__TSM_INSTALLED__ = true;

  const PREFIX_RE = /^\[[^\]]+\]\s*/;

  let activePrefix = "";
  let baseTitle = "";
  let selfUpdating = false;

  function stripPrefix(title) {
    return (title || "").replace(PREFIX_RE, "");
  }

  function syncBaseTitle() {
    if (selfUpdating) return;
    const clean = stripPrefix(document.title || "");
    if (clean) baseTitle = clean;
  }

  function renderTitle() {
    syncBaseTitle();

    const cleanBase = stripPrefix(baseTitle || document.title || "");

    selfUpdating = true;
    document.title = activePrefix ? `${activePrefix} ${cleanBase}` : cleanBase;
    selfUpdating = false;
  }

  const titleObserver = new MutationObserver(() => {
    if (selfUpdating) return;
    syncBaseTitle();
  });

  function observeTitle() {
    const titleEl = document.querySelector("title");
    if (titleEl) {
      titleObserver.observe(titleEl, {
        childList: true,
        subtree: true,
        characterData: true
      });
      return;
    }

    const timer = setInterval(() => {
      const t = document.querySelector("title");
      if (t) {
        clearInterval(timer);
        titleObserver.observe(t, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }, 200);
  }

  observeTitle();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "TSM_PING") {
      sendResponse({ ok: true });
      return true;
    }

    if (message?.type === "TSM_SET_PREFIX") {
      activePrefix = message.prefix || "";
      renderTitle();
      sendResponse({ ok: true });
      return true;
    }

    if (message?.type === "TSM_CLEAR_PREFIX") {
      activePrefix = "";
      renderTitle();
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
})();