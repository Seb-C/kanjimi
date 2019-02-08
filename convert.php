<?php

@unlink('./out/Dictionary.db');
$db = new PDO('sqlite:./out/Dictionary.db');

$xml = new XMLReader();
$xml->open('./xml/Dictionary.xml');

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
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

sql("CREATE TABLE Tag (id INTEGER PRIMARY KEY, tag TEXT, description TEXT);");
sql("CREATE TABLE Ref (ref INTEGER PRIMARY KEY);");

sql("CREATE TABLE Word (id INTEGER PRIMARY KEY, ref INTEGER, writing TEXT);");
sql("CREATE TABLE WordTag (wordId INTEGER, tagId INTEGER, PRIMARY KEY (wordId, tagId));");
sql("CREATE TABLE WordFrequency (id INTEGER PRIMARY KEY, wordId INTEGER, frequency TEXT);");

sql("CREATE TABLE Reading (id INTEGER PRIMARY KEY, reading TEXT, trueReading INTEGER);");
sql("CREATE TABLE ReadingWord (readingId INTEGER, wordId INTEGER, PRIMARY KEY (readingId, wordId));");
sql("CREATE TABLE ReadingTag (readingId INTEGER, tagId INTEGER, PRIMARY KEY (readingId, tagId));");
sql("CREATE TABLE ReadingFrequency (id INTEGER PRIMARY KEY, readingId INTEGER, frequency TEXT);");

sql("CREATE TABLE Sense (id INTEGER PRIMARY KEY, info TEXT);");
sql("CREATE TABLE SenseWord (senseId INTEGER, wordId INTEGER, PRIMARY KEY (senseId, wordId));");
sql("CREATE TABLE SenseReading (senseId INTEGER, readingId INTEGER, PRIMARY KEY (senseId, readingId));");
sql("CREATE TABLE SenseTranslation (id INTEGER PRIMARY KEY, senseId INTEGER, value TEXT, lang TEXT, gender TEXT, type TEXT);");
sql("CREATE TABLE SenseOrigin (id INTEGER PRIMARY KEY, senseId INTEGER, value TEXT, lang TEXT, describesFully TEXT, madeFromForeignWords TEXT);");

// TODO this data is not suited to a database
sql("CREATE TABLE SenseSynonym (id INTEGER PRIMARY KEY, senseId INTEGER, value TEXT);");
sql("CREATE TABLE SenseAnthonym (id INTEGER PRIMARY KEY, senseId INTEGER, value TEXT);");

sql("CREATE TABLE SenseTag (senseId INTEGER, tagId INTEGER, PRIMARY KEY (senseId, tagId));");
sql("CREATE TABLE SenseTagContext (senseId INTEGER, tagId INTEGER, PRIMARY KEY (senseId, tagId));");
sql("CREATE TABLE SenseTagDialect (senseId INTEGER, tagId INTEGER, PRIMARY KEY (senseId, tagId));");
sql("CREATE TABLE SenseTagPartOfSpeech (senseId INTEGER, tagId INTEGER, PRIMARY KEY (senseId, tagId));");

$tags = [];
function getTag($node) {
    global $tags;
    $child = $node->childNodes[0];
    if ($child instanceof DOMEntityReference) {
        return $tags[$child->nodeName];
    } else {
        die('err');
    }
}
function addTag ($tag, $description) {
    global $tags;
    sql('INSERT INTO Tag VALUES (null, :tag, :description)', compact('tag', 'description'));
    $tags[$tag] = lastId();
};

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);
$doctype = $xml->readOuterXml();
preg_match_all('/<!ENTITY ([^ ]+) "([^"]+)">/', $doctype, $matches);

$db->beginTransaction();
foreach ($matches[1] as $i => $tag) {
    addTag($tag, $matches[2][$i]);
}
$db->commit();

// TODO set the proper types for columns
// TODO add relationships between tables and check integrity
// TODO clean some useless or non well-formatted data
// TODO convert some strings in enums

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

$count = 0;
$total = 181967;
$db->beginTransaction();
while($xml->name === 'entry') {
    $entry = $xml->expand();
    echo ($count++).' / '.$total.' = '.round($count / $total * 100)."\n";

    $id = $entry->getElementsByTagName('ent_seq')[0]->nodeValue;
    sql("INSERT INTO Ref VALUES(:id);", compact('id'));

    $wordIds = [];
    foreach ($entry->getElementsByTagName('k_ele') as $k) {
        $writing = $k->getElementsByTagName('keb')[0]->nodeValue;
        sql("INSERT INTO Word VALUES(NULL, :id, :writing);", compact('id', 'writing'));
        $wordId = lastId();
        $wordIds[$writing] = $wordId;

        foreach ($k->getElementsByTagName('ke_inf') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO WordTag VALUES(:wordId, :tagId);", compact('wordId', 'tagId'));
        }

        foreach ($k->getElementsByTagName('ke_pri') as $x) {
            $frequency = $x->nodeValue;
            sql("INSERT INTO WordFrequency VALUES(NULL, :wordId, :frequency);", compact('wordId', 'frequency'));
        }
    }

    $readingIds = [];
    foreach ($entry->getElementsByTagName('r_ele') as $r) {
        $reading = $r->getElementsByTagName('reb')[0]->nodeValue;
        $trueReading = count($r->getElementsByTagName('re_nokanji')) == 0;
        sql("INSERT INTO Reading VALUES(NULL, :reading, :trueReading);", compact('reading', 'trueReading'));
        $readingId = lastId();
        $readingIds[$reading] = $readingId;

        foreach ($r->getElementsByTagName('re_restr') as $x) {
            $wordId = $wordIds[$x->nodeValue];
            sql("INSERT INTO ReadingWord VALUES(:readingId, :wordId);", compact('readingId', 'wordId'));
        }

        foreach ($r->getElementsByTagName('re_inf') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO ReadingTag VALUES(:readingId, :tagId);", compact('readingId', 'tagId'));
        }

        foreach ($r->getElementsByTagName('re_pri') as $x) {
            $frequency = $x->nodeValue;
            sql("INSERT INTO ReadingFrequency VALUES(NULL, :readingId, :frequency);", compact('readingId', 'frequency'));
        }
    }

    foreach ($entry->getElementsByTagName('sense') as $sense) {
        $info = null;
        $sInf = $sense->getElementsByTagName('s_inf');
        if (count($sInf) > 0) $info = $sInf[0]->nodeValue;
        sql("INSERT INTO Sense VALUES(NULL, :info);", compact('info'));
        $senseId = lastId();

        foreach ($sense->getElementsByTagName('stagk') as $x) {
            $wordId = $x->nodeValue;
            sql("INSERT INTO SenseWord VALUES(:senseId, :wordId);", compact('senseId', 'wordId'));
        }
        foreach ($sense->getElementsByTagName('stagr') as $x) {
            $readingId = $x->nodeValue;
            sql("INSERT INTO SenseReading VALUES(:senseId, :readingId);", compact('senseId', 'readingId'));
        }

        foreach ($sense->getElementsByTagName('pos') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO SenseTagPartOfSpeech VALUES(:senseId, :tagId);", compact('senseId', 'tagId'));
        }
        foreach ($sense->getElementsByTagName('field') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO SenseTagContext VALUES(:senseId, :tagId);", compact('senseId', 'tagId'));
        }
        foreach ($sense->getElementsByTagName('misc') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO SenseTag VALUES(:senseId, :tagId);", compact('senseId', 'tagId'));
        }
        foreach ($sense->getElementsByTagName('dial') as $x) {
            $tagId = getTag($x);
            sql("INSERT INTO SenseTagDialect VALUES(:senseId, :tagId);", compact('senseId', 'tagId'));
        }

        foreach ($sense->getElementsByTagName('xref') as $x) {
            $value = $x->nodeValue;
            sql("INSERT INTO SenseSynonym VALUES(NULL, :senseId, :value);", compact('senseId', 'value'));
        }
        foreach ($sense->getElementsByTagName('ant') as $x) {
            $value = $x->nodeValue;
            sql("INSERT INTO SenseAnthonym VALUES(NULL, :senseId, :value);", compact('senseId', 'value'));
        }
        foreach ($sense->getElementsByTagName('lsource') as $x) {
            $value = $x->nodeValue;
            $lang = $x->getAttribute('xml:lang') ?? 'eng';
            $describesFully = $x->getAttribute('ls_type') ?? 'full';
            $madeFromForeignWords = $x->getAttribute('ls_wasei');
            sql(
                "INSERT INTO SenseOrigin VALUES(NULL, :senseId, :value, :lang, :describesFully, :madeFromForeignWords);",
                compact('senseId', 'value', 'lang', 'describesFully', 'madeFromForeignWords')
            );
        }
        foreach ($sense->getElementsByTagName('gloss') as $x) {
            $value = $x->nodeValue;
            $lang = $x->getAttribute('xml:lang') ?? 'eng';
            $gender = $x->getAttribute('g_gend');
            $type = $x->getAttribute('g_type');
            sql(
                "INSERT INTO SenseTranslation VALUES(NULL, :senseId, :value, :lang, :gender, :type);",
                compact('senseId', 'value', 'lang', 'gender', 'type')
            );
        }
    }

    if ($count % 500 == 0) {
        $db->commit();
        $db->beginTransaction();
    }

    $xml->next('entry');
}
$db->commit();
