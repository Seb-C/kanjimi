<template>
	<div v-if="loading" class="kanjimi-loader" />
	<div v-else class="kanji" v-html="svg" ref="svg" />
</template>
<script lang="ts">
	import Vue from 'vue';
	import { getKanji } from 'Common/Api/Lexer';
	import Kanji from 'Common/Models/Kanjis/Kanji';
	import Structure from 'Common/Models/Kanjis/Structure';

	export default Vue.extend({
		props: {
			kanji: { type: String },
		},
		data() {
			return {
				loading: true,
				svg: <string|null>null,
				kanjiData: <{ [key: string]: Kanji}|null>null,
			};
		},
		created() {
			this.loadData();
		},
		updated() {
			if (!this.loading) {
				this.makeSvgInteractive();
			}
		},
		watch: {
			kanji(newVal, oldVal) {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				this.loading = true;
				this.kanjiData = await getKanji(this.$root.apiKey.key, this.kanji);

				const mainKanji = <Kanji>this.kanjiData[this.kanji];

				const svg = await (await fetch(mainKanji.fileUrl)).text();
				const domParser = new DOMParser();
				const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');

				this.svg = svgDocument.documentElement.outerHTML;
				this.loading = false;
			},

			/**
			 * We need to make this once the svg is displayed, otherwise some things
			 * like the bounding box have not been calculated.
			 */
			makeSvgInteractive() {
				const svg = this.$refs.svg.querySelector('svg');
				const mainKanji = <Kanji>this.kanjiData[this.kanji];
				const subKanjis = new Set(
					// Using a set to remove duplicates
					mainKanji.structure.getDirectSubStructures().map(s => s.element)
				);
				const elements = svg.querySelectorAll('*');

				// Moving the stroke numbers at first so it does not cover the bounding boxes
				const strokeNumbers = svg.querySelector('[id^="kvg:StrokeNumbers_"]');
				if (strokeNumbers) {
					strokeNumbers.parentNode.insertBefore(strokeNumbers, strokeNumbers.parentNode.firstChild);
				}

				// Adding the interactivity to all components of the Kanji
				subKanjis.forEach((subKanji) => {
					elements.forEach((element) => {
						if (element.getAttribute('kvg:element') === subKanji) {
							const containerBox = element.getBBox();

							element.classList.add('kanji-component');
							element.setAttribute('pointer-events', 'all');

							// Creating a bounding box to handle the mouse
							const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
							box.setAttribute('class', 'bounding-box');
							box.setAttribute('x', containerBox.x - 3);
							box.setAttribute('y', containerBox.y - 3);
							box.setAttribute('width', containerBox.width + 6);
							box.setAttribute('height', containerBox.height + 6);
							box.setAttribute('fill', 'none');
							box.setAttribute('stroke', 'none');

							element.appendChild(box);

							element.addEventListener('click', () => {
								console.log(element);
							});
						}
					});
				});
			},
		},
	});
</script>
<style scoped>
	.kanji {
		display: block;
		min-height: 100%;
		height: 100%;
		text-align: center;
	}

	.kanji >>> svg {
		width: auto;
		height: 100%;
	}

	.kanji >>> svg text {
		font-size: 0.5em;
	}

	.kanji >>> svg .kanji-component:hover {
		cursor: pointer;
	}
	.kanji >>> svg .kanji-component:hover * {
		stroke: var(--red);
	}
	.kanji >>> svg .kanji-component:hover .bounding-box {
		stroke: var(--red);
		stroke-width: 1px;
		stroke-dasharray: 1, 2;
	}
</style>
