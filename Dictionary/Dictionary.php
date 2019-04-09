<?php

// From: http://ftp.monash.edu/pub/nihongo/JMdict.gz

$db = new PDO('pgsql:host=localhost;port=5432;dbname=test;user=test;password=test');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$xml = new XMLReader();
$xml->open(__DIR__.'/xml/Dictionary.xml');

function sql($str, $params = []) {
	$params2 = [];
	foreach ($params AS $k => $v) {
		$params2[':'.$k] = $v;
	}

	global $db;
	return $db->prepare($str)->execute($params2);
}
function lastId() {
	global $db;
	return $db->lastInsertId();
}

function parseFrequency($str) {
	if (preg_match('/^nf([0-9]+)$/', $str, $matches)) {
		return (int) $matches[1];
	} else {
		// Ignoring others as not very precise
		return null;
	}
}

function getTagFromNode($node) {
	$child = $node->childNodes[0];
	if ($child instanceof DOMEntityReference) {
		return $child->nodeName;
	} else {
		die('err');
	}
}

function parseContextTag($string) {
	return [
		'MA'      => 'martial arts',
		'Buddh'   => 'Buddhist',
		'chem'    => 'chemistry',
		'comp'    => 'computer',
		'food'    => 'food',
		'geom'    => 'geometry',
		'ling'    => 'linguistics',
		'math'    => 'mathematics',
		'mil'     => 'military',
		'physics' => 'physics',
		'archit'  => 'architecture',
		'astron'  => 'astronomy',
		'baseb'   => 'baseball',
		'biol'    => 'biology',
		'bot'     => 'botany',
		'bus'     => 'business',
		'econ'    => 'economics',
		'engr'    => 'engineering',
		'finc'    => 'finance',
		'geol'    => 'geology',
		'law'     => 'law',
		'mahj'    => 'mahjong',
		'med'     => 'medicine',
		'music'   => 'music',
		'Shinto'  => 'Shinto',
		'shogi'   => 'shogi',
		'sports'  => 'sports',
		'sumo'    => 'sumo',
		'zool'    => 'zoology',
		'anat'    => 'anatomical',
	][$string];
}

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);
$doctype = $xml->readOuterXml();
preg_match_all('/<!ENTITY ([^ ]+) "([^"]+)">/', $doctype, $matches);

$tagValues = [];
foreach ($matches[1] as $i => $tag) {
	$tagValues[$tag] = $matches[2][$i];
}

function addPartOfSpeechIfNeeded($tag) {
	global $tagValues;
	$description = $tagValues[$tag];
	sql('INSERT INTO "PartOfSpeech" VALUES (:tag, :description) ON CONFLICT DO NOTHING', compact('tag', 'description'));
}

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

$count = 0; $total = 181967;
$db->beginTransaction();
while($xml->name === 'entry') {
	$entry = $xml->expand();
	echo ($count++).' / '.$total.' = '.round($count / $total * 100)."%\n";

	$words = [];
	foreach ($entry->getElementsByTagName('k_ele') as $k) {
		$word = $k->getElementsByTagName('keb')[0]->nodeValue;

		$frequency = null;
		foreach ($k->getElementsByTagName('ke_pri') as $x) {
			$newFrequency = parseFrequency($x->nodeValue);
			if ($newFrequency == null) continue;
			if ($frequency == null || $newFrequency > $frequency) $frequency = $newFrequency;
		}

		$words[] = [
			'word' => $word,
			'frequency' => $frequency,
			'readings' => [],
		];
	}

	if (empty($words)) {
		$words[] = [
			'word' => null,
			'frequency' => null,
			'readings' => [],
		];
	}

	foreach ($entry->getElementsByTagName('r_ele') as $r) {
		$reading = $r->getElementsByTagName('reb')[0]->nodeValue;

		$frequency = null;
		foreach ($r->getElementsByTagName('re_pri') as $x) {
			$newFrequency = parseFrequency($x->nodeValue);
			if ($newFrequency == null) continue;
			if ($frequency == null || $newFrequency > $frequency) $frequency = $newFrequency;
		}

		foreach ($words as $i => $word) {
			$words[$i]['readings'][] = [
				'reading' => $reading,
				'frequency' => $frequency,
				'senses' => [],
			];
		}
	}

	foreach ($entry->getElementsByTagName('sense') as $sense) {
		$context = [];
		foreach ($sense->getElementsByTagName('field') as $x) {
			$context[] = parseContextTag(getTagFromNode($x));
		}

		$pos = [];
		foreach ($sense->getElementsByTagName('pos') as $x) {
			addPartOfSpeechIfNeeded($pos[] = getTagFromNode($x));
		}

		$translations = [];
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$value = $x->nodeValue;
			if (empty($value)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;

			$translations[] = compact('lang', 'translation');
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$translation = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$translations[] = compact('lang', 'translation');
		}

		$senseArray = compact('context', 'pos', 'translations');

		$stagk = $sense->getElementsByTagName('stagk');
		if (count($stagk) == 0) {
			foreach ($words AS $i => $word) {
				foreach ($words[$i]['readings'] as $j => $reading) {
					$words[$i]['readings'][$j]['senses'][] = $senseArray;
				}
			}
		} else {
			foreach ($stagk as $x) {
				foreach ($words[$x->nodeValue]['readings'] as $i => $reading) {
					$words[$x->nodeValue]['readings'][$i]['senses'][] = $senseArray;
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
					$words[$i]['readings'][$x->nodeValue]['senses'][] = $senseArray;
				}
			}
		}
	}

	foreach ($words as $word) {
		foreach ($word['readings'] as $reading) {
			foreach ($reading['senses'] as $sense) {
				foreach ($sense['translations'] as $translation) {
					if ($word['frequency'] === null && $reading['frequency'] === null) {
						$frequency = null;
					} else {
						$frequency = ((int) $word['frequency']) + ((int) $reading['frequency']);
					}

					$contextArray = empty($sense['context']) ? '{}' : '{"'.implode('","', $sense['context']).'"}';
					$posArray = empty($sense['pos']) ? '{}' : '{"'.implode('","', $sense['pos']).'"}';

					sql('
						INSERT INTO "Word" VALUES (
							DEFAULT,
							:word,
							:reading,
							:frequency,
							\''.$contextArray.'\',
							\''.$posArray.'\',
							:translation,
							:translationLang
						) ON CONFLICT DO NOTHING
					', [
						'word'            => $word['word'] === null ? $reading['reading'] : $word['word'],
						'reading'         => $reading['reading'],
						'frequency'       => $frequency,
						'translation'     => $translation['translation'],
						'translationLang' => $translation['lang'],
					]);
				}
			}
		}
	}

	if ($count % 50 == 0) {
		$db->commit();
		$db->beginTransaction();
	}

	$xml->next('entry');
}
$db->commit();
