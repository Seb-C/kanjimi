const path = require('path');

module.exports = (on, config) => {
	on('before:browser:launch', (browser = {}, launchOptions) => {
		launchOptions.extensions.push(path.resolve(__dirname, './extension'));
		console.log('Launch options:', launchOptions);

		return launchOptions;
	});
}
