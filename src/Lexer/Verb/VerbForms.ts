import VerbFormType from 'Lexer/Verb/VerbFormType';
import VerbForm from 'Lexer/Verb/VerbForm';

class VerbFormsClass {
	readonly formsByConjugation: { [conjugation: string]: VerbForm[] } = {};
	readonly conjugationsByPlainForm: { [conjugation: string]: VerbForm[] } = {};
	private maxConjugationLength: number = 0;

	private readonly FORMS_CONVERT: {
		[a: VerbFormType]: { [b: VerbFormType]: VerbFormType },
	} = {
		[VerbFormType.PASSIVE]: {
			[VerbFormType.NEGATIVE]: VerbFormType.PASSIVE_NEGATIVE,
			[VerbFormType.POLITE]: VerbFormType.PASSIVE_POLITE,
		},
		[VerbFormType.CAUSATIVE]: {
			[VerbFormType.NEGATIVE]: VerbFormType.CAUSATIVE_NEGATIVE,
			[VerbFormType.POLITE]: VerbFormType.CAUSATIVE_POLITE,
		},
		[VerbFormType.POTENTIAL]: {
			[VerbFormType.NEGATIVE]: VerbFormType.POTENTIAL_NEGATIVE,
			[VerbFormType.POLITE]: VerbFormType.POTENTIAL_POLITE,
		},
		[VerbFormType.POLITE]: {
			[VerbFormType.VOLITIONAL]: VerbFormType.POLITE_VOLITIONAL,
			[VerbFormType.PAST]: VerbFormType.POLITE_PAST,
		},
		[VerbFormType.PASSIVE_POLITE]: {
			[VerbFormType.NEGATIVE]: VerbFormType.PASSIVE_POLITE_NEGATIVE,
		},
		[VerbFormType.CAUSATIVE_POLITE]: {
			[VerbFormType.NEGATIVE]: VerbFormType.CAUSATIVE_POLITE_NEGATIVE,
		},
		[VerbFormType.POTENTIAL_POLITE]: {
			[VerbFormType.NEGATIVE]: VerbFormType.POTENTIAL_POLITE_NEGATIVE,
		},
	};

	private fromPlainForm(plain: string, formTo: VerbFormType): string {
		for (let i = plain.length; i > 0; i--) {
			const conjugation = plain.substr(-1 * i);

			if (this.conjugationsByPlainForm[conjugation]) {
				const forms = this.stemsByPlainForm[conjugation];
				for (let j = 0; j < forms.length; j++) {
					if (forms[j].type === formTo) {
						return forms[j].conjugation;
					}
				}
			}
		}

		throw new Error(`Unable to find the stem form of ${plain}.`);
	}

	addForm (form: VerbForm) {
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

		if (form.conjugation.length > this.maxConjugationLength) {
			this.maxConjugationLength = form.conjugation.length;
		}

		if (this.FORMS_CONVERT.hasOwnProperty(form.type)) {
			Object.keys(this.FORMS_CONVERT[form.type]).forEach((formCombinedWith) => {
				this.addForm(new VerbForm(
					this.fromPlainForm(form.conjugation, formCombinedWith),
					form.dictionaryForm,
					this.FORMS_CONVERT[form.type][formCombinedWith],
				));
			});
		}
	}

	hasForm(form: string): boolean {
		return this.formsByConjugation.hasOwnProperty(form);
	}

	getForms(form: string): ReadonlyArray<VerbForm> {
		return <ReadonlyArray<VerbForm>>(this.formsByConjugation[form] || []);
	}

	getMaxConjugationLength(): number {
		return this.maxConjugationLength;
	}
}

const verbForms = new VerbFormsClass();
export default verbForms;

verbForms.addForm(new VerbForm('いません'  , 'いる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('いません'  , 'う'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('えません'  , 'える', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('きません'  , 'きる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('きません'  , 'く'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('ぎません'  , 'ぐ'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('けません'  , 'ける', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('しません'  , 'しる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('しません'  , 'す'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('せません'  , 'せる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('ちません'  , 'ちる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('ちません'  , 'つ'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('てません'  , 'てる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('にません'  , 'にる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('にません'  , 'ぬ'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('ねません'  , 'ねる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('ひません'  , 'ひる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('びません'  , 'ぶ'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('へません'  , 'へる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('みません'  , 'みる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('みません'  , 'む'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('めません'  , 'める', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('りません'  , 'りる', VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('りません'  , 'る'  , VerbFormType.POLITE_NEGATIVE));
verbForms.addForm(new VerbForm('れません'  , 'れる', VerbFormType.POLITE_NEGATIVE));

verbForms.addForm(new VerbForm('います'  , 'いる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('います'  , 'う'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('えます'  , 'える', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('きます'  , 'きる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('きます'  , 'く'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ぎます'  , 'ぐ'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('けます'  , 'ける', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('します'  , 'しる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('します'  , 'す'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('せます'  , 'せる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ちます'  , 'ちる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ちます'  , 'つ'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('てます'  , 'てる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('にます'  , 'にる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('にます'  , 'ぬ'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ねます'  , 'ねる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ひます'  , 'ひる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('びます'  , 'ぶ'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('へます'  , 'へる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('みます'  , 'みる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('みます'  , 'む'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('めます'  , 'める', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ります'  , 'りる', VerbFormType.POLITE));
verbForms.addForm(new VerbForm('ります'  , 'る'  , VerbFormType.POLITE));
verbForms.addForm(new VerbForm('れます'  , 'れる', VerbFormType.POLITE));

verbForms.addForm(new VerbForm('って'    , 'う'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('いて'    , 'く'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('いで'    , 'ぐ'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('して'    , 'す'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('って'    , 'つ'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('んで'    , 'ぬ'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('んで'    , 'ぶ'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('んで'    , 'む'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('って'    , 'る'  , VerbFormType.TE));
verbForms.addForm(new VerbForm('いて'    , 'いる', VerbFormType.TE));
verbForms.addForm(new VerbForm('えて'    , 'える', VerbFormType.TE));
verbForms.addForm(new VerbForm('きて'    , 'きる', VerbFormType.TE));
verbForms.addForm(new VerbForm('けて'    , 'ける', VerbFormType.TE));
verbForms.addForm(new VerbForm('して'    , 'しる', VerbFormType.TE));
verbForms.addForm(new VerbForm('せて'    , 'せる', VerbFormType.TE));
verbForms.addForm(new VerbForm('ちて'    , 'ちる', VerbFormType.TE));
verbForms.addForm(new VerbForm('てて'    , 'てる', VerbFormType.TE));
verbForms.addForm(new VerbForm('にて'    , 'にる', VerbFormType.TE));
verbForms.addForm(new VerbForm('ねて'    , 'ねる', VerbFormType.TE));
verbForms.addForm(new VerbForm('ひて'    , 'ひる', VerbFormType.TE));
verbForms.addForm(new VerbForm('へて'    , 'へる', VerbFormType.TE));
verbForms.addForm(new VerbForm('みて'    , 'みる', VerbFormType.TE));
verbForms.addForm(new VerbForm('めて'    , 'める', VerbFormType.TE));
verbForms.addForm(new VerbForm('りて'    , 'りる', VerbFormType.TE));
verbForms.addForm(new VerbForm('れて'    , 'れる', VerbFormType.TE));

verbForms.addForm(new VerbForm('われる'  , 'う'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('かれる'  , 'く'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('がれる'  , 'ぐ'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('される'  , 'す'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('たれる'  , 'つ'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('なれる'  , 'ぬ'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('ばれる'  , 'ぶ'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('まれる'  , 'む'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('られる'  , 'る'  , VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('いられる', 'いる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('えられる', 'える', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('きられる', 'きる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('けられる', 'ける', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('しられる', 'しる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('せられる', 'せる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('ちられる', 'ちる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('てられる', 'てる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('にられる', 'にる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('ねられる', 'ねる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('ひられる', 'ひる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('へられる', 'へる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('みられる', 'みる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('められる', 'める', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('りられる', 'りる', VerbFormType.PASSIVE));
verbForms.addForm(new VerbForm('れられる', 'れる', VerbFormType.PASSIVE));

verbForms.addForm(new VerbForm('わない'  , 'う'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('かない'  , 'く'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('がない'  , 'ぐ'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('さない'  , 'す'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('たない'  , 'つ'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('なない'  , 'ぬ'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('ばない'  , 'ぶ'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('まない'  , 'む'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('らない'  , 'る'  , VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('いない'  , 'いる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('えない'  , 'える', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('きない'  , 'きる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('けない'  , 'ける', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('しない'  , 'しる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('せない'  , 'せる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('ちない'  , 'ちる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('てない'  , 'てる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('にない'  , 'にる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('ねない'  , 'ねる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('ひない'  , 'ひる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('へない'  , 'へる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('みない'  , 'みる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('めない'  , 'める', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('りない'  , 'りる', VerbFormType.NEGATIVE));
verbForms.addForm(new VerbForm('れない'  , 'れる', VerbFormType.NEGATIVE));

verbForms.addForm(new VerbForm('え'      , 'う'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('け'      , 'く'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('げ'      , 'ぐ'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('せ'      , 'す'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('て'      , 'つ'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('ね'      , 'ぬ'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('べ'      , 'ぶ'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('め'      , 'む'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('れ'      , 'る'  , VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('いろ'    , 'いる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('えろ'    , 'える', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('きろ'    , 'きる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('けろ'    , 'ける', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('しろ'    , 'しる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('せろ'    , 'せる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('ちろ'    , 'ちる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('てろ'    , 'てる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('にろ'    , 'にる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('ねろ'    , 'ねる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('ひろ'    , 'ひる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('へろ'    , 'へる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('みろ'    , 'みる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('めろ'    , 'める', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('りろ'    , 'りる', VerbFormType.IMPERATIVE));
verbForms.addForm(new VerbForm('れろ'    , 'れる', VerbFormType.IMPERATIVE));

verbForms.addForm(new VerbForm('わせる'  , 'う'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('かせる'  , 'く'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('がせる'  , 'ぐ'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('させる'  , 'す'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('たせる'  , 'つ'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('なせる'  , 'ぬ'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('ばせる'  , 'ぶ'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('ませる'  , 'む'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('らせる'  , 'る'  , VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('いさせる', 'いる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('えさせる', 'える', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('きさせる', 'きる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('けさせる', 'ける', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('しさせる', 'しる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('せさせる', 'せる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('ちさせる', 'ちる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('てさせる', 'てる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('にさせる', 'にる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('ねさせる', 'ねる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('ひさせる', 'ひる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('へさせる', 'へる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('みさせる', 'みる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('めさせる', 'める', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('りさせる', 'りる', VerbFormType.CAUSATIVE));
verbForms.addForm(new VerbForm('れさせる', 'れる', VerbFormType.CAUSATIVE));

verbForms.addForm(new VerbForm('うな'    , 'う'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('くな'    , 'く'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ぐな'    , 'ぐ'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('すな'    , 'す'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('つな'    , 'つ'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ぬな'    , 'ぬ'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ぶな'    , 'ぶ'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('むな'    , 'む'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('るな'    , 'る'  , VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('いるな'  , 'いる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('えるな'  , 'える', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('きるな'  , 'きる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('けるな'  , 'ける', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('しるな'  , 'しる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('せるな'  , 'せる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ちるな'  , 'ちる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('てるな'  , 'てる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('にるな'  , 'にる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ねるな'  , 'ねる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('ひるな'  , 'ひる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('へるな'  , 'へる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('みるな'  , 'みる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('めるな'  , 'める', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('りるな'  , 'りる', VerbFormType.PROHIBITIVE));
verbForms.addForm(new VerbForm('れるな'  , 'れる', VerbFormType.PROHIBITIVE));

verbForms.addForm(new VerbForm('える'    , 'う'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('ける'    , 'く'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('げる'    , 'ぐ'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('せる'    , 'す'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('てる'    , 'つ'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('ねる'    , 'ぬ'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('べる'    , 'ぶ'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('める'    , 'む'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('れる'    , 'る'  , VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('いられる', 'いる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('えられる', 'える', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('きられる', 'きる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('けられる', 'ける', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('しられる', 'しる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('せられる', 'せる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('ちられる', 'ちる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('てられる', 'てる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('にられる', 'にる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('ねられる', 'ねる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('ひられる', 'ひる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('へられる', 'へる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('みられる', 'みる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('められる', 'める', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('りられる', 'りる', VerbFormType.POTENTIAL));
verbForms.addForm(new VerbForm('れられる', 'れる', VerbFormType.POTENTIAL));

verbForms.addForm(new VerbForm('えば'    , 'う'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('けば'    , 'く'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('げば'    , 'ぐ'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('せば'    , 'す'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('てば'    , 'つ'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('ねば'    , 'ぬ'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('べば'    , 'ぶ'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('めば'    , 'む'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('れば'    , 'る'  , VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('いれば'  , 'いる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('えれば'  , 'える', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('きれば'  , 'きる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('ければ'  , 'ける', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('しれば'  , 'しる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('せれば'  , 'せる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('ちれば'  , 'ちる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('てれば'  , 'てる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('にれば'  , 'にる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('ねれば'  , 'ねる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('ひれば'  , 'ひる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('へれば'  , 'へる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('みれば'  , 'みる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('めれば'  , 'める', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('りれば'  , 'りる', VerbFormType.CONDITIONAL));
verbForms.addForm(new VerbForm('れれば'  , 'れる', VerbFormType.CONDITIONAL));

verbForms.addForm(new VerbForm('おう'    , 'う'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('こう'    , 'く'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ごう'    , 'ぐ'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('そう'    , 'す'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('とう'    , 'つ'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('のう'    , 'ぬ'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ぼう'    , 'ぶ'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('もう'    , 'む'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ろう'    , 'る'  , VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('いよう'  , 'いる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('えよう'  , 'える', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('きよう'  , 'きる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('けよう'  , 'ける', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('しよう'  , 'しる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('せよう'  , 'せる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ちよう'  , 'ちる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('てよう'  , 'てる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('によう'  , 'にる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ねよう'  , 'ねる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('ひよう'  , 'ひる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('へよう'  , 'へる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('みよう'  , 'みる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('めよう'  , 'める', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('りよう'  , 'りる', VerbFormType.VOLITIONAL));
verbForms.addForm(new VerbForm('れよう'  , 'れる', VerbFormType.VOLITIONAL));

verbForms.addForm(new VerbForm('う'      , 'う'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('く'      , 'く'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ぐ'      , 'ぐ'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('す'      , 'す'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('つ'      , 'つ'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ぬ'      , 'ぬ'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ぶ'      , 'ぶ'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('む'      , 'む'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('る'      , 'る'  , VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('いる'    , 'いる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('える'    , 'える', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('きる'    , 'きる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ける'    , 'ける', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('しる'    , 'しる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('せる'    , 'せる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ちる'    , 'ちる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('てる'    , 'てる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('にる'    , 'にる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ねる'    , 'ねる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('ひる'    , 'ひる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('へる'    , 'へる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('みる'    , 'みる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('める'    , 'める', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('りる'    , 'りる', VerbFormType.PLAIN));
verbForms.addForm(new VerbForm('れる'    , 'れる', VerbFormType.PLAIN));

verbForms.addForm(new VerbForm('った'    , 'う'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('いた'    , 'く'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('いだ'    , 'ぐ'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('した'    , 'す'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('った'    , 'つ'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('んだ'    , 'ぬ'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('んだ'    , 'ぶ'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('んだ'    , 'む'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('った'    , 'る'  , VerbFormType.PAST));
verbForms.addForm(new VerbForm('いた'    , 'いる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('えた'    , 'える', VerbFormType.PAST));
verbForms.addForm(new VerbForm('きた'    , 'きる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('けた'    , 'ける', VerbFormType.PAST));
verbForms.addForm(new VerbForm('した'    , 'しる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('せた'    , 'せる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('ちた'    , 'ちる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('てた'    , 'てる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('にた'    , 'にる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('ねた'    , 'ねる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('ひた'    , 'ひる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('へた'    , 'へる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('みた'    , 'みる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('めた'    , 'める', VerbFormType.PAST));
verbForms.addForm(new VerbForm('りた'    , 'りる', VerbFormType.PAST));
verbForms.addForm(new VerbForm('れた'    , 'れる', VerbFormType.PAST));
