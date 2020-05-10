const notificationOnClickUrls = {};

browser.runtime.onMessage.addListener(async (message) => {
	if (message.action === 'notify') {
		if (message.onClickUrl) {
			const tabs = await browser.tabs.query({});
			for (let i = 0; i < tabs.length; i++) {
				if (tabs[i].url === message.onClickUrl) {
					return; // Already clicked and opened
				}
			}

			notificationOnClickUrls[message.notificationId] = message.onClickUrl;
		}
		await browser.notifications.create(message.notificationId, message.options);
	}
});

browser.notifications.onClicked.addListener(async (id) => {
	if (notificationOnClickUrls[id]) {
		await browser.notifications.clear(id);
		await browser.tabs.create({
			active: true,
			url: notificationOnClickUrls[id],
		});
	}
});
