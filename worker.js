
var debug = false;

/* https://anovsiradj.github.io/webapp.js */
const dump = (...list) => Array.from(list).forEach(item => console.debug(item));

/* satu-satunya cara untuk mendapatkan environment */
chrome.management.getSelf(info => {
	if (info.installType === 'development') {
		debug = true;
		dump('[DUMP] info:', info);
	}
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
	if (details.url === "about:blank") return;
	dump('[TYEXTRA1] onHistoryStateUpdated', details);

	let url = new URL(details.url);
	if (url.pathname === '/watch') {
		chrome.tabs.sendMessage(details.tabId, {
			url: details.url,
			is_debug: debug,
			is_watch: true,
		});
	}
});
