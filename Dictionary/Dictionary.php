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
	$file = fopen(__DIR__ . "/../src/Server/Lexer/data/definitions-$lang.csv", "w");
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
				$words[$i]['readings'][] = $reading;
			}
		} else {
			foreach ($restr as $x) {
				foreach ($words as $i => $word) {
					if ($word['word'] == $x->nodeValue) {
						$words[$i]['readings'][] = $reading;
						break;
					}
				}
			}
		}
	}

	// Fallback if no readings at all
	foreach ($words as $i => $word) {
		if (count($word['readings']) === 0 && !empty($reading)) {
			$words[$i]['readings'][] = $entry->getElementsByTagName('reb')[0]->nodeValue;
			break;
		}
	}

	if (count($words) === 1 && $words[0]['word'] === null) {
		$readings = $words[0]['readings'];
		$words = [];
		foreach ($readings as $reading) {
			$words[] = [
				'word' => $reading,
				'readings' => [$reading],
			];
		}
	}

	$tags = [];
	foreach ($entry->getElementsByTagName('pos') as $x) {
		$child = $x->childNodes[0];
		if ($child instanceof DOMEntityReference) {
			$tags[$child->nodeName] = true;
		} else {
			die('err');
		}
	}
	foreach ($entry->getElementsByTagName('misc') as $x) {
		$child = $x->childNodes[0];
		if ($child instanceof DOMEntityReference) {
			$tags[$child->nodeName] = true;
		} else {
			die('err');
		}
	}

	$translations = [];
	foreach ($entry->getElementsByTagName('lsource') as $x) {
		$translation = $x->nodeValue;
		if (empty($translation)) continue;
		$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
		if (array_key_exists($lang, $languageCodes)) {
			$lang = $languageCodes[$lang];
			$translations[] = compact('lang', 'translation');
		}
	}
	foreach ($entry->getElementsByTagName('gloss') as $x) {
		$translation = $x->nodeValue;
		$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
		if (array_key_exists($lang, $languageCodes)) {
			$lang = $languageCodes[$lang];
			$translations[] = compact('lang', 'translation');
		}
	}

	foreach ($words as $word) {
		$wordTags = array_keys($tags);

		foreach ($additionalTags as $additionalTag => $additionalTagWords) {
			if (array_key_exists($word['word'], $additionalTagWords)) {
				$wordTags[] = $additionalTag;
			}
		}

		sort($wordTags); // Useful to optimize the dictionary loading and avoid conflicts

		foreach ($word['readings'] as $reading) {
			fputcsv($wordsFile, [
				$word['word'],
				$reading,
				implode('/', $wordTags),
			]);
		}

		$alreadyOutputtedTranslations = [];
		foreach ($translations as $translation) {
			$lang = $translation['lang'];
			$trans = $translation['translation'];
			if (!array_key_exists($lang, $alreadyOutputtedTranslations)) {
				$alreadyOutputtedTranslations[$lang] = [];
			}
			if (array_key_exists($trans, $alreadyOutputtedTranslations[$lang])) {
				continue;
			}

			fputcsv($definitionsCsvPerLang[$lang], [$word['word'], $trans]);
			$alreadyOutputtedTranslations[$lang][$trans] = true;
		}
	}

	$xml->next('entry');
}
