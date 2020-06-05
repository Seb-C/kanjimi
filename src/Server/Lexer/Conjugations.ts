import ConjugationType from 'Common/Types/ConjugationType';
import Conjugation from 'Common/Models/Conjugation';

class ConjugationsClass {
	readonly formsByConjugation: Map<string, Conjugation[]> = new Map();
	readonly conjugationsByPlainForm: Map<string, Conjugation[]> = new Map();

	private readonly FORMS_CONVERT: Map<
		ConjugationType,
		Map<ConjugationType, ConjugationType>
	> = new Map([
		[ConjugationType.PASSIVE, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.NEGATIVE, ConjugationType.PASSIVE_NEGATIVE],
			[ConjugationType.TEIRU_NEGATIVE, ConjugationType.PASSIVE_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.PASSIVE_POLITE],
			[ConjugationType.TEIRU_POLITE, ConjugationType.PASSIVE_POLITE],
			[ConjugationType.PAST, ConjugationType.PASSIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.TEIRU_POLITE_NEGATIVE_PAST, ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.PASSIVE_NEGATIVE_PAST],
			[ConjugationType.TEIRU_NEGATIVE_PAST, ConjugationType.PASSIVE_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.PASSIVE_POLITE_NEGATIVE],
			[ConjugationType.TEIRU_POLITE_NEGATIVE, ConjugationType.PASSIVE_POLITE_NEGATIVE],
		])],
		[ConjugationType.CAUSATIVE, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.NEGATIVE, ConjugationType.CAUSATIVE_NEGATIVE],
			[ConjugationType.TEIRU_NEGATIVE, ConjugationType.CAUSATIVE_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.CAUSATIVE_POLITE],
			[ConjugationType.TEIRU_POLITE, ConjugationType.CAUSATIVE_POLITE],
			[ConjugationType.PAST, ConjugationType.CAUSATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.TEIRU_POLITE_NEGATIVE_PAST, ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.CAUSATIVE_NEGATIVE_PAST],
			[ConjugationType.TEIRU_NEGATIVE_PAST, ConjugationType.CAUSATIVE_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.CAUSATIVE_POLITE_NEGATIVE],
			[ConjugationType.TEIRU_POLITE_NEGATIVE, ConjugationType.CAUSATIVE_POLITE_NEGATIVE],
		])],
		[ConjugationType.POTENTIAL, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.NEGATIVE, ConjugationType.POTENTIAL_NEGATIVE],
			[ConjugationType.TEIRU_NEGATIVE, ConjugationType.POTENTIAL_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.POTENTIAL_POLITE],
			[ConjugationType.PAST, ConjugationType.POTENTIAL_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.POTENTIAL_NEGATIVE_PAST],
			[ConjugationType.TEIRU_NEGATIVE_PAST, ConjugationType.POTENTIAL_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.POTENTIAL_POLITE_NEGATIVE],
		])],
		[ConjugationType.PASSIVE_POLITE, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.PAST, ConjugationType.PASSIVE_POLITE_PAST],
		])],
		[ConjugationType.CAUSATIVE_POLITE, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.PAST, ConjugationType.CAUSATIVE_POLITE_PAST],
		])],
		[ConjugationType.POTENTIAL_POLITE, new Map<ConjugationType, ConjugationType>([
			[ConjugationType.PAST, ConjugationType.POTENTIAL_POLITE_PAST],
		])],
	]);

	public conjugate(plain: string, formTo: ConjugationType): string[] {
		const possibleForms: string[] = [];
		for (let i = 0; i < plain.length; i++) {
			const conjugation = plain.substring(i);

			if (this.conjugationsByPlainForm.has(conjugation)) {
				const forms = <Conjugation[]>this.conjugationsByPlainForm.get(conjugation);

				for (let j = 0; j < forms.length; j++) {
					if (forms[j].type === formTo) {
						possibleForms.push(plain.substr(0, i) + forms[j].conjugation);
					}
				}
			}
		}

		return possibleForms;
	}

	addForm (form: Conjugation) {
		// Adding to the dictionary
		if (this.formsByConjugation.has(form.conjugation)) {
			(<Conjugation[]>this.formsByConjugation.get(form.conjugation)).push(form);
		} else {
			this.formsByConjugation.set(form.conjugation, [form]);
		}

		// Adding to the reversed dictionary
		if (this.conjugationsByPlainForm.has(form.dictionaryForm)) {
			(<Conjugation[]>this.conjugationsByPlainForm.get(form.dictionaryForm)).push(form);
		} else {
			this.conjugationsByPlainForm.set(form.dictionaryForm, [form]);
		}
	}

	addFormAndDerivates (form: Conjugation) {
		this.addForm(form);

		if (this.FORMS_CONVERT.has(form.type)) {
			(<Map<ConjugationType, ConjugationType>>(this.FORMS_CONVERT.get(form.type)))
				.forEach((targetForm: ConjugationType, formCombinedWith: ConjugationType) => {
					this.conjugate(form.conjugation, formCombinedWith).forEach((conjugatedForm: string) => {
						this.addFormAndDerivates(new Conjugation(
							conjugatedForm,
							form.dictionaryForm,
							targetForm,
						));
					});
				});
		}
	}

	addStem (prefix: string, dictionaryForm: string) {
		this.addFormAndDerivates(new Conjugation(prefix,                  dictionaryForm, ConjugationType.STEM));
		this.addFormAndDerivates(new Conjugation(prefix + 'ます',         dictionaryForm, ConjugationType.POLITE));
		this.addFormAndDerivates(new Conjugation(prefix + 'ませんでした', dictionaryForm, ConjugationType.POLITE_NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(prefix + 'ません',       dictionaryForm, ConjugationType.POLITE_NEGATIVE));
		this.addFormAndDerivates(new Conjugation(prefix + 'ましょう',     dictionaryForm, ConjugationType.POLITE_VOLITIONAL));
		this.addFormAndDerivates(new Conjugation(prefix + 'ました',       dictionaryForm, ConjugationType.POLITE_PAST));
		this.addFormAndDerivates(new Conjugation(prefix + 'ませ',         dictionaryForm, ConjugationType.IMPERATIVE_POLITE));
		this.addFormAndDerivates(new Conjugation(prefix + 'たい',         dictionaryForm, ConjugationType.WISH));
	}

	addNegativeBasedForms (prefix: string, dictionaryForm: string) {
		this.addFormAndDerivates(new Conjugation(prefix + 'ない',     dictionaryForm, ConjugationType.NEGATIVE));
		this.addFormAndDerivates(new Conjugation(prefix + 'なかった', dictionaryForm, ConjugationType.NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(prefix + 'なくて', dictionaryForm, ConjugationType.NEGATIVE_TE));
	}

	addPastBasedForms (pastForm: string, dictionaryForm: string) {
		this.addFormAndDerivates(new Conjugation(pastForm, dictionaryForm, ConjugationType.PAST));
		this.addFormAndDerivates(new Conjugation(pastForm + 'ら', dictionaryForm, ConjugationType.CONDITIONAL_RA));
		this.addFormAndDerivates(new Conjugation(pastForm + 'り', dictionaryForm, ConjugationType.ENUMERATION));
	}

	addTeBasedForms (teForm: string, dictionaryForm: string) {
		this.addFormAndDerivates(new Conjugation(teForm, dictionaryForm, ConjugationType.TE));
		this.addFormAndDerivates(new Conjugation(teForm + 'おく', dictionaryForm, ConjugationType.TEOKU));

		// Teoku short = toku/doku
		let tokuForm;
		if (teForm[teForm.length - 1] === 'で') {
			tokuForm = teForm.substring(0, teForm.length - 1) + 'どく';
		} else {
			tokuForm = teForm.substring(0, teForm.length - 1) + 'とく';
		}
		this.addFormAndDerivates(new Conjugation(tokuForm, dictionaryForm, ConjugationType.TEOKU));

		this.addFormAndDerivates(new Conjugation(teForm + 'いる', dictionaryForm, ConjugationType.TEIRU));
		this.addFormAndDerivates(new Conjugation(teForm + 'いない', dictionaryForm, ConjugationType.TEIRU_NEGATIVE));
		this.addFormAndDerivates(new Conjugation(teForm + 'いなかった', dictionaryForm, ConjugationType.TEIRU_NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'いなくて', dictionaryForm, ConjugationType.TEIRU_NEGATIVE_TE));
		this.addFormAndDerivates(new Conjugation(teForm + 'います', dictionaryForm, ConjugationType.TEIRU_POLITE));
		this.addFormAndDerivates(new Conjugation(teForm + 'いませんでした', dictionaryForm, ConjugationType.TEIRU_POLITE_NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'いません', dictionaryForm, ConjugationType.TEIRU_POLITE_NEGATIVE));
		this.addFormAndDerivates(new Conjugation(teForm + 'いましょう', dictionaryForm, ConjugationType.TEIRU_POLITE_VOLITIONAL));
		this.addFormAndDerivates(new Conjugation(teForm + 'いました', dictionaryForm, ConjugationType.TEIRU_POLITE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'いたい', dictionaryForm, ConjugationType.TEIRU_WISH));

		this.addFormAndDerivates(new Conjugation(teForm + 'る', dictionaryForm, ConjugationType.TEIRU));
		this.addFormAndDerivates(new Conjugation(teForm + 'ない', dictionaryForm, ConjugationType.TEIRU_NEGATIVE));
		this.addFormAndDerivates(new Conjugation(teForm + 'なかった', dictionaryForm, ConjugationType.TEIRU_NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'なくて', dictionaryForm, ConjugationType.TEIRU_NEGATIVE_TE));
		this.addFormAndDerivates(new Conjugation(teForm + 'ます', dictionaryForm, ConjugationType.TEIRU_POLITE));
		this.addFormAndDerivates(new Conjugation(teForm + 'ませんでした', dictionaryForm, ConjugationType.TEIRU_POLITE_NEGATIVE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'ません', dictionaryForm, ConjugationType.TEIRU_POLITE_NEGATIVE));
		this.addFormAndDerivates(new Conjugation(teForm + 'ましょう', dictionaryForm, ConjugationType.TEIRU_POLITE_VOLITIONAL));
		this.addFormAndDerivates(new Conjugation(teForm + 'ました', dictionaryForm, ConjugationType.TEIRU_POLITE_PAST));
		this.addFormAndDerivates(new Conjugation(teForm + 'たい', dictionaryForm, ConjugationType.TEIRU_WISH));
	}

	hasForm(form: string): boolean {
		return this.formsByConjugation.has(form);
	}

	getForms(form: string): ReadonlyArray<Conjugation> {
		return <ReadonlyArray<Conjugation>>(this.formsByConjugation.get(form) || []);
	}
}

const conjugations = new ConjugationsClass();
export default conjugations;

conjugations.addStem('い', 'いる');
conjugations.addStem('い', 'う'  );
conjugations.addStem('え', 'える');
conjugations.addStem('き', 'きる');
conjugations.addStem('ぎ', 'ぎる');
conjugations.addStem('き', 'くる');
conjugations.addStem('き', 'く'  );
conjugations.addStem('ぎ', 'ぐ'  );
conjugations.addStem('け', 'ける');
conjugations.addStem('げ', 'げる');
conjugations.addStem('し', 'しる');
conjugations.addStem('じ', 'じる');
conjugations.addStem('し', 'す'  );
conjugations.addStem('せ', 'せる');
conjugations.addStem('ぜ', 'ぜる');
conjugations.addStem('ち', 'ちる');
conjugations.addStem('ぢ', 'ぢる');
conjugations.addStem('ち', 'つ'  );
conjugations.addStem('て', 'てる');
conjugations.addStem('で', 'でる');
conjugations.addStem('に', 'にる');
conjugations.addStem('に', 'ぬ'  );
conjugations.addStem('ね', 'ねる');
conjugations.addStem('ひ', 'ひる');
conjugations.addStem('び', 'びる');
conjugations.addStem('ぴ', 'ぴる');
conjugations.addStem('び', 'ぶ'  );
conjugations.addStem('へ', 'へる');
conjugations.addStem('べ', 'べる');
conjugations.addStem('ぺ', 'ぺる');
conjugations.addStem('み', 'みる');
conjugations.addStem('み', 'む'  );
conjugations.addStem('め', 'める');
conjugations.addStem('り', 'りる');
conjugations.addStem('り', 'る'  );
conjugations.addStem('い', 'る'  );
conjugations.addStem('れ', 'れる');

conjugations.addNegativeBasedForms('わ', 'う'  );
conjugations.addNegativeBasedForms('か', 'く'  );
conjugations.addNegativeBasedForms('が', 'ぐ'  );
conjugations.addNegativeBasedForms('さ', 'す'  );
conjugations.addNegativeBasedForms('た', 'つ'  );
conjugations.addNegativeBasedForms('な', 'ぬ'  );
conjugations.addNegativeBasedForms('ば', 'ぶ'  );
conjugations.addNegativeBasedForms('ま', 'む'  );
conjugations.addNegativeBasedForms('ら', 'る'  );
conjugations.addNegativeBasedForms('し', 'する');
conjugations.addNegativeBasedForms('こ', 'くる');
conjugations.addNegativeBasedForms('い', 'いる');
conjugations.addNegativeBasedForms('え', 'える');
conjugations.addNegativeBasedForms('き', 'きる');
conjugations.addNegativeBasedForms('け', 'ける');
conjugations.addNegativeBasedForms('し', 'しる');
conjugations.addNegativeBasedForms('せ', 'せる');
conjugations.addNegativeBasedForms('ち', 'ちる');
conjugations.addNegativeBasedForms('て', 'てる');
conjugations.addNegativeBasedForms('に', 'にる');
conjugations.addNegativeBasedForms('ね', 'ねる');
conjugations.addNegativeBasedForms('ひ', 'ひる');
conjugations.addNegativeBasedForms('へ', 'へる');
conjugations.addNegativeBasedForms('み', 'みる');
conjugations.addNegativeBasedForms('め', 'める');
conjugations.addNegativeBasedForms('り', 'りる');
conjugations.addNegativeBasedForms('れ', 'れる');
conjugations.addNegativeBasedForms('ぎ', 'ぎる');
conjugations.addNegativeBasedForms('き', 'くる');
conjugations.addNegativeBasedForms('げ', 'げる');
conjugations.addNegativeBasedForms('じ', 'じる');
conjugations.addNegativeBasedForms('ぜ', 'ぜる');
conjugations.addNegativeBasedForms('ぢ', 'ぢる');
conjugations.addNegativeBasedForms('で', 'でる');
conjugations.addNegativeBasedForms('び', 'びる');
conjugations.addNegativeBasedForms('ぴ', 'ぴる');
conjugations.addNegativeBasedForms('べ', 'べる');
conjugations.addNegativeBasedForms('ぺ', 'ぺる');

conjugations.addPastBasedForms('った',   'う'  );
conjugations.addPastBasedForms('うた',   'う'  );
conjugations.addPastBasedForms('いた',   'く'  );
conjugations.addPastBasedForms('った',   'く'  );
conjugations.addPastBasedForms('いだ',   'ぐ'  );
conjugations.addPastBasedForms('した',   'す'  );
conjugations.addPastBasedForms('った',   'つ'  );
conjugations.addPastBasedForms('んだ',   'ぬ'  );
conjugations.addPastBasedForms('んだ',   'ぶ'  );
conjugations.addPastBasedForms('んだ',   'む'  );
conjugations.addPastBasedForms('った',   'る'  );
conjugations.addPastBasedForms('た',     'る'  );
conjugations.addPastBasedForms('あった', 'ある');
conjugations.addPastBasedForms('わった', 'わる');
conjugations.addPastBasedForms('らった', 'らる');
conjugations.addPastBasedForms('やった', 'やる');
conjugations.addPastBasedForms('ゃった', 'ゃる');
conjugations.addPastBasedForms('まった', 'まる');
conjugations.addPastBasedForms('はった', 'はる');
conjugations.addPastBasedForms('なった', 'なる');
conjugations.addPastBasedForms('たった', 'たる');
conjugations.addPastBasedForms('さった', 'さる');
conjugations.addPastBasedForms('かった', 'かる');
conjugations.addPastBasedForms('がった', 'がる');
conjugations.addPastBasedForms('ざった', 'ざる');
conjugations.addPastBasedForms('だった', 'だる');
conjugations.addPastBasedForms('ばった', 'ばる');
conjugations.addPastBasedForms('ぱった', 'ぱる');

conjugations.addTeBasedForms('って', 'う');
conjugations.addTeBasedForms('うて', 'う');
conjugations.addTeBasedForms('いて', 'く');
conjugations.addTeBasedForms('って', 'く');
conjugations.addTeBasedForms('いで', 'ぐ');
conjugations.addTeBasedForms('して', 'す');
conjugations.addTeBasedForms('って', 'つ');
conjugations.addTeBasedForms('んで', 'ぬ');
conjugations.addTeBasedForms('んで', 'ぶ');
conjugations.addTeBasedForms('んで', 'む');
conjugations.addTeBasedForms('って', 'る');
conjugations.addTeBasedForms('て',   'る');

conjugations.addFormAndDerivates(new Conjugation('え'  , 'う'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('け'  , 'く'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('げ'  , 'ぐ'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('せ'  , 'す'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('て'  , 'つ'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ね'  , 'ぬ'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('べ'  , 'ぶ'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('め'  , 'む'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('れ'  , 'る'  , ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('いろ', 'いる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('えろ', 'える', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('きろ', 'きる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('けろ', 'ける', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('しろ', 'しる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('せろ', 'せる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ちろ', 'ちる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('てろ', 'てる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('にろ', 'にる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ねろ', 'ねる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ひろ', 'ひる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('へろ', 'へる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('みろ', 'みる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('めろ', 'める', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('りろ', 'りる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('れろ', 'れる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('れ',   'れる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'わる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'らる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'やる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'ゃる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'まる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'はる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'なる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'たる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'さる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'かる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぎろ', 'ぎる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('げろ', 'げる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('じろ', 'じる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぜろ', 'ぜる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぢろ', 'ぢる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('でろ', 'でる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('びろ', 'びる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぴろ', 'ぴる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('べろ', 'べる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぺろ', 'ぺる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('あい', 'ある', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('わい', 'わる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('らい', 'らる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('やい', 'やる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ゃい', 'ゃる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('まい', 'まる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('はい', 'はる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ない', 'なる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('たい', 'たる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('さい', 'さる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('かい', 'かる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('がい', 'がる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ざい', 'ざる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('だい', 'だる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ばい', 'ばる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('ぱい', 'ぱる', ConjugationType.IMPERATIVE));

conjugations.addFormAndDerivates(new Conjugation('えば'  , 'う'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('けば'  , 'く'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('げば'  , 'ぐ'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('せば'  , 'す'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('てば'  , 'つ'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('ねば'  , 'ぬ'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('べば'  , 'ぶ'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('めば'  , 'む'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('れば'  , 'る'  , ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('くれば', 'くる', ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('すれば', 'する', ConjugationType.CONDITIONAL));

conjugations.addFormAndDerivates(new Conjugation('おう'  , 'う'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('こう'  , 'く'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('ごう'  , 'ぐ'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('そう'  , 'す'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('とう'  , 'つ'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('のう'  , 'ぬ'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('ぼう'  , 'ぶ'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('もう'  , 'む'  , ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('よう'  , 'る'  , ConjugationType.VOLITIONAL));

conjugations.addFormAndDerivates(new Conjugation('われる'  , 'う'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('かれる'  , 'く'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('がれる'  , 'ぐ'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('される'  , 'す'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('たれる'  , 'つ'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('なれる'  , 'ぬ'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('ばれる'  , 'ぶ'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('まれる'  , 'む'  , ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('られる'  , 'る'  , ConjugationType.PASSIVE));

conjugations.addFormAndDerivates(new Conjugation('わせる'  , 'う'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('かせる'  , 'く'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('がせる'  , 'ぐ'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('させる'  , 'す'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('たせる'  , 'つ'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('なせる'  , 'ぬ'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('ばせる'  , 'ぶ'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('ませる'  , 'む'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('させる'  , 'る'  , ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('らせる'  , 'る'  , ConjugationType.CAUSATIVE));

conjugations.addFormAndDerivates(new Conjugation('える'    , 'う'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ける'    , 'く'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('げる'    , 'ぐ'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('せる'    , 'す'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('てる'    , 'つ'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ねる'    , 'ぬ'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('べる'    , 'ぶ'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('める'    , 'む'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('れる'    , 'る'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('られる'  , 'る'  , ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('せる',     'する', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('あり得る', 'ある', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('わり得る', 'わる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('らり得る', 'らる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('やり得る', 'やる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ゃり得る', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('まり得る', 'まる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('はり得る', 'はる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('なり得る', 'なる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('たり得る', 'たる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('さり得る', 'さる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('かり得る', 'かる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('がり得る', 'がる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ざり得る', 'ざる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('だり得る', 'だる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ばり得る', 'ばる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ぱり得る', 'ぱる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ありえる', 'ある', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('わりえる', 'わる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('らりえる', 'らる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('やりえる', 'やる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ゃりえる', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('まりえる', 'まる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('はりえる', 'はる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('なりえる', 'なる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('たりえる', 'たる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('さりえる', 'さる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('かりえる', 'かる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('がりえる', 'がる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ざりえる', 'ざる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('だりえる', 'だる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ばりえる', 'ばる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ぱりえる', 'ぱる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ありうる', 'ある', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('わりうる', 'わる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('らりうる', 'らる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('やりうる', 'やる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ゃりうる', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('まりうる', 'まる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('はりうる', 'はる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('なりうる', 'なる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('たりうる', 'たる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('さりうる', 'さる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('かりうる', 'かる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('がりうる', 'がる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ざりうる', 'ざる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('だりうる', 'だる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ばりうる', 'ばる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('ぱりうる', 'ぱる', ConjugationType.POTENTIAL));

conjugations.addFormAndDerivates(new Conjugation('う'  , 'う'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('く'  , 'く'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('ぐ'  , 'ぐ'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('す'  , 'す'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('つ'  , 'つ'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('ぬ'  , 'ぬ'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('ぶ'  , 'ぶ'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('む'  , 'む'  , ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('る'  , 'る'  , ConjugationType.PLAIN));

// Adjectives

conjugations.addFormAndDerivates(new Conjugation('い', 'い', ConjugationType.ADJECTIVE_PLAIN));
conjugations.addFormAndDerivates(new Conjugation('しい', 'しい', ConjugationType.ADJECTIVE_PLAIN));

conjugations.addFormAndDerivates(new Conjugation('め', 'い', ConjugationType.ADJECTIVE_ME));
conjugations.addFormAndDerivates(new Conjugation('しめ', 'しい', ConjugationType.ADJECTIVE_ME));
conjugations.addFormAndDerivates(new Conjugation('目', 'い', ConjugationType.ADJECTIVE_ME));
conjugations.addFormAndDerivates(new Conjugation('し目', 'しい', ConjugationType.ADJECTIVE_ME));

conjugations.addFormAndDerivates(new Conjugation('かった', 'い', ConjugationType.ADJECTIVE_PAST));
conjugations.addFormAndDerivates(new Conjugation('しかった', 'しい', ConjugationType.ADJECTIVE_PAST));

conjugations.addFormAndDerivates(new Conjugation('くない', 'い', ConjugationType.ADJECTIVE_NEGATIVE));
conjugations.addFormAndDerivates(new Conjugation('しくない', 'しい', ConjugationType.ADJECTIVE_NEGATIVE));

conjugations.addFormAndDerivates(new Conjugation('くなかった', 'い', ConjugationType.ADJECTIVE_NEGATIVE_PAST));
conjugations.addFormAndDerivates(new Conjugation('しくなかった', 'しい', ConjugationType.ADJECTIVE_NEGATIVE_PAST));

conjugations.addFormAndDerivates(new Conjugation('くありません', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));
conjugations.addFormAndDerivates(new Conjugation('しくありません', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));

conjugations.addFormAndDerivates(new Conjugation('くありませんでした', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));
conjugations.addFormAndDerivates(new Conjugation('しくありませんでした', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));

// suru

conjugations.addStem('し', 'する');
conjugations.addNegativeBasedForms('し', 'する');
conjugations.addNegativeBasedForms('さ', 'する');
conjugations.addPastBasedForms('した', 'する');
conjugations.addTeBasedForms('して', 'する');
conjugations.addFormAndDerivates(new Conjugation('する',   'する', ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('す',     'する', ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('ず',     'する', ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('しよう', 'する', ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('される', 'する', ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('させる', 'する', ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('できる', 'する', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('せる',   'する', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('しろ',   'する', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('せよ',   'する', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('すれば', 'する', ConjugationType.CONDITIONAL));

// kuru

conjugations.addStem('来', '来る');
conjugations.addStem('き', 'くる');
conjugations.addNegativeBasedForms('来', '来る');
conjugations.addNegativeBasedForms('こ', 'くる');
conjugations.addPastBasedForms('来た', '来る');
conjugations.addPastBasedForms('きた', 'くる');
conjugations.addTeBasedForms('来て', '来る');
conjugations.addTeBasedForms('きて', 'くる');
conjugations.addFormAndDerivates(new Conjugation('来る',     '来る', ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('くる',     'くる', ConjugationType.PLAIN));
conjugations.addFormAndDerivates(new Conjugation('来よう',   '来る', ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('こよう',   'くる', ConjugationType.VOLITIONAL));
conjugations.addFormAndDerivates(new Conjugation('来られる', '来る', ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('こられる', 'くる', ConjugationType.PASSIVE));
conjugations.addFormAndDerivates(new Conjugation('来させる', '来る', ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('こさせる', 'くる', ConjugationType.CAUSATIVE));
conjugations.addFormAndDerivates(new Conjugation('来られる', '来る', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('来れる',   '来る', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('こられる', 'くる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('これる',   'くる', ConjugationType.POTENTIAL));
conjugations.addFormAndDerivates(new Conjugation('来い',     '来る', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('こい',     'くる', ConjugationType.IMPERATIVE));
conjugations.addFormAndDerivates(new Conjugation('来れば',   '来る', ConjugationType.CONDITIONAL));
conjugations.addFormAndDerivates(new Conjugation('くれば',   'くる', ConjugationType.CONDITIONAL));

// desu

conjugations.addNegativeBasedForms('じゃ', 'だ');
conjugations.addNegativeBasedForms('では', 'だ');
conjugations.addTeBasedForms('であって', 'だ');
conjugations.addForm(new Conjugation('じゃないです',         'だ', ConjugationType.POLITE_NEGATIVE));
conjugations.addForm(new Conjugation('じゃありません',       'だ', ConjugationType.POLITE_NEGATIVE));
conjugations.addForm(new Conjugation('ではありません',       'だ', ConjugationType.POLITE_NEGATIVE));
conjugations.addForm(new Conjugation('でございません',       'だ', ConjugationType.POLITE_NEGATIVE));
conjugations.addForm(new Conjugation('じゃないでした',       'だ', ConjugationType.POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('じゃなかったです',     'だ', ConjugationType.POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('じゃありませんでした', 'だ', ConjugationType.POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('ではありませんでした', 'だ', ConjugationType.POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('でございませんでした', 'だ', ConjugationType.POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('でした',               'だ', ConjugationType.POLITE_PAST));
conjugations.addForm(new Conjugation('でありました',         'だ', ConjugationType.POLITE_PAST));
conjugations.addForm(new Conjugation('でございました',       'だ', ConjugationType.POLITE_PAST));
conjugations.addForm(new Conjugation('です',                 'だ', ConjugationType.POLITE));
conjugations.addForm(new Conjugation('であります',           'だ', ConjugationType.POLITE));
conjugations.addForm(new Conjugation('でございます',         'だ', ConjugationType.POLITE));
conjugations.addForm(new Conjugation('だ',                   'だ', ConjugationType.STEM));
conjugations.addForm(new Conjugation('である',               'だ', ConjugationType.STEM));
conjugations.addForm(new Conjugation('じゃ',                 'だ', ConjugationType.STEM));
conjugations.addForm(new Conjugation('だった',               'だ', ConjugationType.PAST));
conjugations.addForm(new Conjugation('であった',             'だ', ConjugationType.PAST));
