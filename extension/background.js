browser.pageAction.onClicked.addListener(async (tab) => {
	const url = browser.runtime.getURL('/ui.html') + '?' + escape(
		JSON.stringify({
			url: tab.url,
			title: tab.title,
			favicon: tab.favIconUrl,
		})
	);
	await browser.tabs.update(tab.id, { url });
});
