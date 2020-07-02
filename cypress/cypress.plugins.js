const path = require('path');

module.exports = (on, config) => {
	on('before:browser:launch', (browser = {}, launchOptions) => {
		launchOptions.extensions.push(path.resolve(__dirname, '../dist/extension'));

		return launchOptions;
	});

	return {
		browsers: config.browsers.filter(browser => browser.name !== 'electron'),
	};
}
