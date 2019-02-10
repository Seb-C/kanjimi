<?php

// TODO remove the tags and separate properly the corresponding data
// TODO simplify database structure if possible
// TODO reformat and organize synonyms and anthonyms

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

sql('CREATE TABLE "Tag" ("id" SERIAL PRIMARY KEY NOT NULL, "tag" TEXT, "description" TEXT NOT NULL);');

sql('CREATE TABLE "Word" ("id" SERIAL PRIMARY KEY NOT NULL, "writing" TEXT NOT NULL, "frequency" INTEGER NULL);');
sql('CREATE TABLE "WordTag" ("wordId" INTEGER NOT NULL REFERENCES "Word"("id"), "tagId" INTEGER NOT NULL REFERENCES "Tag"("id"), PRIMARY KEY ("wordId", "tagId"));');

sql('CREATE TABLE "Reading" ("id" SERIAL PRIMARY KEY NOT NULL, "reading" TEXT NOT NULL, "trueReading" BOOLEAN NOT NULL, "frequency" INTEGER NULL, "irregular" BOOLEAN NOT NULL, "outDated" BOOLEAN NOT NULL);');
sql('CREATE TABLE "ReadingWord" ("readingId" INTEGER NOT NULL REFERENCES "Reading"("id"), "wordId" INTEGER NOT NULL REFERENCES "Word"("id"), PRIMARY KEY ("readingId", "wordId"));');

sql('CREATE TABLE "Sense" ("id" SERIAL PRIMARY KEY NOT NULL, "info" TEXT NULL, "dialect" TEXT[] NOT NULL);');
sql('CREATE TABLE "SenseWord" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "wordId" INTEGER NOT NULL REFERENCES "Word"("id"), PRIMARY KEY ("senseId", "wordId"));');
sql('CREATE TABLE "SenseReading" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "readingId" INTEGER NOT NULL REFERENCES "Reading"("id"), PRIMARY KEY ("senseId", "readingId"));');
sql('CREATE TABLE "SenseTranslation" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "value" TEXT NOT NULL, "lang" TEXT NOT NULL, "type" "SenseType" NULL);');
sql('CREATE TABLE "SenseOrigin" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "value" TEXT NOT NULL, "lang" TEXT NOT NULL, "describesFully" BOOLEAN NOT NULL, "madeFromForeignWords" BOOLEAN NOT NULL);');
sql('CREATE TABLE "SenseSynonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "value" TEXT NOT NULL);');
sql('CREATE TABLE "SenseAnthonym" ("id" SERIAL PRIMARY KEY NOT NULL, "senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "value" TEXT NOT NULL);');
sql('CREATE TABLE "SenseTag" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "tagId" INTEGER NOT NULL REFERENCES "Tag"("id"), PRIMARY KEY ("senseId", "tagId"));');
sql('CREATE TABLE "SenseTagContext" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "tagId" INTEGER NOT NULL REFERENCES "Tag"("id"), PRIMARY KEY ("senseId", "tagId"));');
sql('CREATE TABLE "SenseTagPartOfSpeech" ("senseId" INTEGER NOT NULL REFERENCES "Sense"("id"), "tagId" INTEGER NOT NULL REFERENCES "Tag"("id"), PRIMARY KEY ("senseId", "tagId"));');

function parseFrequency($str) {
	if (preg_match('/^nf([0-9]+)$/', $str, $matches)) {
		return (int) $matches[1];
	} else {
		// Ignoring others as not very precise
		return null;
	}
}

$tags = [];
$tagValues = [];
function getTagAlias($node) {
	$child = $node->childNodes[0];
	if ($child instanceof DOMEntityReference) {
		return $child->nodeName;
	} else {
		die('err');
	}
}
function getTag($node) {
	global $tags;
	return $tags[getTagAlias($node)];
}
function getTagValue($node) {
	global $tagValues;
	return $tagValues[getTagAlias($node)];
}
function addTag ($tag, $description) {
	global $tags, $tagValues;
	sql('INSERT INTO "Tag" VALUES (DEFAULT, :tag, :description)', compact('tag', 'description'));
	$tags[$tag] = lastId();
	$tagValues[$tag] = $description;
};

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);
$doctype = $xml->readOuterXml();
preg_match_all('/<!ENTITY ([^ ]+) "([^"]+)">/', $doctype, $matches);

$db->beginTransaction();
foreach ($matches[1] as $i => $tag) {
	addTag($tag, $matches[2][$i]);
}
$db->commit();

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
		$writing = $k->getElementsByTagName('keb')[0]->nodeValue;

		$frequency = null;
		foreach ($k->getElementsByTagName('ke_pri') as $x) {
			$newFrequency = parseFrequency($x->nodeValue);
			if ($newFrequency == null) continue;
			if ($frequency == null || $newFrequency > $frequency) $frequency = $newFrequency;
		}

		sql('INSERT INTO "Word" VALUES(DEFAULT, :writing, :frequency);', compact('writing', 'frequency'));
		$wordId = lastId();
		$wordIds[$writing] = $wordId;

		foreach ($k->getElementsByTagName('ke_inf') as $x) {
			$tagId = getTag($x);
			sql('INSERT INTO "WordTag" VALUES(:wordId, :tagId);', compact('wordId', 'tagId'));
		}
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
			$tag = getTagAlias($x);
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
			$dialect[] = preg_replace('/-ben$/', '', getTagValue($x));
		}
		$dialectArray = empty($dialect) ? '{}' : "{'".implode("','", $dialect)."'}";

		sql('INSERT INTO "Sense" VALUES(DEFAULT, :info, '.$dialectArray.');', compact('info'));
		$senseId = lastId();

		foreach ($sense->getElementsByTagName('stagk') as $x) {
			$wordId = $wordIds[$x->nodeValue];
			sql('INSERT INTO "SenseWord" VALUES(:senseId, :wordId);', compact('senseId', 'wordId'));
		}
		foreach ($sense->getElementsByTagName('stagr') as $x) {
			$readingId = $readingIds[$x->nodeValue];
			sql('INSERT INTO "SenseReading" VALUES(:senseId, :readingId);', compact('senseId', 'readingId'));
		}

		foreach ($sense->getElementsByTagName('pos') as $x) {
			$tagId = getTag($x);
			sql('INSERT INTO "SenseTagPartOfSpeech" VALUES(:senseId, :tagId);', compact('senseId', 'tagId'));
		}
		foreach ($sense->getElementsByTagName('field') as $x) {
			$tagId = getTag($x);
			sql('INSERT INTO "SenseTagContext" VALUES(:senseId, :tagId);', compact('senseId', 'tagId'));
		}
		foreach ($sense->getElementsByTagName('misc') as $x) {
			$tagId = getTag($x);
			sql('INSERT INTO "SenseTag" VALUES(:senseId, :tagId);', compact('senseId', 'tagId'));
		}

		foreach ($sense->getElementsByTagName('xref') as $x) {
			$value = $x->nodeValue;
			sql('INSERT INTO "SenseSynonym" VALUES(DEFAULT, :senseId, :value);', compact('senseId', 'value'));
		}
		foreach ($sense->getElementsByTagName('ant') as $x) {
			$value = $x->nodeValue;
			sql('INSERT INTO "SenseAnthonym" VALUES(DEFAULT, :senseId, :value);', compact('senseId', 'value'));
		}
		foreach ($sense->getElementsByTagName('lsource') as $x) {
			$value = $x->nodeValue;
			if (empty($value)) continue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$describesFully = empty($x->getAttribute('ls_type')) || $x->getAttribute('ls_type') == 'full' ? 1 : 0;
			$madeFromForeignWords = $x->getAttribute('ls_wasei') == 'y' ? 1 : 0;
			sql(
				'INSERT INTO "SenseOrigin" VALUES(DEFAULT, :senseId, :value, :lang, :describesFully, :madeFromForeignWords);',
				compact('senseId', 'value', 'lang', 'describesFully', 'madeFromForeignWords')
			);
		}
		foreach ($sense->getElementsByTagName('gloss') as $x) {
			$value = $x->nodeValue;
			$lang = empty($x->getAttribute('xml:lang')) ? 'eng' : $x->getAttribute('xml:lang') ;
			$type = empty($x->getAttribute('g_type')) ? null : $translationTypes[$x->getAttribute('g_type')];
			sql(
				'INSERT INTO "SenseTranslation" VALUES(DEFAULT, :senseId, :value, :lang, :type);',
				compact('senseId', 'value', 'lang', 'type')
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
