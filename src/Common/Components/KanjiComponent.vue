<template>
	<div
		v-if="svg === null"
		class="kanjimi-loader"
	/>
	<div
		v-else
		v-bind:class="{
			'kanji-container': true,
			'zooming': selected !== null,
		}"
	>
		<div v-html="svg" ref="svg" class="kanji-svg-container" />
		<div class="kanji-meanings">
			<div
				v-for="(meanings, lang) in meaningsGroupedByLang"
				class="kanji-meanings-lang-group"
			>
				<div class="kanji-meanings-lang">
					{{ lang === null ? '' : Language.toUnicodeFlag(lang) }}
				</div>
				<div class="kanji-meanings-list">
					<ol>
						<li v-for="meaning in meanings">
							{{ meaning }}
						</li>
					</ol>
				</div>
			</div>
		</div>
		<div class="kanji-readings">
			<div
				v-for="reading in kanji.readings"
			>{{ reading.reading }}</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Kanji from 'Common/Models/Kanjis/Kanji';
	import Meaning from 'Common/Models/Kanjis/Meaning';
	import Structure from 'Common/Models/Kanjis/Structure';
	import Language from 'Common/Types/Language';

	export default Vue.extend({
		props: {
			kanji: { type: Kanji },
			selected: { type: Kanji },
		},
		data() {
			return {
				Language,
				svg: <string|null>null,
			};
		},
		created() {
			this.loadSvg();
		},
		updated() {
			if (this.svg !== null) {
				this.makeSvgInteractive();
			}
		},
		watch: {
			kanji(newVal, oldVal) {
				this.loadSvg();
			},
			selected(newVal, oldVal) {
				this.updateSvgActiveSelection();
			},
		},
		computed: {
			meaningsGroupedByLang(): { [key: string]: string[] } {
				const result: { [key: string]: string[] } = {};
				this.kanji.meanings.forEach((meaning: Meaning) => {
					if (result[meaning.meaningLang]) {
						result[meaning.meaningLang].push(meaning.meaning);
					} else {
						result[meaning.meaningLang] = [meaning.meaning];
					}
				});
				return result;
			},
		},
		methods: {
			async loadSvg() {
				this.svg = null;
				const svg = await (await fetch(this.kanji.fileUrl)).text();
				const domParser = new DOMParser();
				const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');
				this.svg = svgDocument.documentElement.outerHTML;
			},

			/**
			 * We need to make this once the svg is displayed, otherwise some things
			 * like the bounding box have not been calculated.
			 */
			makeSvgInteractive() {
				var svg = this.$refs.svg.querySelector('svg');
				if (svg.getAttribute('data-hasBeenMadeInteractive')) {
					return;
				} else {
					svg.setAttribute('data-hasBeenMadeInteractive', true);
				}

				// Moving the stroke numbers at first so it does not cover the bounding boxes
				const strokeNumbers = svg.querySelector('[id^="kvg:StrokeNumbers_"]');
				if (strokeNumbers !== null) {
					strokeNumbers.parentNode.insertBefore(strokeNumbers, strokeNumbers.parentNode.firstChild);
				}

				// Adding the interactivity to all components of the Kanji
				(new Set<string>(
					// Using a set to remove duplicates
					this.kanji
						.structure
						.getDirectSubStructures()
						.map((s: Structure) => s.element)
				)).forEach((subKanji: string) => {
					svg.querySelectorAll('*').forEach((element: SVGGraphicsElement) => {
						if (element.getAttribute('kvg:element') === subKanji && element.getBBox) {
							const containerBox = element.getBBox();

							element.classList.add('kanji-component');
							element.setAttribute('pointer-events', 'all');

							// Creating a bounding box to handle the mouse
							const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
							box.setAttribute('class', 'bounding-box');
							box.setAttribute('x', (containerBox.x - 3).toString());
							box.setAttribute('y', (containerBox.y - 3).toString());
							box.setAttribute('width', (containerBox.width + 6).toString());
							box.setAttribute('height', (containerBox.height + 6).toString());
							box.setAttribute('fill', 'none');
							box.setAttribute('stroke', 'none');

							element.appendChild(box);

							element.addEventListener('click', () => this.$emit('click', subKanji));
						}
					});
				});
			},

			updateSvgActiveSelection() {
				var svg = this.$refs.svg.querySelector('svg');
				svg.querySelectorAll('.kanji-component-selected').forEach((element: SVGGraphicsElement) => {
					element.classList.remove('kanji-component-selected');
				});

				if (this.selected !== null) {
					svg.querySelectorAll('*').forEach((element: SVGGraphicsElement) => {
						if (element.getAttribute('kvg:element') === this.selected.kanji) {
							element.classList.add('kanji-component-selected');
						}
					});
				}
			},
		},
	});
</script>
<style scoped>
	.kanji-container {
		min-height: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: auto auto auto;
		column-gap: 0.5em;
	}

	.kanji-meanings-lang-group {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 0.5em;
		margin-bottom: 0.5em;
	}
	.kanji-meanings-list ol {
		margin: 0;
		padding: 0;
	}
	.kanji-meanings-list ol li {
		list-style-type: decimal;
		list-style-position: inside;
		display: list-item;
	}

	.kanji-svg-container {
		min-height: 100%;
		height: 100%;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kanji-svg-container >>> svg {
		width: auto;
		height: 100%;
	}

	.kanji-svg-container >>> svg text {
		font-size: 0.5em;
	}

	.kanji-svg-container >>> svg .kanji-component:hover {
		cursor: zoom-in;
	}
	.kanji-svg-container >>> svg .kanji-component:hover * {
		stroke: var(--red);
	}
	.kanji-svg-container >>> svg .kanji-component:hover .bounding-box {
		stroke: var(--red);
		stroke-width: 1px;
		stroke-dasharray: 1, 2;
	}

	.kanji-svg-container >>> svg .kanji-component-selected * {
		stroke: var(--secondary) !important;
	}
	.kanji-svg-container >>> svg .kanji-component-selected .bounding-box {
		stroke: var(--secondary);
		stroke-width: 1px;
		stroke-dasharray: 1, 2;
	}

	.kanji-container.zooming {
		position: relative;
		padding-right: 1.5em;
		grid-template-columns: auto;
		grid-template-rows: auto auto;
		row-gap: 0;
	}
	.kanji-container.zooming >>> svg {
		width: auto;
		height: auto;
	}

	.kanji-container.zooming .kanji-readings {
		display: none;
	}
	.kanji-container.zooming .kanji-meanings-lang-group {
		grid-template-columns: auto;
	}
	.kanji-container.zooming .kanji-meanings-lang-group:nth-child(n+2) {
		display: none;
	}
	.kanji-container.zooming .kanji-meanings-lang {
		display: none;
	}
	.kanji-container.zooming .kanji-meanings-list {
	}
	.kanji-container.zooming .kanji-meanings-list ol li:nth-child(n+2) {
		display: none;
	}
	.kanji-container.zooming .kanji-meanings-list ol li {
		list-style-type: none;
		display: block;
		text-align: center;
	}

	.kanji-container.zooming::before,
	.kanji-container.zooming::after {
		content: "";
		position: absolute;
		display: block;
		top: 50%;
		width: 0.3em;
		height: 1.5em;
		background: var(--dark);
		transform-origin: top center;
		box-sizing: border-box;
	}
	.kanji-container.zooming::before {
		right: 0;
		transform: rotate(135deg);
		margin-top: 0.075em;
	}
	.kanji-container.zooming::after {
		right: 0;
		transform: rotate(45deg);
		margin-top: -0.075em;
	}
</style>
