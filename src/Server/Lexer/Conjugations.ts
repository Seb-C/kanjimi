import ConjugationType from 'Common/Types/ConjugationType';
import Conjugation from 'Common/Models/Conjugation';

class ConjugationsClass {
	readonly formsByConjugation: Map<string, Conjugation[]> = new Map();
	readonly conjugationsByPlainForm: Map<string, Conjugation[]> = new Map();

	private readonly FORMS_CONVERT: Map<
		ConjugationType,
		Map<ConjugationType, ConjugationType>
	> = new Map([
		[ConjugationType.PASSIVE, new Map([
			[ConjugationType.NEGATIVE, ConjugationType.PASSIVE_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.PASSIVE_POLITE],
			[ConjugationType.PAST, ConjugationType.PASSIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.PASSIVE_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.PASSIVE_POLITE_NEGATIVE],
		])],
		[ConjugationType.CAUSATIVE, new Map([
			[ConjugationType.NEGATIVE, ConjugationType.CAUSATIVE_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.CAUSATIVE_POLITE],
			[ConjugationType.PAST, ConjugationType.CAUSATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.CAUSATIVE_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.CAUSATIVE_POLITE_NEGATIVE],
		])],
		[ConjugationType.POTENTIAL, new Map([
			[ConjugationType.NEGATIVE, ConjugationType.POTENTIAL_NEGATIVE],
			[ConjugationType.POLITE, ConjugationType.POTENTIAL_POLITE],
			[ConjugationType.PAST, ConjugationType.POTENTIAL_PAST],
			[ConjugationType.POLITE_NEGATIVE_PAST, ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST],
			[ConjugationType.NEGATIVE_PAST, ConjugationType.POTENTIAL_NEGATIVE_PAST],
			[ConjugationType.POLITE_NEGATIVE, ConjugationType.POTENTIAL_POLITE_NEGATIVE],
		])],
		[ConjugationType.PASSIVE_POLITE, new Map([
			[ConjugationType.PAST, ConjugationType.PASSIVE_POLITE_PAST],
		])],
		[ConjugationType.CAUSATIVE_POLITE, new Map([
			[ConjugationType.PAST, ConjugationType.CAUSATIVE_POLITE_PAST],
		])],
		[ConjugationType.POTENTIAL_POLITE, new Map([
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

		if (this.FORMS_CONVERT.has(form.type)) {
			(<Map<ConjugationType, ConjugationType>>(this.FORMS_CONVERT.get(form.type)))
				.forEach((targetForm: ConjugationType, formCombinedWith: ConjugationType) => {
					this.conjugate(form.conjugation, formCombinedWith).forEach((conjugatedForm: string) => {
						this.addForm(new Conjugation(
							conjugatedForm,
							form.dictionaryForm,
							targetForm,
						));
					});
				});
		}
	}

	addStem (prefix: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new Conjugation(prefix,                  dictionaryForm, ConjugationType.STEM));
		this.addForm(new Conjugation(prefix + 'ます',         dictionaryForm, ConjugationType.POLITE));
		this.addForm(new Conjugation(prefix + 'ませんでした', dictionaryForm, ConjugationType.POLITE_NEGATIVE_PAST));
		this.addForm(new Conjugation(prefix + 'ません',       dictionaryForm, ConjugationType.POLITE_NEGATIVE));
		this.addForm(new Conjugation(prefix + 'ましょう',     dictionaryForm, ConjugationType.POLITE_VOLITIONAL));
		this.addForm(new Conjugation(prefix + 'ました',       dictionaryForm, ConjugationType.POLITE_PAST));
		this.addForm(new Conjugation(prefix + 'ませ',         dictionaryForm, ConjugationType.IMPERATIVE_POLITE));
		this.addForm(new Conjugation(prefix + 'たい',         dictionaryForm, ConjugationType.WISH));
		// tslint:enable
	}

	addNegativeBasedForms (prefix: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new Conjugation(prefix + 'ない',     dictionaryForm, ConjugationType.NEGATIVE));
		this.addForm(new Conjugation(prefix + 'なかった', dictionaryForm, ConjugationType.NEGATIVE_PAST));
		// tslint:enable
	}

	addPastBasedForms (pastForm: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new Conjugation(pastForm, dictionaryForm, ConjugationType.PAST));
		this.addForm(new Conjugation(pastForm + 'ら', dictionaryForm, ConjugationType.CONDITIONAL_RA));
		this.addForm(new Conjugation(pastForm + 'り', dictionaryForm, ConjugationType.ENUMERATION));
		// tslint:enable
	}

	addTeBasedForms (teForm: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new Conjugation(teForm, dictionaryForm, ConjugationType.TE));
		this.addForm(new Conjugation(teForm + 'いる', dictionaryForm, ConjugationType.TEIRU));
		this.addForm(new Conjugation(teForm + 'る', dictionaryForm, ConjugationType.TEIRU));
		this.addForm(new Conjugation(teForm + 'おく', dictionaryForm, ConjugationType.TEOKU));

		// Teoku short = toku/doku
		let tokuForm;
		if (teForm[teForm.length - 1] === 'で') {
			tokuForm = teForm.substring(0, teForm.length - 1) + 'どく';
		} else {
			tokuForm = teForm.substring(0, teForm.length - 1) + 'とく';
		}
		this.addForm(new Conjugation(tokuForm, dictionaryForm, ConjugationType.TEOKU));
		// tslint:enable
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

// tslint:disable

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

conjugations.addForm(new Conjugation('え'  , 'う'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('け'  , 'く'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('げ'  , 'ぐ'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('せ'  , 'す'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('て'  , 'つ'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ね'  , 'ぬ'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('べ'  , 'ぶ'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('め'  , 'む'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('れ'  , 'る'  , ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('いろ', 'いる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('えろ', 'える', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('きろ', 'きる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('けろ', 'ける', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('しろ', 'しる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('せろ', 'せる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ちろ', 'ちる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('てろ', 'てる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('にろ', 'にる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ねろ', 'ねる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ひろ', 'ひる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('へろ', 'へる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('みろ', 'みる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('めろ', 'める', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('りろ', 'りる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('れろ', 'れる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('れ',   'れる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'わる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'らる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'やる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'ゃる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'まる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'はる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'なる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'たる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'さる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'かる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぎろ', 'ぎる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('げろ', 'げる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('じろ', 'じる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぜろ', 'ぜる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぢろ', 'ぢる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('でろ', 'でる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('びろ', 'びる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぴろ', 'ぴる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('べろ', 'べる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぺろ', 'ぺる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('あい', 'ある', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('わい', 'わる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('らい', 'らる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('やい', 'やる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ゃい', 'ゃる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('まい', 'まる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('はい', 'はる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ない', 'なる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('たい', 'たる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('さい', 'さる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('かい', 'かる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('がい', 'がる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ざい', 'ざる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('だい', 'だる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ばい', 'ばる', ConjugationType.IMPERATIVE));
conjugations.addForm(new Conjugation('ぱい', 'ぱる', ConjugationType.IMPERATIVE));

conjugations.addForm(new Conjugation('えば'  , 'う'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('けば'  , 'く'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('げば'  , 'ぐ'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('せば'  , 'す'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('てば'  , 'つ'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('ねば'  , 'ぬ'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('べば'  , 'ぶ'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('めば'  , 'む'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('れば'  , 'る'  , ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('くれば', 'くる', ConjugationType.CONDITIONAL));
conjugations.addForm(new Conjugation('すれば', 'する', ConjugationType.CONDITIONAL));

conjugations.addForm(new Conjugation('おう'  , 'う'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('こう'  , 'く'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('ごう'  , 'ぐ'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('そう'  , 'す'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('とう'  , 'つ'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('のう'  , 'ぬ'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('ぼう'  , 'ぶ'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('もう'  , 'む'  , ConjugationType.VOLITIONAL));
conjugations.addForm(new Conjugation('よう'  , 'る'  , ConjugationType.VOLITIONAL));

conjugations.addForm(new Conjugation('われる'  , 'う'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('かれる'  , 'く'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('がれる'  , 'ぐ'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('される'  , 'す'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('たれる'  , 'つ'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('なれる'  , 'ぬ'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('ばれる'  , 'ぶ'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('まれる'  , 'む'  , ConjugationType.PASSIVE));
conjugations.addForm(new Conjugation('られる'  , 'る'  , ConjugationType.PASSIVE));

conjugations.addForm(new Conjugation('わせる'  , 'う'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('かせる'  , 'く'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('がせる'  , 'ぐ'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('させる'  , 'す'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('たせる'  , 'つ'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('なせる'  , 'ぬ'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('ばせる'  , 'ぶ'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('ませる'  , 'む'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('させる'  , 'る'  , ConjugationType.CAUSATIVE));
conjugations.addForm(new Conjugation('らせる'  , 'る'  , ConjugationType.CAUSATIVE));

conjugations.addForm(new Conjugation('える'    , 'う'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ける'    , 'く'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('げる'    , 'ぐ'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('せる'    , 'す'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('てる'    , 'つ'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ねる'    , 'ぬ'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('べる'    , 'ぶ'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('める'    , 'む'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('れる'    , 'る'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('られる'  , 'る'  , ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('せる',     'する', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('あり得る', 'ある', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('わり得る', 'わる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('らり得る', 'らる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('やり得る', 'やる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ゃり得る', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('まり得る', 'まる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('はり得る', 'はる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('なり得る', 'なる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('たり得る', 'たる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('さり得る', 'さる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('かり得る', 'かる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('がり得る', 'がる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ざり得る', 'ざる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('だり得る', 'だる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ばり得る', 'ばる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ぱり得る', 'ぱる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ありえる', 'ある', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('わりえる', 'わる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('らりえる', 'らる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('やりえる', 'やる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ゃりえる', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('まりえる', 'まる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('はりえる', 'はる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('なりえる', 'なる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('たりえる', 'たる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('さりえる', 'さる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('かりえる', 'かる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('がりえる', 'がる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ざりえる', 'ざる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('だりえる', 'だる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ばりえる', 'ばる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ぱりえる', 'ぱる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ありうる', 'ある', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('わりうる', 'わる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('らりうる', 'らる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('やりうる', 'やる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ゃりうる', 'ゃる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('まりうる', 'まる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('はりうる', 'はる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('なりうる', 'なる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('たりうる', 'たる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('さりうる', 'さる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('かりうる', 'かる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('がりうる', 'がる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ざりうる', 'ざる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('だりうる', 'だる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ばりうる', 'ばる', ConjugationType.POTENTIAL));
conjugations.addForm(new Conjugation('ぱりうる', 'ぱる', ConjugationType.POTENTIAL));

conjugations.addForm(new Conjugation('う'  , 'う'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('く'  , 'く'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('ぐ'  , 'ぐ'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('す'  , 'す'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('つ'  , 'つ'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('ぬ'  , 'ぬ'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('ぶ'  , 'ぶ'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('む'  , 'む'  , ConjugationType.PLAIN));
conjugations.addForm(new Conjugation('る'  , 'る'  , ConjugationType.PLAIN));

// Adjectives

conjugations.addForm(new Conjugation('い', 'い', ConjugationType.ADJECTIVE_PLAIN));
conjugations.addForm(new Conjugation('しい', 'しい', ConjugationType.ADJECTIVE_PLAIN));

conjugations.addForm(new Conjugation('め', 'い', ConjugationType.ADJECTIVE_ME));
conjugations.addForm(new Conjugation('しめ', 'しい', ConjugationType.ADJECTIVE_ME));
conjugations.addForm(new Conjugation('目', 'い', ConjugationType.ADJECTIVE_ME));
conjugations.addForm(new Conjugation('し目', 'しい', ConjugationType.ADJECTIVE_ME));

conjugations.addForm(new Conjugation('かった', 'い', ConjugationType.ADJECTIVE_PAST));
conjugations.addForm(new Conjugation('しかった', 'しい', ConjugationType.ADJECTIVE_PAST));

conjugations.addForm(new Conjugation('くない', 'い', ConjugationType.ADJECTIVE_NEGATIVE));
conjugations.addForm(new Conjugation('しくない', 'しい', ConjugationType.ADJECTIVE_NEGATIVE));

conjugations.addForm(new Conjugation('くなかった', 'い', ConjugationType.ADJECTIVE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('しくなかった', 'しい', ConjugationType.ADJECTIVE_NEGATIVE_PAST));

conjugations.addForm(new Conjugation('くありません', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));
conjugations.addForm(new Conjugation('しくありません', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));

conjugations.addForm(new Conjugation('くありませんでした', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));
conjugations.addForm(new Conjugation('しくありませんでした', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));

// tslint:enable
