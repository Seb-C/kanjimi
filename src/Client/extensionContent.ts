import DomConverter from 'Client/Dom/DomConverter';
import { debounce } from 'ts-debounce';

const converter = new DomConverter();

converter.injectStyle();

// Initializing
converter.convertSentences(
	converter.getSentencesToConvert(),
);

window.addEventListener('scroll', debounce(
	() => {
		converter.convertSentences(
			converter.getSentencesToConvert(),
		);
	},
	300,
));
