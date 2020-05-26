<template>
	<ul class="readings">
		<li v-for="[reading, wordsByLanguage] of wordsByReadingAndLanguage">
			<span class="token">
				<span class="furigana">{{ reading == wordText ? '&nbsp;' : formatReading(reading) }}</span>
				<span class="word">{{ wordText }}</span>
			</span>
			<div class="reading-translations">
				<div v-for="[lang, words] of wordsByLanguage" class="reading-translation">
					<span
						v-bind:title="LanguageTranslation.name[lang] || ''"
						class="reading-translation-flag"
					>
						{{ lang === null ? '' : Language.toUnicodeFlag(lang) }}
					</span>
					<ol>
						<li v-for="word in words">
							<template v-for="tag in word.tags">
								<b v-if="WordTagTranslation[tag]">
									({{ WordTagTranslation[tag] }})
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
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import CharType from 'Common/Types/CharType';
	import LanguageTranslation from 'Common/Translations/Language';
	import WordTagTranslation from 'Common/Translations/WordTag';

	export default Vue.extend({
		props: {
			token: { type: Token },
		},
		data() {
			return {
				Language,
				LanguageTranslation,
				WordTagTranslation,
			};
		},
		methods: {
			formatReading(reading: string): string {
				if (this.$root.user.romanReading) {
					return CharType.hiraganaToRoman(reading);
				}

				return reading;
			},
		},
		computed: {
			wordsByReadingAndLanguage() {
				const wordsByReadingAndLanguage: Map<string, Map<Language|null, Word[]>> = new Map();
				this.token.words.forEach((word: Word) => {
					const reading = CharType.katakanaToHiragana(word.reading);
					if (!wordsByReadingAndLanguage.has(reading)) {
						wordsByReadingAndLanguage.set(reading, new Map());
					}
					const wordsByLanguage = (<Map<Language|null, Word[]>>wordsByReadingAndLanguage.get(reading));

					if (!wordsByLanguage.has(word.translationLang)) {
						wordsByLanguage.set(word.translationLang, []);
					}
					const words = (<Word[]>wordsByLanguage.get(word.translationLang));

					words.push(word);
				});

				return wordsByReadingAndLanguage;
			},
			wordText() {
				let wordText = this.token.text;
				if (this.token.type === TokenType.VERB && this.token.words.length > 0) {
					wordText = this.token.words[0].word;
				}

				return wordText;
			},
		},
	});
</script>
<style scoped>
	.token {
		display: inline-block;
		line-height: 100%;
	}

	.token .furigana {
		font-size: 0.5em;
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
		margin-bottom: 0.5em;
	}

	.readings > li > .token {
		float: left;
	}

	.reading-translations {
		display: inline-block;
		padding-left: 0.5em;
		margin-left: 0.5em;
		border-left: 2px solid #AAA;
		flex-grow: 1;
	}

	.reading-translation {
		display: flex;
	}

	.reading-translation-flag {
		margin-top: 0.3em;
		float: left;
	}

	.reading-translation ol {
		flex-grow: 1;
		margin-left: 0.5em;
	}

	.reading-translation ol li {
		list-style-type: decimal;
		list-style-position: inside;
		display: list-item;
	}
</style>
