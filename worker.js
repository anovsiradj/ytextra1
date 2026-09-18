/**
 * YouTube Extra 1 — Service Worker (MV3)
 * Detects YouTube watch pages and injects the content script.
 */

let debug = false;

const dump = (...list) => Array.from(list).forEach(item => console.debug(item));

/**
 * Check if the extension is running in development mode.
 */
async function isDev() {
  try {
    const info = await chrome.management.getSelf();
    return info.installType === 'development';
  } catch {
    return false;
  }
}

/**
 * Check if a URL is a YouTube watch page.
 */
function isWatchUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/watch';
  } catch {
    return false;
  }
}

/**
 * Send a message to a tab if it's a watch page.
 */
async function notifyWatchTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { is_watch: true });
  } catch (e) {
    // Tab may have been closed or content script not yet loaded
    dump('[YTEXTRA1] Could not send message to tab', tabId, e.message);
  }
}

/* ── on startup: check current tab ─────────────────────── */

(async function () {
  debug = await isDev();
  if (debug) dump('[YTEXTRA1] debug mode enabled');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && isWatchUrl(tab.url)) {
      await notifyWatchTab(tab.id);
    }
  } catch (e) {
    dump('[YTEXTRA1] Startup check failed', e.message);
  }
})();

/* ── on history state change (SPA navigation) ───────────── */

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (details.url === 'about:blank') return;
  if (!isWatchUrl(details.url)) return;

  dump('[YTEXTRA1] onHistoryStateUpdated', details.url);
  await notifyWatchTab(details.tabId);
});

/* ── on tab update (initial page load) ─────────────────── */

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !isWatchUrl(tab.url)) return;

  dump('[YTEXTRA1] onUpdated (load complete)', tab.url);
  await notifyWatchTab(tabId);
});
