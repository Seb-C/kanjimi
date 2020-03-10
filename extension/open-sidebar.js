browser.runtime.onMessage.addListener(async (message) => {
	if (message === 'openSidebar') {
		const activeTabs = await browser.tabs.query({
			active: true,
			windowId: browser.windows.WINDOW_ID_CURRENT,
		});
		browser.sidebarAction.setPanel({
			tabId: activeTabs[0].id,
			panel: null,
		});
		browser.sidebarAction.open();
	}
});
