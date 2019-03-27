import Token from './Token';
import Word from '../../Dictionary/Word';
import Sense from '../../Dictionary/Sense';
import Reading from '../../Dictionary/Reading';
import Translation from '../../Dictionary/Translation';

export default class WordToken extends Token {
	public readonly words: ReadonlyArray<Word>;

	constructor(text: string, words: ReadonlyArray<Word>) {
		super(text);
		this.words = words;
	}

	private getBestWord(): Word|null {
		let bestFrequency = -1;
		let bestWord = null;

		this.words.forEach((word) => {
			const frequency = word.frequency || 0;
			if (frequency > bestFrequency) {
				bestWord = word;
				bestFrequency = frequency;
			}
		});

		return bestWord;
	}

	public getFurigana(): string {
		const word = this.getBestWord();
		if (word === null) {
			return '';
		}

		const reading = word.getBestReading();
		if (reading === null) {
			return '';
		}

		return reading.reading;
	}

	public getTranslation(): string {
		const word = this.getBestWord();
		if (word === null) {
			return '';
		}

		const sense = word.getBestSense();
		if (sense === null) {
			return '';
		}

		const translation = sense.getBestTranslation();
		if (translation === null) {
			return '';
		}

		return translation.translation;
	}
}
