import { Query } from '../db';

export default class Dictionary {
	async lookup (text: string): Promise<string[]> {
		// TODO async or not?
		// TODO return type
	}

	async loadFromDatabase(db: Query): Promise<void> {
		// TODO
	}

	mock(/* TODO */) {
		// TODO
	}
}
