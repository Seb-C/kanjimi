import PageHandler from 'Client/Dom/PageHandler';
import { debounce } from 'ts-debounce';

const pageHandler = new PageHandler();

// Initializing
pageHandler.injectLoaderCss();
pageHandler.convertSentences(pageHandler.getSentencesToConvert());

window.addEventListener('scroll', debounce(
	() => {
		pageHandler.convertSentences(pageHandler.getSentencesToConvert());
	},
	300,
));
