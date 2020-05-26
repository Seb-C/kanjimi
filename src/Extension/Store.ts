import WordStatus from 'Common/Models/WordStatus';
import Token from 'Common/Models/Token';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import { createOrUpdate as putWordStatus } from 'Common/Api/WordStatus';
import { get as getApiKey } from 'Common/Api/ApiKey';
import { get as getUser } from 'Common/Api/User';
import Vue from 'vue';
import AuthenticationError from 'Common/Api/Errors/Authentication';

type TooltipData = {
	token: Token,
	tokenElement: HTMLElement,
};

export default class Store {
	public apiKey: ApiKey|null = null;
	public user: User|null = null;
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
		await browser.storage.local.set({ key });
		await this.loadApiDataAfterApiKeyChange(key);

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
					message: `The extension have been connected with your Kanjimi account (${(<User>this.user).email}).`,
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
		await this.loadApiDataAfterApiKeyChange((await browser.storage.local.get('key')).key || null);
	}

	// Used to avoid double loading on setApiKey because it
	// triggers the browser storage onChange method
	private loadingApiDataAfterApiKeyChange = false;

	private async loadApiDataAfterApiKeyChange(key: string|null) {
		if (this.loadingApiDataAfterApiKeyChange) {
			return;
		}
		this.loadingApiDataAfterApiKeyChange = true;

		if (key === null) {
			this.apiKey = null;
			this.user = null;
		} else {
			try {
				const apiKey = await getApiKey(key);
				const user = await getUser(key, apiKey.userId);

				// Always setting the two at the same time, otherwise we may
				// have inconsistencies since both operations are asynchronous
				this.apiKey = apiKey;
				this.user = user;
			} catch (error) {
				if (error instanceof AuthenticationError) {
					await this.setApiKey(null);
				} else {
					throw error;
				}
			}
		}

		this.loadingApiDataAfterApiKeyChange = false;
	}

	public setTooltip = (tooltipData: TooltipData|null) => {
		this.tooltip = tooltipData;
	}

	public setWordStatus = async (wordStatus: WordStatus, attributes: any) => {
		if (this.apiKey === null) {
			return;
		}

		const newWordStatus = await putWordStatus(this.apiKey.key, new WordStatus({
			...wordStatus,
			...attributes,
		}));
		Vue.set(this.wordStatuses, newWordStatus.word, newWordStatus);
	}
}
