import WordStatus from 'Common/Models/WordStatus';
import Token from 'Common/Models/Token';
import { createOrUpdate as putWordStatus } from 'Common/Client/Routes/WordStatus';
import Vue from 'vue';

type TooltipData = {
	token: Token,
	tokenElement: HTMLElement,
};

export default class Store {
	public apiKey: string|null = null;
	public tooltip: TooltipData|null = null;
	public wordStatuses: { [key: string]: WordStatus } = {};

	public notifyIfLoggedOut = () => {
		if (this.apiKey === null) {
			// Handled by the background script
			browser.runtime.sendMessage({
				action: 'notify',
				notificationId: 'kanjimi-notify-not-logged-in',
				onClickUrl: `${process.env.KANJIMI_WWW_URL}/app/login`,
				options: {
					type: 'basic',
					message: "The extension is not connected yet.\n\nClick here to connect it.",
					title: 'Kanjimi',
					iconUrl: browser.runtime.getURL('/images/logo.svg'),
				},
			});
		}
	}

	public setApiKey = async (key: string|null) => {
		this.apiKey = key;
		await browser.storage.local.set({ key });

		if (key === null) {
			browser.runtime.sendMessage({
				action: 'notify',
				notificationId: 'kanjimi-notify-logged-out',
				options: {
					type: 'basic',
					message: 'The extension have been disconnected from your Kanjimi account.',
					title: 'Kanjimi',
					iconUrl: browser.runtime.getURL('/images/logo.svg'),
				},
			});
		} else {
			browser.runtime.sendMessage({
				action: 'notify',
				notificationId: 'kanjimi-notify-logged-in',
				options: {
					type: 'basic',
					message: 'The extension have been connected with your Kanjimi account.',
					title: 'Kanjimi',
					iconUrl: browser.runtime.getURL('/images/logo.svg'),
				},
			});

			browser.runtime.sendMessage({
				action: 'close-opened-login-tabs',
			});
		}
	}

	public loadApiKeyFromStorage = async () => {
		this.apiKey = (await browser.storage.local.get('key')).key || null;
	}

	public setTooltip = (tooltipData: TooltipData|null) => {
		this.tooltip = tooltipData;
	}

	public setWordStatus = async (wordStatus: WordStatus, attributes: any) => {
		if (this.apiKey === null) {
			return;
		}

		const newWordStatus = await putWordStatus(this.apiKey, new WordStatus({
			...wordStatus,
			...attributes,
		}));
		Vue.set(this.wordStatuses, newWordStatus.word, newWordStatus);
	}
}
