browser.runtime.onMessage.addListener((message) => {
	if (message === 'kanjimi-notify-not-logged-in') {
		browser.notifications.create('kanjimi-not-logged-in', {
			type: 'basic',
			message: "The extension is not connected yet.\n\nClick here to connect it.",
			title: 'Kanjimi',
			iconUrl: browser.runtime.getURL('/images/logo.svg'),
		});
	}
});

browser.notifications.onClicked.addListener((id) => {
	if (id === 'kanjimi-not-logged-in') {
		browser.notifications.clear(id);
		browser.tabs.create({
			active: true,
			url: 'http://localhost:3000/www/app/login',
		});
	}
});
