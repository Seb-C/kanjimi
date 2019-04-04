<?php

// Old version of the script (full-featured)

// TODO Kanjis dictionary?
// TODO names dictionary?

// From: http://ftp.monash.edu/pub/nihongo/JMdict.gz

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
sql('CREATE TABLE "Translation" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "lang" TEXT NOT NULL, "translation" TEXT NOT NULL, "type" "SenseType" NULL);');
sql('CREATE TABLE "Origin" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "lang" TEXT NOT NULL, "translation" TEXT NOT NULL, "describesFully" BOOLEAN NOT NULL, "madeFromForeignWords" BOOLEAN NOT NULL);');
sql('CREATE TABLE "Synonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "word" TEXT NULL, "reading" TEXT NULL, "senseNumber" INT NULL);');
sql('CREATE TABLE "Anthonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "word" TEXT NULL, "reading" TEXT NULL, "senseNumber" INT NULL);');

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

		$restr = $r->getElementsByTagName('re_restr');
		if (count($restr) == 0) {
			foreach ($wordIds AS $wordId) {
				sql('INSERT INTO "ReadingWord" VALUES(:readingId, :wordId);', compact('readingId', 'wordId'));
			}
		} else {
			foreach ($restr as $x) {
				$wordId = $wordIds[$x->nodeValue];
				sql('INSERT INTO "ReadingWord" VALUES(:readingId, :wordId);', compact('readingId', 'wordId'));
			}
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

		$stagk = $sense->getElementsByTagName('stagk');
		if (count($stagk) == 0) {
			foreach ($wordIds AS $wordId) {
				sql('INSERT INTO "SenseWord" VALUES(:senseId, :wordId);', compact('senseId', 'wordId'));
			}
		} else {
			foreach ($stagk as $x) {
				$wordId = $wordIds[$x->nodeValue];
				sql('INSERT INTO "SenseWord" VALUES(:senseId, :wordId);', compact('senseId', 'wordId'));
			}
		}

		$stagr = $sense->getElementsByTagName('stagr');
		if (count($stagr) == 0) {
			foreach ($readingIds AS $readingId) {
				sql('INSERT INTO "SenseReading" VALUES(:senseId, :readingId);', compact('senseId', 'readingId'));
			}
		} else {
			foreach ($stagr as $x) {
				$readingId = $readingIds[$x->nodeValue];
				sql('INSERT INTO "SenseReading" VALUES(:senseId, :readingId);', compact('senseId', 'readingId'));
			}
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

			sql('INSERT INTO "Synonym" VALUES(DEFAULT, :senseId, :word, :reading, :senseNumber);', compact('senseId', 'word', 'reading', 'senseNumber'));
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

			sql('INSERT INTO "Anthonym" VALUES(DEFAULT, :senseId, :word, :reading, :senseNumber);', compact('senseId', 'word', 'reading', 'senseNumber'));
		}
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$value = $x->nodeValue;
			if (empty($value)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$describesFully = empty($x->getAttribute('ls_type')) || $x->getAttribute('ls_type') == 'full' ? 1 : 0;
			$madeFromForeignWords = $x->getAttribute('ls_wasei') == 'y' ? 1 : 0;
			sql(
				'INSERT INTO "Origin" VALUES(DEFAULT, :senseId, :lang, :translation, :describesFully, :madeFromForeignWords);',
				compact('senseId', 'lang', 'translation', 'describesFully', 'madeFromForeignWords')
			);
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$translation = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$type = empty($x->getAttribute('g_type')) ? null : $translationTypes[$x->getAttribute('g_type')];
			sql(
				'INSERT INTO "Translation" VALUES(DEFAULT, :senseId, :lang, :translation, :type);',
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


// SYNONYMS

sql('
	ALTER TABLE "Synonym"
		ADD "synonymWordId" INTEGER NULL REFERENCES "Word"("id"),
		ADD "synonymReadingId" INTEGER NULL REFERENCES "Reading"("id"),
		ADD "synonymSenseId" INTEGER NULL REFERENCES "Sense"("id");
');

// To optimize some queries
sql('CREATE INDEX "Reading_reading" ON "Reading"(reading);');

// Identifying word
sql('
	UPDATE "Synonym" SET "synonymWordId" = "Word"."id"
	FROM "Word"
	WHERE "Synonym"."word" = "Word"."word"
	AND "Synonym"."word" IS NOT NULL;
');

// Identifying reading
sql('
	UPDATE "Synonym" SET "synonymReadingId" = "Reading"."id"
	FROM "Reading"
	WHERE "Synonym"."reading" = "Reading"."reading"
	AND "Synonym"."reading" IS NOT NULL;
');

// Identifying reading if the word field contained a reading
sql('
	CREATE TEMP TABLE "UniqueReading" AS
	SELECT MIN("id") AS "id", "reading"
	FROM "Reading"
	GROUP BY "reading"
	HAVING COUNT("id") = 1;
');
sql('
	UPDATE "Synonym" SET "synonymReadingId" = "UniqueReading"."id"
	FROM "UniqueReading"
	WHERE "Synonym"."synonymWordId" IS NULL
	AND "Synonym"."synonymReadingId" IS NULL
	AND "Synonym"."word" = "UniqueReading"."reading"
	AND "Synonym"."word" IS NOT NULL;
');
sql('DROP TABLE "UniqueReading";');

// Calculating the matching sense from the given rank
sql('
	UPDATE "Synonym" SET "synonymSenseId" = "SenseIds"."senseId"
	FROM (
		SELECT "senseSynonymId", "senseId"
		FROM (
			SELECT DISTINCT
				"Synonym"."id" AS "senseSynonymId",
				"Synonym"."senseNumber",
				COALESCE("SenseWord"."senseId", "SenseReading"."senseId") AS "senseId",
				DENSE_RANK() OVER (
					PARTITION BY "Synonym"."id"
					ORDER BY COALESCE("SenseWord"."senseId", "SenseReading"."senseId") ASC
				) AS "senseRank"
			FROM "Synonym"
			LEFT OUTER JOIN "SenseWord" ON (
				"Synonym"."synonymWordId" = "SenseWord"."wordId"
				AND "Synonym"."synonymWordId" IS NOT NULL
			)
			LEFT OUTER JOIN "SenseReading" ON (
				"Synonym"."synonymReadingId" = "SenseReading"."readingId"
				AND "Synonym"."synonymReadingId" IS NOT NULL
			)
			WHERE "Synonym"."senseNumber" IS NOT NULL
		) AS "S"
		WHERE "S"."senseNumber" = "S"."senseRank"
	) AS "SenseIds"
	WHERE "Synonym"."id" = "SenseIds"."senseSynonymId"
');

// Removing now useless columns
sql('
	ALTER TABLE "Synonym"
		DROP COLUMN "word",
		DROP COLUMN "reading",
		DROP COLUMN "senseNumber";
');

// Removing unusable rows
sql('
	DELETE FROM "Synonym"
	WHERE "synonymWordId" IS NULL
	AND "synonymReadingId" IS NULL
	AND "synonymSenseId" IS NULL
');

sql('DROP INDEX "Reading_reading";');


// ANTHONYMS

sql('
	ALTER TABLE "Anthonym"
		ADD "anthonymWordId" INTEGER NULL REFERENCES "Word"("id"),
		ADD "anthonymReadingId" INTEGER NULL REFERENCES "Reading"("id"),
		ADD "anthonymSenseId" INTEGER NULL REFERENCES "Sense"("id");
');

// To optimize some queries
sql('CREATE INDEX "Reading_reading" ON "Reading"(reading);');

// Identifying word
sql('
	UPDATE "Anthonym" SET "anthonymWordId" = "Word"."id"
	FROM "Word"
	WHERE "Anthonym"."word" = "Word"."word"
	AND "Anthonym"."word" IS NOT NULL;
');

// Identifying reading
sql('
	UPDATE "Anthonym" SET "anthonymReadingId" = "Reading"."id"
	FROM "Reading"
	WHERE "Anthonym"."reading" = "Reading"."reading"
	AND "Anthonym"."reading" IS NOT NULL;
');

// Identifying reading if the word field contained a reading
sql('
	CREATE TEMP TABLE "UniqueReading" AS
	SELECT MIN("id") AS "id", "reading"
	FROM "Reading"
	GROUP BY "reading"
	HAVING COUNT("id") = 1;
');
sql('
	UPDATE "Anthonym" SET "anthonymReadingId" = "UniqueReading"."id"
	FROM "UniqueReading"
	WHERE "Anthonym"."anthonymWordId" IS NULL
	AND "Anthonym"."anthonymReadingId" IS NULL
	AND "Anthonym"."word" = "UniqueReading"."reading"
	AND "Anthonym"."word" IS NOT NULL;
');
sql('DROP TABLE "UniqueReading";');

// Calculating the matching sense from the given rank
sql('
	UPDATE "Anthonym" SET "anthonymSenseId" = "SenseIds"."senseId"
	FROM (
		SELECT "senseAnthonymId", "senseId"
		FROM (
			SELECT DISTINCT
				"Anthonym"."id" AS "senseAnthonymId",
				"Anthonym"."senseNumber",
				COALESCE("SenseWord"."senseId", "SenseReading"."senseId") AS "senseId",
				DENSE_RANK() OVER (
					PARTITION BY "Anthonym"."id"
					ORDER BY COALESCE("SenseWord"."senseId", "SenseReading"."senseId") ASC
				) AS "senseRank"
			FROM "Anthonym"
			LEFT OUTER JOIN "SenseWord" ON (
				"Anthonym"."anthonymWordId" = "SenseWord"."wordId"
				AND "Anthonym"."anthonymWordId" IS NOT NULL
			)
			LEFT OUTER JOIN "SenseReading" ON (
				"Anthonym"."anthonymReadingId" = "SenseReading"."readingId"
				AND "Anthonym"."anthonymReadingId" IS NOT NULL
			)
			WHERE "Anthonym"."senseNumber" IS NOT NULL
		) AS "S"
		WHERE "S"."senseNumber" = "S"."senseRank"
	) AS "SenseIds"
	WHERE "Anthonym"."id" = "SenseIds"."senseAnthonymId"
');

// Removing now useless columns
sql('
	ALTER TABLE "Anthonym"
		DROP COLUMN "word",
		DROP COLUMN "reading",
		DROP COLUMN "senseNumber";
');

// Removing unusable rows
sql('
	DELETE FROM "Anthonym"
	WHERE "anthonymWordId" IS NULL
	AND "anthonymReadingId" IS NULL
	AND "anthonymSenseId" IS NULL
');

sql('DROP INDEX "Reading_reading";');

