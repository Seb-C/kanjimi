import ConjugationType from 'Lexer/Conjugation/ConjugationType';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';

class ConjugationFormsClass {
	readonly formsByConjugation: Map<string, ConjugationForm[]> = new Map();
	readonly conjugationsByPlainForm: Map<string, ConjugationForm[]> = new Map();

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
				const forms = <ConjugationForm[]>this.conjugationsByPlainForm.get(conjugation);

				for (let j = 0; j < forms.length; j++) {
					if (forms[j].type === formTo) {
						possibleForms.push(plain.substr(0, i) + forms[j].conjugation);
					}
				}
			}
		}

		return possibleForms;
	}

	addForm (form: ConjugationForm) {
		// Adding to the dictionary
		if (this.formsByConjugation.has(form.conjugation)) {
			(<ConjugationForm[]>this.formsByConjugation.get(form.conjugation)).push(form);
		} else {
			this.formsByConjugation.set(form.conjugation, [form]);
		}

		// Adding to the reversed dictionary
		if (this.conjugationsByPlainForm.has(form.dictionaryForm)) {
			(<ConjugationForm[]>this.conjugationsByPlainForm.get(form.dictionaryForm)).push(form);
		} else {
			this.conjugationsByPlainForm.set(form.dictionaryForm, [form]);
		}

		if (this.FORMS_CONVERT.has(form.type)) {
			(<Map<ConjugationType, ConjugationType>>(this.FORMS_CONVERT.get(form.type)))
				.forEach((targetForm: ConjugationType, formCombinedWith: ConjugationType) => {
					this.conjugate(form.conjugation, formCombinedWith).forEach((conjugatedForm: string) => {
						this.addForm(new ConjugationForm(
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
		this.addForm(new ConjugationForm(prefix,                  dictionaryForm, ConjugationType.STEM));
		this.addForm(new ConjugationForm(prefix + 'ます',         dictionaryForm, ConjugationType.POLITE));
		this.addForm(new ConjugationForm(prefix + 'ませんでした', dictionaryForm, ConjugationType.POLITE_NEGATIVE_PAST));
		this.addForm(new ConjugationForm(prefix + 'ません',       dictionaryForm, ConjugationType.POLITE_NEGATIVE));
		this.addForm(new ConjugationForm(prefix + 'ましょう',     dictionaryForm, ConjugationType.POLITE_VOLITIONAL));
		this.addForm(new ConjugationForm(prefix + 'ました',       dictionaryForm, ConjugationType.POLITE_PAST));
		this.addForm(new ConjugationForm(prefix + 'ませ',         dictionaryForm, ConjugationType.IMPERATIVE_POLITE));
		this.addForm(new ConjugationForm(prefix + 'たい',         dictionaryForm, ConjugationType.WISH));
		// tslint:enable
	}

	addNegativeBasedForms (prefix: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new ConjugationForm(prefix + 'ない',     dictionaryForm, ConjugationType.NEGATIVE));
		this.addForm(new ConjugationForm(prefix + 'なかった', dictionaryForm, ConjugationType.NEGATIVE_PAST));
		// tslint:enable
	}

	addPastBasedForms (pastForm: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new ConjugationForm(pastForm, dictionaryForm, ConjugationType.PAST));
		this.addForm(new ConjugationForm(pastForm + 'ら', dictionaryForm, ConjugationType.CONDITIONAL_RA));
		this.addForm(new ConjugationForm(pastForm + 'り', dictionaryForm, ConjugationType.ENUMERATION));
		// tslint:enable
	}

	hasForm(form: string): boolean {
		return this.formsByConjugation.has(form);
	}

	getForms(form: string): ReadonlyArray<ConjugationForm> {
		return <ReadonlyArray<ConjugationForm>>(this.formsByConjugation.get(form) || []);
	}
}

const conjugationForms = new ConjugationFormsClass();
export default conjugationForms;

// tslint:disable

conjugationForms.addStem('い', 'いる');
conjugationForms.addStem('い', 'う'  );
conjugationForms.addStem('え', 'える');
conjugationForms.addStem('き', 'きる');
conjugationForms.addStem('ぎ', 'ぎる');
conjugationForms.addStem('き', 'くる');
conjugationForms.addStem('き', 'く'  );
conjugationForms.addStem('ぎ', 'ぐ'  );
conjugationForms.addStem('け', 'ける');
conjugationForms.addStem('げ', 'げる');
conjugationForms.addStem('し', 'しる');
conjugationForms.addStem('じ', 'じる');
conjugationForms.addStem('し', 'す'  );
conjugationForms.addStem('せ', 'せる');
conjugationForms.addStem('ぜ', 'ぜる');
conjugationForms.addStem('ち', 'ちる');
conjugationForms.addStem('ぢ', 'ぢる');
conjugationForms.addStem('ち', 'つ'  );
conjugationForms.addStem('て', 'てる');
conjugationForms.addStem('で', 'でる');
conjugationForms.addStem('に', 'にる');
conjugationForms.addStem('に', 'ぬ'  );
conjugationForms.addStem('ね', 'ねる');
conjugationForms.addStem('ひ', 'ひる');
conjugationForms.addStem('び', 'びる');
conjugationForms.addStem('ぴ', 'ぴる');
conjugationForms.addStem('び', 'ぶ'  );
conjugationForms.addStem('へ', 'へる');
conjugationForms.addStem('べ', 'べる');
conjugationForms.addStem('ぺ', 'ぺる');
conjugationForms.addStem('み', 'みる');
conjugationForms.addStem('み', 'む'  );
conjugationForms.addStem('め', 'める');
conjugationForms.addStem('り', 'りる');
conjugationForms.addStem('り', 'る'  );
conjugationForms.addStem('れ', 'れる');

conjugationForms.addNegativeBasedForms('わ', 'う'  );
conjugationForms.addNegativeBasedForms('か', 'く'  );
conjugationForms.addNegativeBasedForms('が', 'ぐ'  );
conjugationForms.addNegativeBasedForms('さ', 'す'  );
conjugationForms.addNegativeBasedForms('た', 'つ'  );
conjugationForms.addNegativeBasedForms('な', 'ぬ'  );
conjugationForms.addNegativeBasedForms('ば', 'ぶ'  );
conjugationForms.addNegativeBasedForms('ま', 'む'  );
conjugationForms.addNegativeBasedForms('ら', 'る'  );
conjugationForms.addNegativeBasedForms('し', 'する');
conjugationForms.addNegativeBasedForms('こ', 'くる');
conjugationForms.addNegativeBasedForms('い', 'いる');
conjugationForms.addNegativeBasedForms('え', 'える');
conjugationForms.addNegativeBasedForms('き', 'きる');
conjugationForms.addNegativeBasedForms('け', 'ける');
conjugationForms.addNegativeBasedForms('し', 'しる');
conjugationForms.addNegativeBasedForms('せ', 'せる');
conjugationForms.addNegativeBasedForms('ち', 'ちる');
conjugationForms.addNegativeBasedForms('て', 'てる');
conjugationForms.addNegativeBasedForms('に', 'にる');
conjugationForms.addNegativeBasedForms('ね', 'ねる');
conjugationForms.addNegativeBasedForms('ひ', 'ひる');
conjugationForms.addNegativeBasedForms('へ', 'へる');
conjugationForms.addNegativeBasedForms('み', 'みる');
conjugationForms.addNegativeBasedForms('め', 'める');
conjugationForms.addNegativeBasedForms('り', 'りる');
conjugationForms.addNegativeBasedForms('れ', 'れる');
conjugationForms.addNegativeBasedForms('ぎ', 'ぎる');
conjugationForms.addNegativeBasedForms('き', 'くる');
conjugationForms.addNegativeBasedForms('げ', 'げる');
conjugationForms.addNegativeBasedForms('じ', 'じる');
conjugationForms.addNegativeBasedForms('ぜ', 'ぜる');
conjugationForms.addNegativeBasedForms('ぢ', 'ぢる');
conjugationForms.addNegativeBasedForms('で', 'でる');
conjugationForms.addNegativeBasedForms('び', 'びる');
conjugationForms.addNegativeBasedForms('ぴ', 'ぴる');
conjugationForms.addNegativeBasedForms('べ', 'べる');
conjugationForms.addNegativeBasedForms('ぺ', 'ぺる');

conjugationForms.addPastBasedForms('った',   'う'  );
conjugationForms.addPastBasedForms('うた',   'う'  );
conjugationForms.addPastBasedForms('いた',   'く'  );
conjugationForms.addPastBasedForms('った',   'く'  );
conjugationForms.addPastBasedForms('いだ',   'ぐ'  );
conjugationForms.addPastBasedForms('した',   'す'  );
conjugationForms.addPastBasedForms('った',   'つ'  );
conjugationForms.addPastBasedForms('んだ',   'ぬ'  );
conjugationForms.addPastBasedForms('んだ',   'ぶ'  );
conjugationForms.addPastBasedForms('んだ',   'む'  );
conjugationForms.addPastBasedForms('った',   'る'  );
conjugationForms.addPastBasedForms('た',     'る'  );
conjugationForms.addPastBasedForms('あった', 'ある');
conjugationForms.addPastBasedForms('わった', 'わる');
conjugationForms.addPastBasedForms('らった', 'らる');
conjugationForms.addPastBasedForms('やった', 'やる');
conjugationForms.addPastBasedForms('ゃった', 'ゃる');
conjugationForms.addPastBasedForms('まった', 'まる');
conjugationForms.addPastBasedForms('はった', 'はる');
conjugationForms.addPastBasedForms('なった', 'なる');
conjugationForms.addPastBasedForms('たった', 'たる');
conjugationForms.addPastBasedForms('さった', 'さる');
conjugationForms.addPastBasedForms('かった', 'かる');
conjugationForms.addPastBasedForms('がった', 'がる');
conjugationForms.addPastBasedForms('ざった', 'ざる');
conjugationForms.addPastBasedForms('だった', 'だる');
conjugationForms.addPastBasedForms('ばった', 'ばる');
conjugationForms.addPastBasedForms('ぱった', 'ぱる');

conjugationForms.addForm(new ConjugationForm('って', 'う'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('うて', 'う'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('いて', 'く'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('いで', 'ぐ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('して', 'す'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('って', 'つ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'ぬ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'ぶ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'む'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('って', 'る'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('て',   'る'  , ConjugationType.TE));

conjugationForms.addForm(new ConjugationForm('え'  , 'う'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('け'  , 'く'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('げ'  , 'ぐ'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('せ'  , 'す'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('て'  , 'つ'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ね'  , 'ぬ'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('べ'  , 'ぶ'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('め'  , 'む'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('れ'  , 'る'  , ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('いろ', 'いる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('えろ', 'える', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('きろ', 'きる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('けろ', 'ける', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('しろ', 'しる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('せろ', 'せる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ちろ', 'ちる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('てろ', 'てる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('にろ', 'にる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ねろ', 'ねる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ひろ', 'ひる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('へろ', 'へる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('みろ', 'みる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('めろ', 'める', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('りろ', 'りる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('れろ', 'れる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'わる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'らる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'やる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'ゃる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'まる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'はる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'なる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'たる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'さる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'かる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぎろ', 'ぎる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('げろ', 'げる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('じろ', 'じる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぜろ', 'ぜる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぢろ', 'ぢる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('でろ', 'でる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('びろ', 'びる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぴろ', 'ぴる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('べろ', 'べる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぺろ', 'ぺる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('あい', 'ある', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('わい', 'わる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('らい', 'らる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('やい', 'やる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ゃい', 'ゃる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('まい', 'まる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('はい', 'はる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ない', 'なる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('たい', 'たる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('さい', 'さる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('かい', 'かる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('がい', 'がる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ざい', 'ざる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('だい', 'だる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ばい', 'ばる', ConjugationType.IMPERATIVE));
conjugationForms.addForm(new ConjugationForm('ぱい', 'ぱる', ConjugationType.IMPERATIVE));

conjugationForms.addForm(new ConjugationForm('えば'  , 'う'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('けば'  , 'く'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('げば'  , 'ぐ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('せば'  , 'す'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('てば'  , 'つ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ねば'  , 'ぬ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('べば'  , 'ぶ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('めば'  , 'む'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('れば'  , 'る'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('くれば', 'くる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('すれば', 'する', ConjugationType.CONDITIONAL));

conjugationForms.addForm(new ConjugationForm('おう'  , 'う'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('こう'  , 'く'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ごう'  , 'ぐ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('そう'  , 'す'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('とう'  , 'つ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('のう'  , 'ぬ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ぼう'  , 'ぶ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('もう'  , 'む'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('よう'  , 'る'  , ConjugationType.VOLITIONAL));

conjugationForms.addForm(new ConjugationForm('われる'  , 'う'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('かれる'  , 'く'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('がれる'  , 'ぐ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('される'  , 'す'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('たれる'  , 'つ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('なれる'  , 'ぬ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('ばれる'  , 'ぶ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('まれる'  , 'む'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('られる'  , 'る'  , ConjugationType.PASSIVE));

conjugationForms.addForm(new ConjugationForm('わせる'  , 'う'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('かせる'  , 'く'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('がせる'  , 'ぐ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('させる'  , 'す'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('たせる'  , 'つ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('なせる'  , 'ぬ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ばせる'  , 'ぶ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ませる'  , 'む'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('させる'  , 'る'  , ConjugationType.CAUSATIVE));

conjugationForms.addForm(new ConjugationForm('える'    , 'う'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ける'    , 'く'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('げる'    , 'ぐ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('せる'    , 'す'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('てる'    , 'つ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ねる'    , 'ぬ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('べる'    , 'ぶ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('める'    , 'む'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('れる'    , 'る'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('られる'  , 'る'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('せる',     'する', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('あり得る', 'ある', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('わり得る', 'わる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('らり得る', 'らる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('やり得る', 'やる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ゃり得る', 'ゃる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('まり得る', 'まる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('はり得る', 'はる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('なり得る', 'なる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('たり得る', 'たる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('さり得る', 'さる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('かり得る', 'かる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('がり得る', 'がる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ざり得る', 'ざる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('だり得る', 'だる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ばり得る', 'ばる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ぱり得る', 'ぱる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ありえる', 'ある', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('わりえる', 'わる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('らりえる', 'らる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('やりえる', 'やる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ゃりえる', 'ゃる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('まりえる', 'まる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('はりえる', 'はる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('なりえる', 'なる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('たりえる', 'たる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('さりえる', 'さる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('かりえる', 'かる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('がりえる', 'がる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ざりえる', 'ざる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('だりえる', 'だる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ばりえる', 'ばる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ぱりえる', 'ぱる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ありうる', 'ある', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('わりうる', 'わる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('らりうる', 'らる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('やりうる', 'やる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ゃりうる', 'ゃる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('まりうる', 'まる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('はりうる', 'はる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('なりうる', 'なる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('たりうる', 'たる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('さりうる', 'さる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('かりうる', 'かる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('がりうる', 'がる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ざりうる', 'ざる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('だりうる', 'だる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ばりうる', 'ばる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ぱりうる', 'ぱる', ConjugationType.POTENTIAL));

conjugationForms.addForm(new ConjugationForm('う'  , 'う'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('く'  , 'く'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぐ'  , 'ぐ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('す'  , 'す'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('つ'  , 'つ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぬ'  , 'ぬ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぶ'  , 'ぶ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('む'  , 'む'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('る'  , 'る'  , ConjugationType.PLAIN));

// Adjectives

conjugationForms.addForm(new ConjugationForm('い', 'い', ConjugationType.ADJECTIVE_PLAIN));
conjugationForms.addForm(new ConjugationForm('しい', 'しい', ConjugationType.ADJECTIVE_PLAIN));

conjugationForms.addForm(new ConjugationForm('かった', 'い', ConjugationType.ADJECTIVE_PAST));
conjugationForms.addForm(new ConjugationForm('しかった', 'しい', ConjugationType.ADJECTIVE_PAST));

conjugationForms.addForm(new ConjugationForm('くない', 'い', ConjugationType.ADJECTIVE_NEGATIVE));
conjugationForms.addForm(new ConjugationForm('しくない', 'しい', ConjugationType.ADJECTIVE_NEGATIVE));

conjugationForms.addForm(new ConjugationForm('くなかった', 'い', ConjugationType.ADJECTIVE_NEGATIVE_PAST));
conjugationForms.addForm(new ConjugationForm('しくなかった', 'しい', ConjugationType.ADJECTIVE_NEGATIVE_PAST));

conjugationForms.addForm(new ConjugationForm('くありません', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));
conjugationForms.addForm(new ConjugationForm('しくありません', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE));

conjugationForms.addForm(new ConjugationForm('くありませんでした', 'い', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));
conjugationForms.addForm(new ConjugationForm('しくありませんでした', 'しい', ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST));

// tslint:enable
