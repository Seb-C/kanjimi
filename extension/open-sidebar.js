browser.pageAction.onClicked.addListener((tab) => {
	browser.sidebarAction.setPanel({
		tabId: tab.id,
		panel: null,
	});
	browser.sidebarAction.open();
});
