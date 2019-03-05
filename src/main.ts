import Lexer from './Lexer';
import Dictionary from './Dictionary';
import Database from './Database';

(async () => {
	const db = new Database();

	const dictionary = new Dictionary();
	await dictionary.loadFromDatabase(db);

	const lexer = new Lexer(dictionary);

	console.dir(lexer.tokenize('私はセバスティアンと申します。'), { depth: null });

	await db.close();
})();
