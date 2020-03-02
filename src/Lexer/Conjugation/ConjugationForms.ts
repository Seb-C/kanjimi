import ConjugationType from 'Lexer/Conjugation/ConjugationType';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';

class ConjugationFormsClass {
	readonly formsByConjugation: { [conjugation: string]: ConjugationForm[] } = {};
	readonly conjugationsByPlainForm: { [conjugation: string]: ConjugationForm[] } = {};

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

	public fromPlainForm(plain: string, formTo: ConjugationType): string {
		for (let i = plain.length; i >= 0; i--) {
			const conjugation = plain.substr(-1 * i);

			if (this.conjugationsByPlainForm[conjugation]) {
				const forms = this.conjugationsByPlainForm[conjugation];
				for (let j = 0; j < forms.length; j++) {
					if (forms[j].type === formTo) {
						return plain.substr(0, plain.length - i) + forms[j].conjugation;
					}
				}
			}
		}

		throw new Error(`Unable to find the stem form of ${plain}.`);
	}

	addForm (form: ConjugationForm) {
		// Adding to the dictionary
		if (!this.formsByConjugation.hasOwnProperty(form.conjugation)) {
			this.formsByConjugation[form.conjugation] = [];
		}
		this.formsByConjugation[form.conjugation].push(form);

		// Adding to the reversed dictionary
		if (!this.conjugationsByPlainForm.hasOwnProperty(form.dictionaryForm)) {
			this.conjugationsByPlainForm[form.dictionaryForm] = [];
		}
		this.conjugationsByPlainForm[form.dictionaryForm].push(form);

		if (this.FORMS_CONVERT.has(form.type)) {
			(<Map<ConjugationType, ConjugationType>>(this.FORMS_CONVERT.get(form.type)))
				.forEach((targetForm: ConjugationType, formCombinedWith: ConjugationType) => {
					this.addForm(new ConjugationForm(
						this.fromPlainForm(form.conjugation, formCombinedWith),
						form.dictionaryForm,
						targetForm,
					));
				});
		}
	}

	addStem (prefix: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new ConjugationForm(prefix + 'ます',         dictionaryForm, ConjugationType.POLITE));
		this.addForm(new ConjugationForm(prefix + 'ませんでした', dictionaryForm, ConjugationType.POLITE_NEGATIVE_PAST));
		this.addForm(new ConjugationForm(prefix + 'ません',       dictionaryForm, ConjugationType.POLITE_NEGATIVE));
		this.addForm(new ConjugationForm(prefix + 'ましょう',     dictionaryForm, ConjugationType.POLITE_VOLITIONAL));
		this.addForm(new ConjugationForm(prefix + 'ました',       dictionaryForm, ConjugationType.POLITE_PAST));
		// tslint:enable
	}

	addNegativeBasedForms (prefix: string, dictionaryForm: string) {
		// tslint:disable
		this.addForm(new ConjugationForm(prefix + 'ない',     dictionaryForm, ConjugationType.NEGATIVE));
		this.addForm(new ConjugationForm(prefix + 'なかった', dictionaryForm, ConjugationType.NEGATIVE_PAST));
		// tslint:enable
	}

	hasForm(form: string): boolean {
		return this.formsByConjugation.hasOwnProperty(form);
	}

	getForms(form: string): ReadonlyArray<ConjugationForm> {
		return <ReadonlyArray<ConjugationForm>>(this.formsByConjugation[form] || []);
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

conjugationForms.addForm(new ConjugationForm('って', 'う'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('いて', 'く'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('いで', 'ぐ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('して', 'す'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('って', 'つ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'ぬ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'ぶ'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('んで', 'む'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('って', 'る'  , ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('いて', 'いる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('えて', 'える', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('きて', 'きる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('けて', 'ける', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('して', 'しる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('せて', 'せる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('ちて', 'ちる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('てて', 'てる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('にて', 'にる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('ねて', 'ねる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('ひて', 'ひる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('へて', 'へる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('みて', 'みる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('めて', 'める', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('りて', 'りる', ConjugationType.TE));
conjugationForms.addForm(new ConjugationForm('れて', 'れる', ConjugationType.TE));

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

conjugationForms.addForm(new ConjugationForm('うな'  , 'う'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('くな'  , 'く'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ぐな'  , 'ぐ'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('すな'  , 'す'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('つな'  , 'つ'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ぬな'  , 'ぬ'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ぶな'  , 'ぶ'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('むな'  , 'む'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('るな'  , 'る'  , ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('いるな', 'いる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('えるな', 'える', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('きるな', 'きる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('けるな', 'ける', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('しるな', 'しる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('せるな', 'せる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ちるな', 'ちる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('てるな', 'てる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('にるな', 'にる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ねるな', 'ねる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('ひるな', 'ひる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('へるな', 'へる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('みるな', 'みる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('めるな', 'める', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('りるな', 'りる', ConjugationType.PROHIBITIVE));
conjugationForms.addForm(new ConjugationForm('れるな', 'れる', ConjugationType.PROHIBITIVE));

conjugationForms.addForm(new ConjugationForm('えば'  , 'う'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('けば'  , 'く'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('げば'  , 'ぐ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('せば'  , 'す'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('てば'  , 'つ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ねば'  , 'ぬ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('べば'  , 'ぶ'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('めば'  , 'む'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('れば'  , 'る'  , ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('いれば', 'いる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('えれば', 'える', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('きれば', 'きる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ければ', 'ける', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('しれば', 'しる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('せれば', 'せる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ちれば', 'ちる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('てれば', 'てる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('にれば', 'にる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ねれば', 'ねる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('ひれば', 'ひる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('へれば', 'へる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('みれば', 'みる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('めれば', 'める', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('りれば', 'りる', ConjugationType.CONDITIONAL));
conjugationForms.addForm(new ConjugationForm('れれば', 'れる', ConjugationType.CONDITIONAL));

conjugationForms.addForm(new ConjugationForm('おう'  , 'う'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('こう'  , 'く'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ごう'  , 'ぐ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('そう'  , 'す'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('とう'  , 'つ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('のう'  , 'ぬ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ぼう'  , 'ぶ'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('もう'  , 'む'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ろう'  , 'る'  , ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('いよう', 'いる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('えよう', 'える', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('きよう', 'きる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('けよう', 'ける', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('しよう', 'しる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('せよう', 'せる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ちよう', 'ちる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('てよう', 'てる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('によう', 'にる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ねよう', 'ねる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('ひよう', 'ひる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('へよう', 'へる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('みよう', 'みる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('めよう', 'める', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('りよう', 'りる', ConjugationType.VOLITIONAL));
conjugationForms.addForm(new ConjugationForm('れよう', 'れる', ConjugationType.VOLITIONAL));

conjugationForms.addForm(new ConjugationForm('った', 'う'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('いた', 'く'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('いだ', 'ぐ'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('した', 'す'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('った', 'つ'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('んだ', 'ぬ'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('んだ', 'ぶ'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('んだ', 'む'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('った', 'る'  , ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('いた', 'いる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('えた', 'える', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('きた', 'きる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('けた', 'ける', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('した', 'しる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('せた', 'せる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('ちた', 'ちる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('てた', 'てる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('にた', 'にる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('ねた', 'ねる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('ひた', 'ひる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('へた', 'へる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('みた', 'みる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('めた', 'める', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('りた', 'りる', ConjugationType.PAST));
conjugationForms.addForm(new ConjugationForm('れた', 'れる', ConjugationType.PAST));

conjugationForms.addForm(new ConjugationForm('われる'  , 'う'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('かれる'  , 'く'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('がれる'  , 'ぐ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('される'  , 'す'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('たれる'  , 'つ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('なれる'  , 'ぬ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('ばれる'  , 'ぶ'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('まれる'  , 'む'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('られる'  , 'る'  , ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('いられる', 'いる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('えられる', 'える', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('きられる', 'きる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('けられる', 'ける', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('しられる', 'しる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('せられる', 'せる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('ちられる', 'ちる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('てられる', 'てる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('にられる', 'にる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('ねられる', 'ねる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('ひられる', 'ひる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('へられる', 'へる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('みられる', 'みる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('められる', 'める', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('りられる', 'りる', ConjugationType.PASSIVE));
conjugationForms.addForm(new ConjugationForm('れられる', 'れる', ConjugationType.PASSIVE));

conjugationForms.addForm(new ConjugationForm('わせる'  , 'う'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('かせる'  , 'く'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('がせる'  , 'ぐ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('させる'  , 'す'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('たせる'  , 'つ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('なせる'  , 'ぬ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ばせる'  , 'ぶ'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ませる'  , 'む'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('らせる'  , 'る'  , ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('いさせる', 'いる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('えさせる', 'える', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('きさせる', 'きる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('けさせる', 'ける', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('しさせる', 'しる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('せさせる', 'せる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ちさせる', 'ちる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('てさせる', 'てる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('にさせる', 'にる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ねさせる', 'ねる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('ひさせる', 'ひる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('へさせる', 'へる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('みさせる', 'みる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('めさせる', 'める', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('りさせる', 'りる', ConjugationType.CAUSATIVE));
conjugationForms.addForm(new ConjugationForm('れさせる', 'れる', ConjugationType.CAUSATIVE));

conjugationForms.addForm(new ConjugationForm('える'    , 'う'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ける'    , 'く'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('げる'    , 'ぐ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('せる'    , 'す'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('てる'    , 'つ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ねる'    , 'ぬ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('べる'    , 'ぶ'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('める'    , 'む'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('れる'    , 'る'  , ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('いられる', 'いる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('えられる', 'える', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('きられる', 'きる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('けられる', 'ける', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('しられる', 'しる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('せられる', 'せる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ちられる', 'ちる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('てられる', 'てる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('にられる', 'にる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ねられる', 'ねる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('ひられる', 'ひる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('へられる', 'へる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('みられる', 'みる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('められる', 'める', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('りられる', 'りる', ConjugationType.POTENTIAL));
conjugationForms.addForm(new ConjugationForm('れられる', 'れる', ConjugationType.POTENTIAL));

conjugationForms.addForm(new ConjugationForm('う'  , 'う'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('く'  , 'く'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぐ'  , 'ぐ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('す'  , 'す'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('つ'  , 'つ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぬ'  , 'ぬ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ぶ'  , 'ぶ'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('む'  , 'む'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('る'  , 'る'  , ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('いる', 'いる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('える', 'える', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('きる', 'きる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ける', 'ける', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('しる', 'しる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('せる', 'せる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ちる', 'ちる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('てる', 'てる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('にる', 'にる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ねる', 'ねる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('ひる', 'ひる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('へる', 'へる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('みる', 'みる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('める', 'める', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('りる', 'りる', ConjugationType.PLAIN));
conjugationForms.addForm(new ConjugationForm('れる', 'れる', ConjugationType.PLAIN));

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
