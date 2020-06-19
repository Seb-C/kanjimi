import WordStatus from 'Common/Models/WordStatus';
import Token from 'Common/Models/Token';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import { createOrUpdate as putWordStatus } from 'Common/Api/WordStatus';
import { get as getApiKey } from 'Common/Api/ApiKey';
import { get as getUser } from 'Common/Api/User';
import Vue from 'vue';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import { v4 as uuidv4 } from 'uuid';

type TooltipData = {
	token: Token,
	tokenElement: HTMLElement,
};
type NotificationData = {
	message: string,
	link: {
		text: string,
		onClick: Function,
	}|null,
};

// Must be outside the store, otherwise Vue.js tries to
// access the properties and triggers a cross-origin error.
let openedLoginWindow: Window|null = null;

export default class Store {
	public apiKey: ApiKey|null = null;
	public user: User|null = null;
	public tooltip: TooltipData|null = null;
	public wordStatuses: { [key: string]: WordStatus } = {};
	public notification: NotificationData|null = null;

	public notifyIfLoggedOut = () => {
		if (this.apiKey === null) {
			this.setNotification({
				message: 'The extension is not connected yet.',
				link: {
					text: 'Click here to connect it.',
					onClick: () => {
						openedLoginWindow = window.open(
							`${process.env.KANJIMI_WWW_URL}/app/login`,
							'kanjimi-login-window',
						);
					},
				},
			});
		}
	}

	public setApiKey = async (key: string|null) => {
		await browser.storage.local.set({ key });
		await this.loadApiDataAfterApiKeyChange(key);
	}

	public loadApiKeyFromStorage = async (notifyLogin: boolean = true) => {
		const key = (await browser.storage.local.get('key')).key || null;
		await this.loadApiDataAfterApiKeyChange(key, notifyLogin);
	}

	// Used to avoid double loading on setApiKey because it
	// triggers the browser storage onChange method
	private loadingApiDataAfterApiKeyChange = false;

	private async loadApiDataAfterApiKeyChange(key: string|null, notifyLogin: boolean = true) {
		if (key === null) {
			this.apiKey = null;
			this.user = null;
			this.setNotification({
				message: 'The extension have been disconnected from your Kanjimi account.',
				link: null,
			});
		} else {
			try {
				if (this.loadingApiDataAfterApiKeyChange) {
					return;
				}
				this.loadingApiDataAfterApiKeyChange = true;

				const apiKey = await getApiKey(key);
				const user = await getUser(key, apiKey.userId);

				// Always setting the two at the same time, otherwise we may
				// have inconsistencies since both operations are asynchronous
				this.apiKey = apiKey;
				this.user = user;

				if (notifyLogin) {
					this.setNotification({
						message: `The extension have been connected with your Kanjimi account (${(<User>this.user).email}).`,
						link: null,
					});
					setTimeout(() => {
						this.setNotification(null);
					}, 5000);
				}

				if (openedLoginWindow !== null) {
					openedLoginWindow.close();
					openedLoginWindow = null;
				}
			} catch (error) {
				if (error instanceof AuthenticationError) {
					await this.setApiKey(null);
				} else {
					throw error;
				}
			} finally {
				this.loadingApiDataAfterApiKeyChange = false;
			}
		}
	}

	public setTooltip = (tooltipData: TooltipData|null) => {
		this.tooltip = tooltipData;
	}

	public setNotification = (notification: NotificationData|null) => {
		this.notification = notification;
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

	public async getSessionId(): string {
		let {
			sessionId,
			sessionIdExpiresAt,
		} = await browser.storage.local.get([
			'sessionId',
			'sessionIdExpiresAt',
		]);

		const newExpiresAt = new Date();
		newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 30);

		if (!sessionId || (sessionIdExpiresAt && parseInt(sessionIdExpiresAt) < (new Date()).getTime())) {
			// No session or it has expired -> creating one

			sessionId = uuidv4();
			sessionIdExpiresAt = newExpiresAt.getTime();
			await browser.storage.local.set({ sessionId, sessionIdExpiresAt });

			return sessionId;
		} else {
			// Active session -> refreshing the expiry date
			await browser.storage.local.set({
				sessionIdExpiresAt: newExpiresAt.getTime(),
			});

			return sessionId;
		}
	}
}
