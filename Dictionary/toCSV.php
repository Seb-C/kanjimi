<?php

// From: http://ftp.monash.edu/pub/nihongo/JMdict.gz

$out = fopen(__DIR__ . "/out.csv", "w");
fputcsv($out, [
	'word',
	'reading',
	'translationLang',
	'translation',
]);

$xml = new XMLReader();
$xml->open(__DIR__.'/xml/Dictionary.xml');

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);
$doctype = $xml->readOuterXml();
preg_match_all('/<!ENTITY ([^ ]+) "([^"]+)">/', $doctype, $matches);

$tagValues = [];
foreach ($matches[1] as $i => $tag) {
	$tagValues[$tag] = $matches[2][$i];
}

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

	foreach ($entry->getElementsByTagName('sense') as $sense) {
		$translations = [];
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$translation = $x->nodeValue;
			if (empty($translation)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$translations[] = compact('lang', 'translation');
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$translation = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$translations[] = compact('lang', 'translation');
		}

		$senseArray = compact('translations');

		$stagk = $sense->getElementsByTagName('stagk');
		if (count($stagk) == 0) {
			foreach ($words as $i => $word) {
				foreach ($words[$i]['readings'] as $j => $reading) {
					$words[$i]['readings'][$j]['senses'][] = $senseArray;
				}
			}
		} else {
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
		if (count($stagr) == 0) {
			foreach ($words as $i => $word) {
				foreach ($words[$i]['readings'] as $j => $reading) {
					$words[$i]['readings'][$j]['senses'][] = $senseArray;
				}
			}
		} else {
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
	}

	foreach ($words as $word) {
		foreach ($word['readings'] as $reading) {
			foreach ($reading['senses'] as $sense) {
				foreach ($sense['translations'] as $translation) {
					fputcsv($out, [
						$word['word'] === null ? $reading['reading'] : $word['word'],
						$reading['reading'],
						$translation['lang'],
						$translation['translation'],
					]);
				}
			}
		}
	}

	$xml->next('entry');
}
