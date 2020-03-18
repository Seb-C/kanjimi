import ConjugationType from 'Common/Types/ConjugationType';

export default {
	explain: {
		one: (form: string) => `Conjugated as <b>${form}</b>`,
		many: (forms: string[]) => {
			let text = `Conjugated as either: <b>${forms[0]}</b>`;
			for (let i = 1; i < forms.length; i++) {
				if (i === forms.length - 1) {
					text += ` or <b>${forms[i]}</b>`;
				} else {
					text += `, <b>${forms[i]}</b>`;
				}
			}

			return text;
		},
	},
	forms: {
		[ConjugationType.ADJECTIVE_NEGATIVE]: 'negative',
		[ConjugationType.ADJECTIVE_NEGATIVE_PAST]: 'negative past',
		[ConjugationType.ADJECTIVE_PAST]: 'past',
		[ConjugationType.ADJECTIVE_PLAIN]: 'plain',
		[ConjugationType.ADJECTIVE_POLITE_NEGATIVE]: 'polite negative',
		[ConjugationType.ADJECTIVE_POLITE_NEGATIVE_PAST]: 'polite negative past',
		[ConjugationType.CAUSATIVE]: 'causative',
		[ConjugationType.CAUSATIVE_NEGATIVE]: 'causative negative',
		[ConjugationType.CAUSATIVE_NEGATIVE_PAST]: 'causative negative past',
		[ConjugationType.CAUSATIVE_PAST]: 'causative past',
		[ConjugationType.CAUSATIVE_POLITE]: 'causative polite',
		[ConjugationType.CAUSATIVE_POLITE_NEGATIVE]: 'causative polite negative',
		[ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST]: 'causative polite negative past',
		[ConjugationType.CAUSATIVE_POLITE_PAST]: 'causative polite past',
		[ConjugationType.CONDITIONAL]: 'conditional',
		[ConjugationType.CONDITIONAL_RA]: 'conditional (ra)',
		[ConjugationType.ENUMERATION]: 'enumerative',
		[ConjugationType.IMPERATIVE]: 'imperative',
		[ConjugationType.IMPERATIVE_POLITE]: 'imperative polite',
		[ConjugationType.NEGATIVE]: 'negative',
		[ConjugationType.NEGATIVE_PAST]: 'negative past',
		[ConjugationType.PASSIVE]: 'passive',
		[ConjugationType.PASSIVE_NEGATIVE]: 'passive negative',
		[ConjugationType.PASSIVE_NEGATIVE_PAST]: 'passive negative past',
		[ConjugationType.PASSIVE_PAST]: 'passive past',
		[ConjugationType.PASSIVE_POLITE]: 'passive polite',
		[ConjugationType.PASSIVE_POLITE_NEGATIVE]: 'passive polite negative',
		[ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST]: 'passive polite negative past',
		[ConjugationType.PASSIVE_POLITE_PAST]: 'passive polite past',
		[ConjugationType.PAST]: 'past',
		[ConjugationType.PLAIN]: 'plain',
		[ConjugationType.POLITE]: 'polite',
		[ConjugationType.POLITE_NEGATIVE]: 'polite negative',
		[ConjugationType.POLITE_NEGATIVE_PAST]: 'polite negative past',
		[ConjugationType.POLITE_PAST]: 'polite past',
		[ConjugationType.POLITE_VOLITIONAL]: 'polite volitional',
		[ConjugationType.POTENTIAL]: 'potential',
		[ConjugationType.POTENTIAL_NEGATIVE]: 'potential negative',
		[ConjugationType.POTENTIAL_NEGATIVE_PAST]: 'potential negative past',
		[ConjugationType.POTENTIAL_PAST]: 'potential past',
		[ConjugationType.POTENTIAL_POLITE]: 'potential polite',
		[ConjugationType.POTENTIAL_POLITE_NEGATIVE]: 'potential polite negative',
		[ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST]: 'potential polite negative past',
		[ConjugationType.POTENTIAL_POLITE_PAST]: 'potential polite past',
		[ConjugationType.STEM]: 'stem',
		[ConjugationType.TE]: 'te',
		[ConjugationType.VOLITIONAL]: 'volitional',
		[ConjugationType.WISH]: 'wishful',
	},
};
