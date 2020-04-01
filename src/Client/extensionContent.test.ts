import 'jasmine';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';
import * as Firefox from 'selenium-webdriver/firefox';
import * as Path from 'path';

let browser: WebDriver;

fdescribe('extensionContent', () => {
	beforeEach(async () => {
		browser = await new Builder()
			.setFirefoxService(
				new Firefox.ServiceBuilder(
					Path.resolve(Path.join(
						__dirname, // TODO clean path
						'../../node_modules/web-ext/bin/web-ext',
					)),
				),
			)
			.forBrowser('firefox')
			.build();
		// Path.resolve(Path.join(__dirname, '../extension/manifest.json'))
	});
	afterEach(async () => {
		await browser.quit();
	});

	it('test prototype', async () => {
		await browser.get('http://www.google.com/ncr');
		await (await browser.findElement(By.name('q'))).sendKeys('webdriver', Key.RETURN);
		await browser.wait(until.titleIs('webdriver - Google Search'), 1000);
	});
});
