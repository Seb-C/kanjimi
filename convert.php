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

sql("CREATE TABLE tags (id INTEGER PRIMARY KEY, tag TEXT, description TEXT);");

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
    sql('INSERT INTO tags VALUES (null, :tag, :description)', compact('tag', 'description'));
    $tags[$tag] = lastId();
};

// TODO tag "quote" missing?
addTag('MA', "martial arts term");
addTag('X', "rude or X-rated term (not displayed in educational software)");
addTag('abbr', "abbreviation");
addTag('adj-i', "adjective (keiyoushi)");
addTag('adj-ix', "adjective (keiyoushi) - yoi/ii class");
addTag('adj-na', "adjectival nouns or quasi-adjectives (keiyodoshi)");
addTag('adj-no', "nouns which may take the genitive case particle `no'");
addTag('adj-pn', "pre-noun adjectival (rentaishi)");
addTag('adj-t', "`taru' adjective");
addTag('adj-f', "noun or verb acting prenominally");
addTag('adv', "adverb (fukushi)");
addTag('adv-to', "adverb taking the `to' particle");
addTag('arch', "archaism");
addTag('ateji', "ateji (phonetic) reading");
addTag('aux', "auxiliary");
addTag('aux-v', "auxiliary verb");
addTag('aux-adj', "auxiliary adjective");
addTag('Buddh', "Buddhist term");
addTag('chem', "chemistry term");
addTag('chn', "children's language");
addTag('col', "colloquialism");
addTag('comp', "computer terminology");
addTag('conj', "conjunction");
addTag('cop-da', "copula");
addTag('ctr', "counter");
addTag('derog', "derogatory");
addTag('eK', "exclusively kanji");
addTag('ek', "exclusively kana");
addTag('exp', "expressions (phrases, clauses, etc.)");
addTag('fam', "familiar language");
addTag('fem', "female term or language");
addTag('food', "food term");
addTag('geom', "geometry term");
addTag('gikun', "gikun (meaning as reading) or jukujikun (special kanji reading)");
addTag('hon', "honorific or respectful (sonkeigo) language");
addTag('hum', "humble (kenjougo) language");
addTag('iK', "word containing irregular kanji usage");
addTag('id', "idiomatic expression");
addTag('ik', "word containing irregular kana usage");
addTag('int', "interjection (kandoushi)");
addTag('io', "irregular okurigana usage");
addTag('iv', "irregular verb");
addTag('ling', "linguistics terminology");
addTag('m-sl', "manga slang");
addTag('male', "male term or language");
addTag('male-sl', "male slang");
addTag('math', "mathematics");
addTag('mil', "military");
addTag('n', "noun (common) (futsuumeishi)");
addTag('n-adv', "adverbial noun (fukushitekimeishi)");
addTag('n-suf', "noun, used as a suffix");
addTag('n-pref', "noun, used as a prefix");
addTag('n-t', "noun (temporal) (jisoumeishi)");
addTag('num', "numeric");
addTag('oK', "word containing out-dated kanji");
addTag('obs', "obsolete term");
addTag('obsc', "obscure term");
addTag('ok', "out-dated or obsolete kana usage");
addTag('oik', "old or irregular kana form");
addTag('on-mim', "onomatopoeic or mimetic word");
addTag('pn', "pronoun");
addTag('poet', "poetical term");
addTag('pol', "polite (teineigo) language");
addTag('pref', "prefix");
addTag('proverb', "proverb");
addTag('prt', "particle");
addTag('physics', "physics terminology");
addTag('rare', "rare");
addTag('sens', "sensitive");
addTag('sl', "slang");
addTag('suf', "suffix");
addTag('uK', "word usually written using kanji alone");
addTag('uk', "word usually written using kana alone");
addTag('unc', "unclassified");
addTag('yoji', "yojijukugo");
addTag('v1', "Ichidan verb");
addTag('v1-s', "Ichidan verb - kureru special class");
addTag('v2a-s', "Nidan verb with 'u' ending (archaic)");
addTag('v4h', "Yodan verb with `hu/fu' ending (archaic)");
addTag('v4r', "Yodan verb with `ru' ending (archaic)");
addTag('v5aru', "Godan verb - -aru special class");
addTag('v5b', "Godan verb with `bu' ending");
addTag('v5g', "Godan verb with `gu' ending");
addTag('v5k', "Godan verb with `ku' ending");
addTag('v5k-s', "Godan verb - Iku/Yuku special class");
addTag('v5m', "Godan verb with `mu' ending");
addTag('v5n', "Godan verb with `nu' ending");
addTag('v5r', "Godan verb with `ru' ending");
addTag('v5r-i', "Godan verb with `ru' ending (irregular verb)");
addTag('v5s', "Godan verb with `su' ending");
addTag('v5t', "Godan verb with `tsu' ending");
addTag('v5u', "Godan verb with `u' ending");
addTag('v5u-s', "Godan verb with `u' ending (special class)");
addTag('v5uru', "Godan verb - Uru old class verb (old form of Eru)");
addTag('vz', "Ichidan verb - zuru verb (alternative form of -jiru verbs)");
addTag('vi', "intransitive verb");
addTag('vk', "Kuru verb - special class");
addTag('vn', "irregular nu verb");
addTag('vr', "irregular ru verb, plain form ends with -ri");
addTag('vs', "noun or participle which takes the aux. verb suru");
addTag('vs-c', "su verb - precursor to the modern suru");
addTag('vs-s', "suru verb - special class");
addTag('vs-i', "suru verb - irregular");
addTag('kyb', "Kyoto-ben");
addTag('osb', "Osaka-ben");
addTag('ksb', "Kansai-ben");
addTag('ktb', "Kantou-ben");
addTag('tsb', "Tosa-ben");
addTag('thb', "Touhoku-ben");
addTag('tsug', "Tsugaru-ben");
addTag('kyu', "Kyuushuu-ben");
addTag('rkb', "Ryuukyuu-ben");
addTag('nab', "Nagano-ben");
addTag('hob', "Hokkaido-ben");
addTag('vt', "transitive verb");
addTag('vulg', "vulgar expression or word");
addTag('adj-kari', "`kari' adjective (archaic)");
addTag('adj-ku', "`ku' adjective (archaic)");
addTag('adj-shiku', "`shiku' adjective (archaic)");
addTag('adj-nari', "archaic/formal form of na-adjective");
addTag('n-pr', "proper noun");
addTag('v-unspec', "verb unspecified");
addTag('v4k', "Yodan verb with `ku' ending (archaic)");
addTag('v4g', "Yodan verb with `gu' ending (archaic)");
addTag('v4s', "Yodan verb with `su' ending (archaic)");
addTag('v4t', "Yodan verb with `tsu' ending (archaic)");
addTag('v4n', "Yodan verb with `nu' ending (archaic)");
addTag('v4b', "Yodan verb with `bu' ending (archaic)");
addTag('v4m', "Yodan verb with `mu' ending (archaic)");
addTag('v2k-k', "Nidan verb (upper class) with `ku' ending (archaic)");
addTag('v2g-k', "Nidan verb (upper class) with `gu' ending (archaic)");
addTag('v2t-k', "Nidan verb (upper class) with `tsu' ending (archaic)");
addTag('v2d-k', "Nidan verb (upper class) with `dzu' ending (archaic)");
addTag('v2h-k', "Nidan verb (upper class) with `hu/fu' ending (archaic)");
addTag('v2b-k', "Nidan verb (upper class) with `bu' ending (archaic)");
addTag('v2m-k', "Nidan verb (upper class) with `mu' ending (archaic)");
addTag('v2y-k', "Nidan verb (upper class) with `yu' ending (archaic)");
addTag('v2r-k', "Nidan verb (upper class) with `ru' ending (archaic)");
addTag('v2k-s', "Nidan verb (lower class) with `ku' ending (archaic)");
addTag('v2g-s', "Nidan verb (lower class) with `gu' ending (archaic)");
addTag('v2s-s', "Nidan verb (lower class) with `su' ending (archaic)");
addTag('v2z-s', "Nidan verb (lower class) with `zu' ending (archaic)");
addTag('v2t-s', "Nidan verb (lower class) with `tsu' ending (archaic)");
addTag('v2d-s', "Nidan verb (lower class) with `dzu' ending (archaic)");
addTag('v2n-s', "Nidan verb (lower class) with `nu' ending (archaic)");
addTag('v2h-s', "Nidan verb (lower class) with `hu/fu' ending (archaic)");
addTag('v2b-s', "Nidan verb (lower class) with `bu' ending (archaic)");
addTag('v2m-s', "Nidan verb (lower class) with `mu' ending (archaic)");
addTag('v2y-s', "Nidan verb (lower class) with `yu' ending (archaic)");
addTag('v2r-s', "Nidan verb (lower class) with `ru' ending (archaic)");
addTag('v2w-s', "Nidan verb (lower class) with `u' ending and `we' conjugation (archaic)");
addTag('archit', "architecture term");
addTag('astron', "astronomy, etc. term");
addTag('baseb', "baseball term");
addTag('biol', "biology term");
addTag('bot', "botany term");
addTag('bus', "business term");
addTag('econ', "economics term");
addTag('engr', "engineering term");
addTag('finc', "finance term");
addTag('geol', "geology, etc. term");
addTag('law', "law, etc. term");
addTag('mahj', "mahjong term");
addTag('med', "medicine, etc. term");
addTag('music', "music term");
addTag('Shinto', "Shinto term");
addTag('shogi', "shogi term");
addTag('sports', "sports term");
addTag('sumo', "sumo term");
addTag('zool', "zoology term");
addTag('joc', "jocular, humorous term");
addTag('anat', "anatomical term");

// TODO db camel case
// TODO set the proper types for columns
// TODO add relationships between tables and check integrity
// TODO add primary keys (doubles)
// TODO clean some useless or non well-formatted data
// TODO convert some strings in enums
// TODO detect tags automatically from the DTD?

sql("CREATE TABLE ref (ref INTEGER PRIMARY KEY);");

sql("CREATE TABLE word (id INTEGER PRIMARY KEY, ref INTEGER, writing TEXT);");
sql("CREATE TABLE word_tag (word_id INTEGER, tag_id INTEGER);");
sql("CREATE TABLE word_frequency (id INTEGER PRIMARY KEY, word_id INTEGER, frequency TEXT);");

sql("CREATE TABLE reading (id INTEGER PRIMARY KEY, reading TEXT, trueReading INTEGER);");
sql("CREATE TABLE reading_word (reading_id INTEGER, word_id INTEGER);");
sql("CREATE TABLE reading_tag (reading_id INTEGER, tag_id INTEGER);");
sql("CREATE TABLE reading_frequency (id INTEGER PRIMARY KEY, reading_id INTEGER, frequency TEXT);");

sql("CREATE TABLE sense (id INTEGER PRIMARY KEY, info TEXT);");
sql("CREATE TABLE sense_word (sense_id INTEGER, word_id INTEGER);");
sql("CREATE TABLE sense_reading (sense_id INTEGER, reading_id INTEGER);");
sql("CREATE TABLE sense_translation (id INTEGER PRIMARY KEY, sense_id INTEGER, value TEXT, lang TEXT, gender TEXT, type TEXT);");
sql("CREATE TABLE sense_origin (id INTEGER PRIMARY KEY, sense_id INTEGER, value TEXT, lang TEXT, describes_fully TEXT, made_from_foreign_words TEXT);");

// TODO this data is not suited to a database
sql("CREATE TABLE sense_synonym (id INTEGER PRIMARY KEY, sense_id INTEGER, value TEXT);");
sql("CREATE TABLE sense_anthonym (id INTEGER PRIMARY KEY, sense_id INTEGER, value TEXT);");

sql("CREATE TABLE sense_tag (sense_id INTEGER, tag_id INTEGER);");
sql("CREATE TABLE sense_tag_context (sense_id INTEGER, tag_id INTEGER);");
sql("CREATE TABLE sense_tag_dialect (sense_id INTEGER, tag_id INTEGER);");
sql("CREATE TABLE sense_tag_part_of_speech (sense_id INTEGER, tag_id INTEGER);");

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

while($xml->name === 'entry') {
    $entry = $xml->expand();

    $id = $entry->getElementsByTagName('ent_seq')[0]->nodeValue;
    sql("INSERT INTO ref VALUES(:id);", compact('id'));

    $wordIds = [];
    foreach ($entry->getElementsByTagName('k_ele') as $k) {
        $writing = $k->getElementsByTagName('keb')[0]->nodeValue;
        sql("INSERT INTO word VALUES(NULL, :id, :writing);", compact('id', 'writing'));
        $word_id = lastId();
        $wordIds[$writing] = $word_id;

        foreach ($k->getElementsByTagName('ke_inf') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO word_tag VALUES(:word_id, :tag_id);", compact('word_id', 'tag_id'));
        }

        foreach ($k->getElementsByTagName('ke_pri') as $x) {
            $frequency = $x->nodeValue;
            sql("INSERT INTO word_frequency VALUES(NULL, :word_id, :frequency);", compact('word_id', 'frequency'));
        }
    }

    $readingIds = [];
    foreach ($entry->getElementsByTagName('r_ele') as $r) {
        $reading = $r->getElementsByTagName('reb')[0]->nodeValue;
        $trueReading = count($r->getElementsByTagName('re_nokanji')) == 0;
        sql("INSERT INTO reading VALUES(NULL, :reading, :trueReading);", compact('reading', 'trueReading'));
        $reading_id = lastId();
        $readingIds[$reading] = $reading_id;

        foreach ($r->getElementsByTagName('re_restr') as $x) {
            $word_id = $wordIds[$x->nodeValue];
            sql("INSERT INTO reading_word VALUES(:reading_id, :word_id);", compact('reading_id', 'word_id'));
        }

        foreach ($r->getElementsByTagName('re_inf') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO reading_tag VALUES(:reading_id, :tag_id);", compact('reading_id', 'tag_id'));
        }

        foreach ($r->getElementsByTagName('re_pri') as $x) {
            $frequency = $x->nodeValue;
            sql("INSERT INTO reading_frequency VALUES(NULL, :reading_id, :frequency);", compact('reading_id', 'frequency'));
        }
    }

    foreach ($entry->getElementsByTagName('sense') as $sense) {
        $info = null;
        $sInf = $sense->getElementsByTagName('s_inf');
        if (count($sInf) > 0) $info = $sInf[0]->nodeValue;
        sql("INSERT INTO sense VALUES(NULL, :info);", compact('info'));
        $sense_id = lastId();

        foreach ($sense->getElementsByTagName('stagk') as $x) {
            $word_id = $x->nodeValue;
            sql("INSERT INTO sense_word VALUES(:sense_id, :word_id);", compact('sense_id', 'word_id'));
        }
        foreach ($sense->getElementsByTagName('stagr') as $x) {
            $reading_id = $x->nodeValue;
            sql("INSERT INTO sense_reading VALUES(:sense_id, :reading_id);", compact('sense_id', 'reading_id'));
        }

        foreach ($sense->getElementsByTagName('pos') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO sense_tag_part_of_speech VALUES(:sense_id, :tag_id);", compact('sense_id', 'tag_id'));
        }
        foreach ($sense->getElementsByTagName('field') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO sense_tag_context VALUES(:sense_id, :tag_id);", compact('sense_id', 'tag_id'));
        }
        foreach ($sense->getElementsByTagName('misc') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO sense_tag VALUES(:sense_id, :tag_id);", compact('sense_id', 'tag_id'));
        }
        foreach ($sense->getElementsByTagName('dial') as $x) {
            $tag_id = getTag($x);
            sql("INSERT INTO sense_tag_dialect VALUES(:sense_id, :tag_id);", compact('sense_id', 'tag_id'));
        }

        foreach ($sense->getElementsByTagName('xref') as $x) {
            $value = $x->nodeValue;
            sql("INSERT INTO sense_synonym VALUES(NULL, :sense_id, :value);", compact('sense_id', 'value'));
        }
        foreach ($sense->getElementsByTagName('ant') as $x) {
            $value = $x->nodeValue;
            sql("INSERT INTO sense_anthonym VALUES(NULL, :sense_id, :value);", compact('sense_id', 'value'));
        }
        foreach ($sense->getElementsByTagName('lsource') as $x) {
            $value = $x->nodeValue;
            $lang = $x->getAttribute('xml:lang') ?? 'eng';
            $describes_fully = $x->getAttribute('ls_type') ?? 'full';
            $made_from_foreign_words = $x->getAttribute('ls_wasei');
            sql(
                "INSERT INTO sense_origin VALUES(NULL, :sense_id, :value, :lang, :describes_fully, :made_from_foreign_words);",
                compact('sense_id', 'value', 'lang', 'describes_fully', 'made_from_foreign_words')
            );
        }
        foreach ($sense->getElementsByTagName('gloss') as $x) {
            $value = $x->nodeValue;
            $lang = $x->getAttribute('xml:lang') ?? 'eng';
            $gender = $x->getAttribute('g_gend');
            $type = $x->getAttribute('g_type');
            sql(
                "INSERT INTO sense_translation VALUES(NULL, :sense_id, :value, :lang, :gender, :type);",
                compact('sense_id', 'value', 'lang', 'gender', 'type')
            );
        }
    }

    $xml->next('entry');
}
