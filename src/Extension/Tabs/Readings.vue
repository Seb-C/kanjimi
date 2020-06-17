<template>
	<ul class="readings">
		<li v-for="entry of entries">
			<div class="tokens">
				<span v-for="reading of entry.readings" class="token">
					<span class="furigana">{{ reading == wordText ? '&nbsp;' : formatReading(reading) }}</span>
					<span class="word">{{ wordText }}</span>
				</span>
			</div>
			<div class="reading-translations">
				<div v-for="languageAndWords of entry.subEntry" class="reading-translation">
					<span
						v-bind:title="LanguageTranslation.name[languageAndWords.translationLang] || ''"
						class="reading-translation-flag"
					>
						{{ languageAndWords.translationLang === null ? '' : Language.toUnicodeFlag(languageAndWords.translationLang) }}
					</span>
					<ol>
						<li v-for="word in languageAndWords.words">
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
	import WordTag from 'Common/Types/WordTag';
	import CharType from 'Common/Types/CharType';
	import LanguageTranslation from 'Common/Translations/Language';
	import WordTagTranslation from 'Common/Translations/WordTag';

	type SubEntryTranslation = {
		translation: string,
		tags: WordTag[],
	};
	type SubEntry = {
		translationLang: Language|null,
		words: SubEntryTranslation[],
	};
	type Entry = {
		readings: string[],
		subEntry: SubEntry[],
	};

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
			entries() {
				const entries: Entry[] = [];
				this.token.words.forEach((word: Word) => {
					const reading = CharType.katakanaToHiragana(word.reading);

					let entry: Entry|null = null;
					entries.forEach((currentEntry: Entry) => {
						if (currentEntry.readings.includes(reading)) {
							entry = currentEntry;
						}
					});
					if (entry === null) {
						entry = {
							readings: [reading],
							subEntry: [],
						};
						entries.push(entry);
					}

					let subEntry: SubEntry|null = null;
					entry.subEntry.forEach((currentSubEntry: SubEntry) => {
						if (currentSubEntry.translationLang === word.translationLang) {
							subEntry = currentSubEntry;
						}
					});
					if (subEntry === null) {
						subEntry = {
							translationLang: word.translationLang,
							words: [],
						};
						entry.subEntry.push(subEntry);
					}

					subEntry.words.push({
						translation: word.translation,
						tags: word.tags,
					});
				});

				// Merging entries with different readings but same content
				for (let i = 0; i < entries.length; i++) {
					for (let j = i + 1; j < entries.length; j++) {
						// Deep-comparing the contents and merging the identical entries
						if (
							JSON.stringify(Array.from(entries[i].subEntry.entries()))
							===
							JSON.stringify(Array.from(entries[j].subEntry.entries()))
						) {
							entries[i].readings.push(...entries[j].readings);
							entries.splice(j, 1);
							j--;
						}
					}
				}

				return entries;
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
		display: block;
		line-height: 100%;
		margin-bottom: 0.3em;
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
		border-left: 2px solid var(--dark);
		flex-grow: 1;
	}

	.reading-translation {
		display: flex;
	}

	.reading-translation-flag {
		margin-top: 0.3em;
		float: left;
		line-height: 1em;
	}

	.reading-translation ol {
		flex-grow: 1;
		margin-left: 0.5em;
		margin-top: 0.2em;
		margin-bottom: 0.2em;
		padding: 0;
	}

	.reading-translation ol li {
		list-style-type: decimal;
		list-style-position: inside;
		display: list-item;
	}
</style>
