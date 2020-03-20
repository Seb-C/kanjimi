<template>
	<div class="conjugations">
		<template v-if="conjugationsNames.length === 0" />
		<div
			v-else-if="conjugationsNames.length === 1"
			v-html="ConjugationTranslations.explain.one(conjugationsNames[0])"
		/>
		<div v-else v-html="ConjugationTranslations.explain.many(conjugationsNames)" />
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import VerbToken from 'Common/Models/Token/VerbToken';
	import ConjugationTranslations from 'Client/Lang/Conjugation';

	export default Vue.extend({
		props: {
			token: { type: Object as () => VerbToken },
		},
		data() {
			const conjugationsNames: string[] = [];
			for (let i = 0; i < this.token.forms.length; i++) {
				const form = this.token.forms[i];
				if (ConjugationTranslations.forms[form.type]) {
					const conjugationName = ConjugationTranslations.forms[form.type];
					if (!conjugationsNames.includes(conjugationName)) {
						conjugationsNames.push(conjugationName);
					}
				}
			}

			return {
				ConjugationTranslations,
				conjugationsNames,
			};
		},
	});
</script>
