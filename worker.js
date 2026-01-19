
var debug = false;

/* https://anovsiradj.github.io/webapp.js */
const dump = (...list) => Array.from(list).forEach(item => console.debug(item));

const isDev = () => new Promise(resolve => {
	chrome.management.getSelf(info => {
		resolve(info.installType === 'development');
	});
});

isDev().then(res => {
	debug = res;
	if (debug) dump('[DUMP] debug mode enabled');
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
	if (details.url === "about:blank") return;
	dump('[TYEXTRA1] onHistoryStateUpdated', details);

	let url = new URL(details.url);
	if (url.pathname === '/watch') {
		const isWatchDebug = await isDev();
		chrome.tabs.sendMessage(details.tabId, {
			url: details.url,
			is_debug: isWatchDebug,
			is_watch: true,
		});
	}
});
