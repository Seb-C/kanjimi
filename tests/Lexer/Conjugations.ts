import 'jasmine';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';
import ConjugationForms from 'Lexer/Conjugation/ConjugationForms';
import ConjugationType from 'Lexer/Conjugation/ConjugationType';

describe('Lexer', async () => {
	it('existing verb forms', async () => {
		const checkForm = (conjugation: string, plain: string, type: ConjugationType) => {
			const forms = ConjugationForms.getForms(conjugation);
			const found = forms.some((form: ConjugationForm): boolean => {
				return (
					form.type === type
					&& form.dictionaryForm === plain
					&& form.conjugation === conjugation
				);
			});
			expect(found).toBe(
				true,
				`Forms for type ${ConjugationType[type]}: Expect ${conjugation}, found [${forms.join(', ')}].`,
			);
		};

		checkForm('りませんでした',   'る', ConjugationType.POLITE_NEGATIVE_PAST);
		checkForm('りません',         'る', ConjugationType.POLITE_NEGATIVE);
		checkForm('って',             'る', ConjugationType.TE);
		checkForm('らなかった',       'る', ConjugationType.NEGATIVE_PAST);
		checkForm('れ',               'る', ConjugationType.IMPERATIVE);
		checkForm('りませ',           'る', ConjugationType.IMPERATIVE_POLITE);
		checkForm('れば',             'る', ConjugationType.CONDITIONAL);
		checkForm('よう',             'る', ConjugationType.VOLITIONAL);
		checkForm('った',             'る', ConjugationType.PAST);
		checkForm('ります',           'る', ConjugationType.POLITE);
		checkForm('らない',           'る', ConjugationType.NEGATIVE);
		checkForm('られる',           'る', ConjugationType.PASSIVE);
		checkForm('させる',           'る', ConjugationType.CAUSATIVE);
		checkForm('れる',             'る', ConjugationType.POTENTIAL);
		checkForm('る',               'る', ConjugationType.PLAIN);
		checkForm('させない',         'る', ConjugationType.CAUSATIVE_NEGATIVE);
		checkForm('させなかった',     'る', ConjugationType.CAUSATIVE_NEGATIVE_PAST);
		checkForm('させた',           'る', ConjugationType.CAUSATIVE_PAST);
		checkForm('させます',         'る', ConjugationType.CAUSATIVE_POLITE);
		checkForm('させません',       'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE);
		checkForm('させませんでした', 'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST);
		checkForm('させました',       'る', ConjugationType.CAUSATIVE_POLITE_PAST);
		checkForm('られない',         'る', ConjugationType.PASSIVE_NEGATIVE);
		checkForm('られなかった',     'る', ConjugationType.PASSIVE_NEGATIVE_PAST);
		checkForm('られた',           'る', ConjugationType.PASSIVE_PAST);
		checkForm('られます',         'る', ConjugationType.PASSIVE_POLITE);
		checkForm('られません',       'る', ConjugationType.PASSIVE_POLITE_NEGATIVE);
		checkForm('られませんでした', 'る', ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST);
		checkForm('られました',       'る', ConjugationType.PASSIVE_POLITE_PAST);
		checkForm('りました',         'る', ConjugationType.POLITE_PAST);
		checkForm('りましょう',       'る', ConjugationType.POLITE_VOLITIONAL);
		checkForm('れない',           'る', ConjugationType.POTENTIAL_NEGATIVE);
		checkForm('れなかった',       'る', ConjugationType.POTENTIAL_NEGATIVE_PAST);
		checkForm('れた',             'る', ConjugationType.POTENTIAL_PAST);
		checkForm('れます',           'る', ConjugationType.POTENTIAL_POLITE);
		checkForm('れません',         'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE);
		checkForm('れませんでした',   'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST);
		checkForm('れました',         'る', ConjugationType.POTENTIAL_POLITE_PAST);

		checkForm('い',                 'い', ConjugationType.ADJECTIVE_PLAIN);
		checkForm('かった',             'い', ConjugationType.ADJECTIVE_PAST);
		checkForm('くない',             'い', ConjugationType.ADJECTIVE_NEGATIVE);
		checkForm('くなかった',         'い', ConjugationType.ADJECTIVE_NEGATIVE_PAST);
		checkForm('くありません',       'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE);
		checkForm('くありませんでした', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST);
	});

	it('conjugate with complex forms', async () => {
		const checkForm = (conjugation: string, plain: string, type: ConjugationType) => {
			const forms = ConjugationForms.conjugate(plain, type);
			const doesContainTheForm = forms.some((form: string) => form === conjugation);
			expect(doesContainTheForm).toBe(
				true,
				`Form ${ConjugationType[type]}: expected ${conjugation}, found [${forms.join(', ')}].`,
			);
		};

		checkForm('りませんでした',   'る', ConjugationType.POLITE_NEGATIVE_PAST);
		checkForm('りません',         'る', ConjugationType.POLITE_NEGATIVE);
		checkForm('らなかった',       'る', ConjugationType.NEGATIVE_PAST);
		checkForm('させない',         'る', ConjugationType.CAUSATIVE_NEGATIVE);
		checkForm('させなかった',     'る', ConjugationType.CAUSATIVE_NEGATIVE_PAST);
		checkForm('させた',           'る', ConjugationType.CAUSATIVE_PAST);
		checkForm('させます',         'る', ConjugationType.CAUSATIVE_POLITE);
		checkForm('させません',       'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE);
		checkForm('させませんでした', 'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST);
		checkForm('させました',       'る', ConjugationType.CAUSATIVE_POLITE_PAST);
		checkForm('られない',         'る', ConjugationType.PASSIVE_NEGATIVE);
		checkForm('られなかった',     'る', ConjugationType.PASSIVE_NEGATIVE_PAST);
		checkForm('られた',           'る', ConjugationType.PASSIVE_PAST);
		checkForm('られます',         'る', ConjugationType.PASSIVE_POLITE);
		checkForm('られません',       'る', ConjugationType.PASSIVE_POLITE_NEGATIVE);
		checkForm('られませんでした', 'る', ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST);
		checkForm('られました',       'る', ConjugationType.PASSIVE_POLITE_PAST);
		checkForm('りました',         'る', ConjugationType.POLITE_PAST);
		checkForm('りましょう',       'る', ConjugationType.POLITE_VOLITIONAL);
		checkForm('れない',           'る', ConjugationType.POTENTIAL_NEGATIVE);
		checkForm('れなかった',       'る', ConjugationType.POTENTIAL_NEGATIVE_PAST);
		checkForm('れた',             'る', ConjugationType.POTENTIAL_PAST);
		checkForm('れます',           'る', ConjugationType.POTENTIAL_POLITE);
		checkForm('れません',         'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE);
		checkForm('れませんでした',   'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST);
		checkForm('れました',         'る', ConjugationType.POTENTIAL_POLITE_PAST);

		checkForm('い',                 'い', ConjugationType.ADJECTIVE_PLAIN);
		checkForm('かった',             'い', ConjugationType.ADJECTIVE_PAST);
		checkForm('くない',             'い', ConjugationType.ADJECTIVE_NEGATIVE);
		checkForm('くなかった',         'い', ConjugationType.ADJECTIVE_NEGATIVE_PAST);
		checkForm('くありません',       'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE);
		checkForm('くありませんでした', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST);
	});
});
