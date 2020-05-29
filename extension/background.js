const notificationOnClickUrls = {};
let openedLoginTabIds = [];

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

		try {
			await browser.notifications.create(message.notificationId, message.options);
		} catch (error) {
			// Might happen in headless CI
			console.error(error);
		}
	} else if (message.action === 'close-opened-login-tabs') {
		try {
			await browser.tabs.remove(openedLoginTabIds);
			openedLoginTabIds = [];
		} catch (error) {
			// Cannot close the tab(s), nothing we can do
			console.error(error);
		}
	}
});

browser.notifications.onClicked.addListener(async (id) => {
	if (notificationOnClickUrls[id]) {
		await browser.notifications.clear(id);
		const tab = await browser.tabs.create({
			active: true,
			url: notificationOnClickUrls[id],
		});
		openedLoginTabIds.push(tab.id);
	}
});
