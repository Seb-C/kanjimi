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

function getTagFromNode($node) {
	$child = $node->childNodes[0];
	if ($child instanceof DOMEntityReference) {
		return $child->nodeName;
	} else {
		die('err');
	}
}

sql('TRUNCATE TABLE "Word";');
sql('TRUNCATE TABLE "PartOfSpeech";');

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);
$doctype = $xml->readOuterXml();
preg_match_all('/<!ENTITY ([^ ]+) "([^"]+)">/', $doctype, $matches);

$tagValues = [];
foreach ($matches[1] as $i => $tag) {
	$tagValues[$tag] = $matches[2][$i];
}

$createdPos = [];
function addPartOfSpeechIfNeeded($tag) {
	global $tagValues, $createdPos;
	$description = $tagValues[$tag];
	if (!isset($createdPos[$tag])) {
		$createdPos[$tag] = true;
		sql('INSERT INTO "PartOfSpeech" VALUES (:tag, :description)', compact('tag', 'description'));
	}
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

		$senseArray = compact('pos', 'translations');

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
				$posArray = empty($sense['pos']) ? '{}' : '{"'.implode('","', $sense['pos']).'"}';

				foreach ($sense['translations'] as $translation) {
					sql('
						INSERT INTO "Word" VALUES (
							DEFAULT,
							:word,
							:reading,
							\''.$posArray.'\',
							:translationLang,
							:translation
						);
					', [
						'word'            => $word['word'] === null ? $reading['reading'] : $word['word'],
						'reading'         => $reading['reading'],
						'translation'     => $translation['translation'],
						'translationLang' => $translation['lang'],
					]);
				}
			}
		}
	}

	if ($count % 10 == 0) {
		$db->commit();
		$db->beginTransaction();
	}

	$xml->next('entry');
}
$db->commit();
