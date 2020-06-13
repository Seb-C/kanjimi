<?php

// From: http://ftp.monash.edu/pub/nihongo/JMdict.gz

$languageCodes = [
	'dut' => 'nl',
	'eng' => 'en',
	'fre' => 'fr',
	'ger' => 'de',
	'hun' => 'hu',
	'rus' => 'ru',
	'slv' => 'sl',
	'spa' => 'es',
	'swe' => 'sv',
];

$additionalTags = [
	'jlpt-1' => include(__DIR__ . '/jlpt/1.php'),
	'jlpt-2' => include(__DIR__ . '/jlpt/2.php'),
	'jlpt-3' => include(__DIR__ . '/jlpt/3.php'),
	'jlpt-4' => include(__DIR__ . '/jlpt/4.php'),
	'jlpt-5' => include(__DIR__ . '/jlpt/5.php'),
];

$definitionsCsvPerLang = [];
foreach ($languageCodes as $lang) {
	$file = fopen(__DIR__ . "/../src/Server/Lexer/data/words-$lang.csv", "w");
	$definitionsCsvPerLang[$lang] = $file;
}

$wordsFile = fopen(__DIR__ . "/../src/Server/Lexer/data/words.csv", "w");

$xml = new XMLReader();
$xml->open(__DIR__.'/xml/Dictionary.xml');

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

$count = 0; $total = 181967;
while($xml->name === 'entry') {
	$entry = $xml->expand();
	echo ($count++).' / '.$total.' = '.round($count / $total * 100)."%\n";

	$words = [];
	foreach ($entry->getElementsByTagName('k_ele') as $k) {
		$word = $k->getElementsByTagName('keb')[0]->nodeValue;

		$words[] = [
			'word' => $word,
			'readings' => [],
		];
	}

	if (empty($words)) {
		$words[] = [
			'word' => null,
			'readings' => [],
		];
	}

	foreach ($entry->getElementsByTagName('r_ele') as $r) {
		$reading = $r->getElementsByTagName('reb')[0]->nodeValue;

		$restr = $r->getElementsByTagName('re_restr');
		if (count($restr) == 0) {
			foreach ($words as $i => $word) {
				$words[$i]['readings'][] = [
					'reading' => $reading,
					'senses' => [],
				];
			}
		} else {
			foreach ($restr as $x) {
				foreach ($words as $i => $word) {
					if ($word['word'] == $x->nodeValue) {
						$words[$i]['readings'][] = [
							'reading' => $reading,
							'senses' => [],
						];
						break;
					}
				}
			}
		}
	}

	$tags = [];
	foreach ($entry->getElementsByTagName('sense') as $sense) {
		foreach ($sense->getElementsByTagName('pos') as $x) {
			$child = $x->childNodes[0];
			if ($child instanceof DOMEntityReference) {
				$tags[$child->nodeName] = true;
			} else {
				die('err');
			}
		}
		foreach ($sense->getElementsByTagName('misc') as $x) {
			$child = $x->childNodes[0];
			if ($child instanceof DOMEntityReference) {
				$tags[$child->nodeName] = true;
			} else {
				die('err');
			}
		}

		$translations = [];
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$translation = $x->nodeValue;
			if (empty($translation)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			if (array_key_exists($lang, $languageCodes)) {
				$lang = $languageCodes[$lang];
				$translations[] = compact('lang', 'translation');
			}
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$translation = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			if (array_key_exists($lang, $languageCodes)) {
				$lang = $languageCodes[$lang];
				$translations[] = compact('lang', 'translation');
			}
		}

		$senseArray = compact('translations');

		$stagk = $sense->getElementsByTagName('stagk');
		if (count($stagk) > 0) {
			foreach ($stagk as $x) {
				$wordIndex = null;
				foreach ($words as $i => $word) {
					if ($word['word'] == $x->nodeValue) {
						$wordIndex = $i;
						break;
					}
				}

				if ($wordIndex !== null) {
					foreach ($words[$wordIndex]['readings'] as $i => $reading) {
						$words[$wordIndex]['readings'][$i]['senses'][] = $senseArray;
					}
				}
			}
		}

		$stagr = $sense->getElementsByTagName('stagr');
		if (count($stagr) > 0) {
			foreach ($stagr as $x) {
				foreach ($words as $i => $word) {
					$readingIndex = null;
					foreach ($word['readings'] as $j => $reading) {
						if ($reading['reading'] == $x->nodeValue) {
							$readingIndex = $j;
							break;
						}
					}

					if ($readingIndex !== null) {
						$words[$i]['readings'][$readingIndex]['senses'][] = $senseArray;
					}
				}
			}
		}

		if (count($stagr) == 0 && count($stagk) == 0) {
			foreach ($words as $i => $word) {
				foreach ($words[$i]['readings'] as $j => $reading) {
					$words[$i]['readings'][$j]['senses'][] = $senseArray;
				}
			}
		}
	}

	foreach ($words as $word) {
		$wordTags = array_keys($tags);

		foreach ($additionalTags as $additionalTag => $additionalTagWords) {
			if (array_key_exists($word['word'], $additionalTagWords)) {
				$wordTags[] = $additionalTag;
			}
		}

		foreach ($word['readings'] as $reading) {
			foreach ($reading['senses'] as $sense) {
				foreach ($sense['translations'] as $translation) {
					fputcsv($definitionsCsvPerLang[$translation['lang']], [
						$word['word'] === null ? $reading['reading'] : $word['word'],
						$reading['reading'],
						$translation['translation'],
						implode('/', $wordTags),
					]);
				}
			}

			fputcsv($wordsFile, [
				$word['word'] === null ? $reading['reading'] : $word['word'],
				$reading['reading'],
				implode('/', $wordTags),
			]);
		}
	}

	$xml->next('entry');
}
