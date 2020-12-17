
var debug = false;
var dump = (...arguments) => {
	if (! debug) return;
	/* https://anovsiradj.github.io/webapp.js */
	Array.from(arguments).forEach(a => console.info(a));
}

/* satu-satunya cara untuk mendapatkan environment */
chrome.management.getSelf(info => {
	if (info.installType === 'development') {
		debug = true;
		dump(info);
	}
});

/* "debug" pada inject selalu aktif, tapi bisa diubah dari sini. */
chrome.tabs.onUpdated.addListener((tabId, info) => {
	if (info.status === 'loading' || info.status === 'complete') {
		chrome.tabs.sendMessage(tabId, { is_debug: debug });
	}
});

/* cara paling efektif untuk deteksi ganti laman,
daripada deteksi lewat inject. karena tidak tergantung pada youtube-events. */
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	let url = new URL(details.url);
	if (url.pathname === '/watch') {
		dump(details.tabId, url);

		chrome.tabs.sendMessage(details.tabId, {
			url: details.url,
			is_watch_mode: true,
		});
	}
});
