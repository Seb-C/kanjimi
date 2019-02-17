import 'jasmine'
import Lexer from '../src/Lexer'
import VerbToken from '../src/Lexer/Token/VerbToken'

describe('Lexer', function() {
	const lexer = new Lexer()
	it('Basic sentence tokenization', async function() {
		// TODO particles
		// TODO multi kanji sequences

		const result = await lexer.tokenize('私はセバスティアンと申します。')
		expect(result.length).toBe(6)
		expect(result[0].getText()).toBe('私')
		expect(result[1].getText()).toBe('は')
		expect(result[2].getText()).toBe('セバスティアン')
		expect(result[3].getText()).toBe('と')
		expect(result[4].getText()).toBe('申します')
		expect(result[5].getText()).toBe('。')
	})
	it('Verb recognition', async function() {
		const result = await lexer.tokenize('私はセバスティアンと申します。')
		const verb = <VerbToken>result[4]
		expect(verb instanceof VerbToken).toBe(true)
		expect(verb.getConjugation()).toBe('します')
		expect(verb.getVerb()).toBe('申')
		expect(verb.getDictionaryConjugationForms().map(v => v.dictionaryForm)).toContain('す')
	})
})
