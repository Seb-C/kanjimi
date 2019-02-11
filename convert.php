<?php

// TODO 3 join tables: if no xml tags only, must insert everything
// TODO end reformat and organize synonyms and anthonyms (cf TODO at the end of the file)
// TODO rename some tables that should not be prefixed
// TODO Kanjis dictionary?
// TODO names dictionary?

$db = new PDO('pgsql:host=localhost;port=5432;dbname=test;user=test;password=test');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$xml = new XMLReader();
$xml->open('./xml/Dictionary.xml');

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

sql('DROP SCHEMA public CASCADE;');
sql('CREATE SCHEMA public;');

sql('CREATE TYPE "SenseType" AS ENUM(\'literal\', \'figurative\', \'explanation\');');

sql('CREATE TABLE "PartOfSpeech" ("tag" TEXT NOT NULL PRIMARY KEY, "description" TEXT NOT NULL);');

sql('CREATE TABLE "Word" ("id" SERIAL PRIMARY KEY NOT NULL, "word" TEXT NOT NULL, "frequency" INTEGER NULL, "ateji" BOOLEAN NOT NULL, "irregularKanji" BOOLEAN NOT NULL, "irregularKana" BOOLEAN NOT NULL, "outDatedKanji" BOOLEAN NOT NULL);');

sql('CREATE TABLE "Reading" ("id" SERIAL PRIMARY KEY NOT NULL, "reading" TEXT NOT NULL, "trueReading" BOOLEAN NOT NULL, "frequency" INTEGER NULL, "irregular" BOOLEAN NOT NULL, "outDated" BOOLEAN NOT NULL);');
sql('CREATE TABLE "ReadingWord" ("readingId" INTEGER NOT NULL REFERENCES "Reading"("id"), "wordId" INTEGER NOT NULL REFERENCES "Word"("id"), PRIMARY KEY ("readingId", "wordId"));');

sql('CREATE TABLE "Sense" ("id" SERIAL PRIMARY KEY NOT NULL, "info" TEXT NULL, "dialect" TEXT[] NOT NULL, "context" TEXT[] NOT NULL, "type" TEXT[] NOT NULL, "partOfSpeech" TEXT[] NOT NULL);');
sql('CREATE TABLE "SenseWord" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "wordId" INTEGER NOT NULL REFERENCES "Word"("id"), PRIMARY KEY ("senseId", "wordId"));');
sql('CREATE TABLE "SenseReading" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "readingId" INTEGER NOT NULL REFERENCES "Reading"("id"), PRIMARY KEY ("senseId", "readingId"));');
sql('CREATE TABLE "SenseTranslation" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "lang" TEXT NOT NULL, "translation" TEXT NOT NULL, "type" "SenseType" NULL);');
sql('CREATE TABLE "SenseOrigin" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "lang" TEXT NOT NULL, "translation" TEXT NOT NULL, "describesFully" BOOLEAN NOT NULL, "madeFromForeignWords" BOOLEAN NOT NULL);');
sql('CREATE TABLE "SenseSynonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "word" TEXT NULL, "reading" TEXT NULL, "senseNumber" INT NULL);');
sql('CREATE TABLE "SenseAnthonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "word" TEXT NULL, "reading" TEXT NULL, "senseNumber" INT NULL);');

function parseTypeTag($string) {
	return [
		'abbr' => 'abbreviation',
		'arch' => 'archaism',
		'chn' => 'childish',
		'col' => 'colloquialism',
		'derog' => 'derogatory',
		'fam' => 'familiar',
		'fem' => 'feminine',
		'hon' => 'sonkeigo',
		'hum' => 'kenjougo',
		'id' => 'idiomatic',
		'm-sl' => 'manga-slang',
		'male' => 'masculine',
		'obs' => 'obsolete',
		'obsc' => 'obscure',
		'on-mim' => 'onomatopoeic',
		'poet' => 'poetical',
		'pol' => 'teineigo',
		'proverb' => 'proverb',
		'quote' => 'quotation',
		'rare' => 'rare',
		'sens' => 'sensitive',
		'sl' => 'slang',
		'uk' => 'kana-only',
		'yoji' => 'yojijukugo',
		'vulg' => 'vulgar',
		'joc' => 'humorous',
	][$string];
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

$createdPos = [];
function addPartOfSpeechIfNeeded($tag) {
	global $createdPos, $tagValues;
	if (!isset($createdPos[$tag])) {
		$description = $createdPos[$tag] = $tagValues[$tag];
		sql('INSERT INTO "PartOfSpeech" VALUES (:tag, :description)', compact('tag', 'description'));
	}
}

$translationTypes = [
	'lit' => 'literal',
	'fig' => 'figurative',
	'expl' => 'explanation',
];

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

$count = 0; $total = 181967;
$db->beginTransaction();
while($xml->name === 'entry') {
	$entry = $xml->expand();
	echo ($count++).' / '.$total.' = '.round($count / $total * 100)."%\n";

	$wordIds = [];
	foreach ($entry->getElementsByTagName('k_ele') as $k) {
		$word = $k->getElementsByTagName('keb')[0]->nodeValue;

		$frequency = null;
		foreach ($k->getElementsByTagName('ke_pri') as $x) {
			$newFrequency = parseFrequency($x->nodeValue);
			if ($newFrequency == null) continue;
			if ($frequency == null || $newFrequency > $frequency) $frequency = $newFrequency;
		}

		$ateji = 0;
		$irregularKanji = 0;
		$irregularKana = 0;
		$outDatedKanji = 0;
		foreach ($k->getElementsByTagName('ke_inf') as $x) {
			$tag = getTagFromNode($x);
			if ($tag == 'ateji') {
				$ateji = 1;
			} elseif ($tag == 'ik' || $tag == 'io') {
				$irregularKana = 1;
			} elseif ($tag == 'iK') {
				$irregularKanji = 1;
			} elseif ($tag == 'oK') {
				$outDatedKanji = 1;
			}
		}

		sql('INSERT INTO "Word" VALUES(DEFAULT, :word, :frequency, :ateji, :irregularKanji, :irregularKana, :outDatedKanji);', compact('word', 'frequency', 'ateji', 'irregularKanji', 'irregularKana', 'outDatedKanji'));
		$wordId = lastId();
		$wordIds[$word] = $wordId;
	}

	$readingIds = [];
	foreach ($entry->getElementsByTagName('r_ele') as $r) {
		$reading = $r->getElementsByTagName('reb')[0]->nodeValue;
		$trueReading = count($r->getElementsByTagName('re_nokanji')) == 0 ? 1 : 0;

		$frequency = null;
		foreach ($r->getElementsByTagName('re_pri') as $x) {
			$newFrequency = parseFrequency($x->nodeValue);
			if ($newFrequency == null) continue;
			if ($frequency == null || $newFrequency > $frequency) $frequency = $newFrequency;
		}

		$irregular = 0;
		$outDated = 0;
		foreach ($r->getElementsByTagName('re_inf') as $x) {
			$tag = getTagFromNode($x);
			if ($tag == 'ok' || $tag == 'oik') {
				$outDated = 1;
			}
			if ($tag == 'ik' || $tag == 'oik') {
				$irregular = 1;
			}
		}

		sql('INSERT INTO "Reading" VALUES(DEFAULT, :reading, :trueReading, :frequency, :irregular, :outDated);', compact('reading', 'trueReading', 'frequency', 'irregular', 'outDated'));
		$readingId = lastId();
		$readingIds[$reading] = $readingId;

		foreach ($r->getElementsByTagName('re_restr') as $x) {
			$wordId = $wordIds[$x->nodeValue];
			sql('INSERT INTO "ReadingWord" VALUES(:readingId, :wordId);', compact('readingId', 'wordId'));
		}
	}

	foreach ($entry->getElementsByTagName('sense') as $sense) {
		$info = null;
		$sInf = $sense->getElementsByTagName('s_inf');
		if (count($sInf) > 0) $info = $sInf[0]->nodeValue;

		$dialect = [];
		foreach ($sense->getElementsByTagName('dial') as $x) {
			$dialect[] = preg_replace('/-ben$/', '', $tagValues[getTagFromNode($x)]);
		}
		$dialectArray = empty($dialect) ? '{}' : '{"'.implode('","', $dialect).'"}';

		$context = [];
		foreach ($sense->getElementsByTagName('field') as $x) {
			$context[] = parseContextTag(getTagFromNode($x));
		}
		$contextArray = empty($context) ? '{}' : '{"'.implode('","', $context).'"}';

		$type = [];
		foreach ($sense->getElementsByTagName('misc') as $x) {
			$type[] = parseTypeTag(getTagFromNode($x));
		}
		$typeArray = empty($type) ? '{}' : '{"'.implode('","', $type).'"}';

		$pos = [];
		foreach ($sense->getElementsByTagName('pos') as $x) {
			addPartOfSpeechIfNeeded($pos[] = getTagFromNode($x));
		}
		$posArray = empty($pos) ? '{}' : '{"'.implode('","', $pos).'"}';

		sql('INSERT INTO "Sense" VALUES(DEFAULT, :info, \''.$dialectArray.'\', \''.$contextArray.'\', \''.$typeArray.'\', \''.$posArray.'\');', compact('info'));
		$senseId = lastId();

		foreach ($sense->getElementsByTagName('stagk') as $x) {
			$wordId = $wordIds[$x->nodeValue];
			sql('INSERT INTO "SenseWord" VALUES(:senseId, :wordId);', compact('senseId', 'wordId'));
		}
		foreach ($sense->getElementsByTagName('stagr') as $x) {
			$readingId = $readingIds[$x->nodeValue];
			sql('INSERT INTO "SenseReading" VALUES(:senseId, :readingId);', compact('senseId', 'readingId'));
		}

		foreach ($sense->getElementsByTagName('xref') as $x) {
			$word = $reading = $senseNumber = null;
			$values = explode('・', $x->nodeValue);

			if (is_numeric(end($values))) {
				$senseNumber = (int) array_pop($values);
			}
			if (count($values) == 2) {
				list($word, $reading) = $values;
			} elseif (count($values) == 1) {
				$word = $values[0];
			}

			sql('INSERT INTO "SenseSynonym" VALUES(DEFAULT, :senseId, :word, :reading, :senseNumber);', compact('senseId', 'word', 'reading', 'senseNumber'));
		}
		foreach ($sense->getElementsByTagName('ant') as $x) {
			$word = $reading = $senseNumber = null;
			$values = explode('・', $x->nodeValue);

			if (is_numeric(end($values))) {
				$senseNumber = (int) array_pop($values);
			}
			if (count($values) == 2) {
				list($word, $reading) = $values;
			} elseif (count($values) == 1) {
				$word = $values[0];
			}

			sql('INSERT INTO "SenseAnthonym" VALUES(DEFAULT, :senseId, :word, :reading, :senseNumber);', compact('senseId', 'word', 'reading', 'senseNumber'));
		}
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$value = $x->nodeValue;
			if (empty($value)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$describesFully = empty($x->getAttribute('ls_type')) || $x->getAttribute('ls_type') == 'full' ? 1 : 0;
			$madeFromForeignWords = $x->getAttribute('ls_wasei') == 'y' ? 1 : 0;
			sql(
				'INSERT INTO "SenseOrigin" VALUES(DEFAULT, :senseId, :lang, :translation, :describesFully, :madeFromForeignWords);',
				compact('senseId', 'lang', 'translation', 'describesFully', 'madeFromForeignWords')
			);
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$translation = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$type = empty($x->getAttribute('g_type')) ? null : $translationTypes[$x->getAttribute('g_type')];
			sql(
				'INSERT INTO "SenseTranslation" VALUES(DEFAULT, :senseId, :lang, :translation, :type);',
				compact('senseId', 'lang', 'translation', 'type')
			);
		}
	}

	if ($count % 50 == 0) {
		$db->commit();
		$db->beginTransaction();
	}

	$xml->next('entry');
}
$db->commit();

/*
ALTER TABLE "SenseSynonym"
	ADD "synonymWordId" INTEGER NULL REFERENCES "Word"("id"),
	ADD "synonymReadingId" INTEGER NULL REFERENCES "Reading"("id"),
	ADD "synonymSenseId" INTEGER NULL REFERENCES "Sense"("id");

-- Identifying word
UPDATE "SenseSynonym" SET "synonymWordId" = "Word"."id"
FROM "Word"
WHERE "SenseSynonym"."word" = "Word"."word"
AND "SenseSynonym"."word" IS NOT NULL;

-- Identifying reading
UPDATE "SenseSynonym" SET "synonymReadingId" = "Reading"."id"
FROM "Reading"
WHERE "SenseSynonym"."reading" = "Reading"."reading"
AND "SenseSynonym"."reading" IS NOT NULL;

-- Identifying reading if the word field contained a reading
UPDATE "SenseSynonym" SET "synonymReadingId" = "Reading"."id"
FROM "Reading"
WHERE "SenseSynonym"."synonymWordId" IS NULL
AND "SenseSynonym"."word" = "Reading"."reading"
AND "SenseSynonym"."word" IS NOT NULL;

// TODO sense field id to fill from the given index
// TODO drop old fields
// TODO same for anthonyms

*/
