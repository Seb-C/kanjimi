import Sense from './Sense';
import Reading from './Reading';

export default class Word {
	public readonly id: number;
	public readonly word: string;
	public readonly frequency: number|null;
	public readonly ateji: boolean;
	public readonly irregularKanji: boolean;
	public readonly irregularKana: boolean;
	public readonly outDatedKanji: boolean;
	public readonly senses: ReadonlyArray<Sense>;
	public readonly readings: ReadonlyArray<Reading>;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}

	public getBestReading(): Reading|null {
		let bestFrequency = -1;
		let bestReading = null;

		this.readings.forEach((reading) => {
			const frequency = reading.frequency || 0;
			if (frequency > bestFrequency) {
				bestReading = reading;
				bestFrequency = frequency;
			}
		});

		return bestReading;
	}

	public getBestSense(): Sense|null {
		return this.senses[0] || null; // TODO
	}
}
