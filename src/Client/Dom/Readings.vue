<template>
	<ul class="readings">
		<li v-for="[reading, wordsByLanguage] of wordsByReadingAndLanguage">
			<span class="token">
				<span class="furigana">{{ reading == token.text ? '&nbsp;' : reading }}</span>
				<span class="word">{{ token.text }}</span>
			</span>
			<div class="reading-translations">
				<div v-for="[lang, words] of wordsByLanguage" class="reading-translation">
					<span
						v-bind:title="LanguageTranslations[lang] || ''"
						class="reading-translation-flag"
					>
						{{ lang === null ? '' : Language.toUnicodeFlag(lang) }}
					</span>
					<ol>
						<li v-for="word in words">
							<template v-for="tag in word.tags">
								<b v-if="WordTagTranslations[tag]">
									({{ WordTagTranslations[tag] }})
								</b>
							</template>
							{{ word.translation }}
						</li>
					</ol>
				</div>
			</div>
		</li>
	</ul>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Word from 'Common/Models/Word';
	import Language from 'Common/Types/Language';
	import WordToken from 'Common/Models/Token/WordToken';
	import LanguageTranslations from 'Client/Lang/Language';
	import WordTagTranslations from 'Client/Lang/WordTag';

	export default Vue.extend({
		props: {
			uidClass: { type: String },
			token: { type: Object as () => WordToken },
		},
		data() {
			const wordsByReadingAndLanguage: Map<string, Map<Language|null, Word[]>> = new Map();
			this.token.words.forEach((word) => {
				if (!wordsByReadingAndLanguage.has(word.reading)) {
					wordsByReadingAndLanguage.set(word.reading, new Map());
				}
				const wordsByLanguage = (<Map<Language|null, Word[]>>wordsByReadingAndLanguage.get(word.reading));

				if (!wordsByLanguage.has(word.translationLang)) {
					wordsByLanguage.set(word.translationLang, []);
				}
				const words = (<Word[]>wordsByLanguage.get(word.translationLang));

				words.push(word);
			});

			return {
				Language,
				LanguageTranslations,
				WordTagTranslations,
				wordsByReadingAndLanguage,
			};
		},
	});
</script>
<style scoped>
	.token {
		display: inline-block;
		line-height: 100%;
	}

	.token .furigana {
		font-size: 0.5rem;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
	}

	.token .word {
		line-height: 100%;
		display: block;
		text-align: center;
		white-space: nowrap;
	}

	.readings {
		display: block;
		margin: 0;
	}

	.readings > li {
		list-style-type: none;
		display: flex;
		margin-bottom: 0.5rem;
	}

	.readings > li > .token {
		float: left;
	}

	.reading-translations {
		display: inline-block;
		padding-left: 0.5rem;
		margin-left: 0.5rem;
		border-left: 2px solid #AAA;
		flex-grow: 1;
	}

	.reading-translation {
		display: flex;
	}

	.reading-translation-flag {
		margin-top: 0.3rem;
		float: left;
	}

	.reading-translation ol {
		flex-grow: 1;
		margin-left: 0.5rem;
	}

	.reading-translation ol li {
		list-style-type: decimal;
		list-style-position: inside;
		display: list-item;
	}
</style>
