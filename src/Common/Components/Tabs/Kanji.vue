<template>
	<div v-if="loading" class="kanjimi-loader" />
	<div v-else class="kanji-data-container">
		<div class="kanji-svg-container" v-html="mainSvg" ref="mainSvg" />
		<div class="kanji-svg-container" v-html="subSvg" ref="subSvg" />
	</div>
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
				mainSvg: <string|null>null,
				kanjiData: <{ [key: string]: Kanji}|null>null,
				subKanji: <string|null>null,
				subSvg: <string|null>null,
			};
		},
		created() {
			this.loadData();
		},
		updated() {
			if (!this.loading) {
				const subKanjiClickHandler = async (subKanji: string) => {
					this.subKanji = subKanji;
					if (this.kanjiData[subKanji]) {
						this.subSvg = await this.getSvg(<Kanji>this.kanjiData[subKanji]);
					} else {
						this.subSvg = null;
					}
				};

				this.makeSvgInteractive(
					this.$refs.mainSvg.querySelector('svg'),
					this.getDirectSubKanjis(this.kanji),
					subKanjiClickHandler,
				);

				if (this.subSvg !== null) {
					this.makeSvgInteractive(
						this.$refs.subSvg.querySelector('svg'),
						this.getDirectSubKanjis(this.subKanji),
						subKanjiClickHandler,
					);
				}
			}
		},
		watch: {
			kanji(newVal, oldVal) {
				this.loadData();
			}
		},
		methods: {
			getDirectSubKanjis(kanji: string): string {
				return (<Kanji>this.kanjiData[kanji])
					.structure
					.getDirectSubStructures()
					.map(s => s.element);
			},
			async getSvg(kanji: Kanji): Promise<string> {
				const svg = await (await fetch(kanji.fileUrl)).text();
				const domParser = new DOMParser();
				const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');
				return svgDocument.documentElement.outerHTML;
			}
			async loadData() {
				this.loading = true;
				this.kanjiData = await getKanji(this.$root.apiKey.key, this.kanji);
				this.mainSvg = await this.getSvg(<Kanji>this.kanjiData[this.kanji]);
				this.subKanji = null;
				this.subSvg = null;
				this.loading = false;
			},

			/**
			 * We need to make this once the svg is displayed, otherwise some things
			 * like the bounding box have not been calculated.
			 */
			makeSvgInteractive(
				svg: SVGSVGElement,
				subKanjis: string[],
				onClick: (kanji: string) => Promise<void>,
			) {
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
				// The Set is used to remove duplicates
				(new Set(subKanjis)).forEach((subKanji) => {
					svg.querySelectorAll('*').forEach((element) => {
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

							element.addEventListener('click', () => onClick(subKanji));
						}
					});
				});
			},
		},
	});
</script>
<style scoped>
	.kanji-data-container {
		display: grid;
		grid-auto-flow: column;
		min-height: 100%;
		height: 100%;
	}

	.kanji-svg-container {
		display: block;
		min-height: 100%;
		height: 100%;
		text-align: center;
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
</style>
