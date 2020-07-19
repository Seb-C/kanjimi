if (!browser) {
	browser = chrome;
}

browser.browserAction.onClicked.addListener(function (tab) {
	browser.tabs.insertCSS(tab.id, {
		file: '/content.build.css',
		allFrames: true,
		runAt: 'document_end',
	});
	browser.tabs.executeScript(tab.id, {
		file: '/content.build.js',
		allFrames: true,
		runAt: 'document_end',
	});
	browser.browserAction.disable(tab.id);
});
