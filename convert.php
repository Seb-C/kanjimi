<?php

$xml = new XMLReader();
$xml->open('./xml/Dictionary.xml');

$tags = [];
function getTag($node) {
    $child = $node->childNodes[0];
    if ($child instanceof DOMEntityReference) {
        return $child->nodeName;
    } else {
        return $node->nodeValue;
    }
}
$addTag = function ($tag, $description) use ($tags) {
    $tags[$tag] = $description; // TODO put in database + save id here
};

$addTag('MA', "martial arts term");
$addTag('X', "rude or X-rated term (not displayed in educational software)");
$addTag('abbr', "abbreviation");
$addTag('adj-i', "adjective (keiyoushi)");
$addTag('adj-ix', "adjective (keiyoushi) - yoi/ii class");
$addTag('adj-na', "adjectival nouns or quasi-adjectives (keiyodoshi)");
$addTag('adj-no', "nouns which may take the genitive case particle `no'");
$addTag('adj-pn', "pre-noun adjectival (rentaishi)");
$addTag('adj-t', "`taru' adjective");
$addTag('adj-f', "noun or verb acting prenominally");
$addTag('adv', "adverb (fukushi)");
$addTag('adv-to', "adverb taking the `to' particle");
$addTag('arch', "archaism");
$addTag('ateji', "ateji (phonetic) reading");
$addTag('aux', "auxiliary");
$addTag('aux-v', "auxiliary verb");
$addTag('aux-adj', "auxiliary adjective");
$addTag('Buddh', "Buddhist term");
$addTag('chem', "chemistry term");
$addTag('chn', "children's language");
$addTag('col', "colloquialism");
$addTag('comp', "computer terminology");
$addTag('conj', "conjunction");
$addTag('cop-da', "copula");
$addTag('ctr', "counter");
$addTag('derog', "derogatory");
$addTag('eK', "exclusively kanji");
$addTag('ek', "exclusively kana");
$addTag('exp', "expressions (phrases, clauses, etc.)");
$addTag('fam', "familiar language");
$addTag('fem', "female term or language");
$addTag('food', "food term");
$addTag('geom', "geometry term");
$addTag('gikun', "gikun (meaning as reading) or jukujikun (special kanji reading)");
$addTag('hon', "honorific or respectful (sonkeigo) language");
$addTag('hum', "humble (kenjougo) language");
$addTag('iK', "word containing irregular kanji usage");
$addTag('id', "idiomatic expression");
$addTag('ik', "word containing irregular kana usage");
$addTag('int', "interjection (kandoushi)");
$addTag('io', "irregular okurigana usage");
$addTag('iv', "irregular verb");
$addTag('ling', "linguistics terminology");
$addTag('m-sl', "manga slang");
$addTag('male', "male term or language");
$addTag('male-sl', "male slang");
$addTag('math', "mathematics");
$addTag('mil', "military");
$addTag('n', "noun (common) (futsuumeishi)");
$addTag('n-adv', "adverbial noun (fukushitekimeishi)");
$addTag('n-suf', "noun, used as a suffix");
$addTag('n-pref', "noun, used as a prefix");
$addTag('n-t', "noun (temporal) (jisoumeishi)");
$addTag('num', "numeric");
$addTag('oK', "word containing out-dated kanji");
$addTag('obs', "obsolete term");
$addTag('obsc', "obscure term");
$addTag('ok', "out-dated or obsolete kana usage");
$addTag('oik', "old or irregular kana form");
$addTag('on-mim', "onomatopoeic or mimetic word");
$addTag('pn', "pronoun");
$addTag('poet', "poetical term");
$addTag('pol', "polite (teineigo) language");
$addTag('pref', "prefix");
$addTag('proverb', "proverb");
$addTag('prt', "particle");
$addTag('physics', "physics terminology");
$addTag('rare', "rare");
$addTag('sens', "sensitive");
$addTag('sl', "slang");
$addTag('suf', "suffix");
$addTag('uK', "word usually written using kanji alone");
$addTag('uk', "word usually written using kana alone");
$addTag('unc', "unclassified");
$addTag('yoji', "yojijukugo");
$addTag('v1', "Ichidan verb");
$addTag('v1-s', "Ichidan verb - kureru special class");
$addTag('v2a-s', "Nidan verb with 'u' ending (archaic)");
$addTag('v4h', "Yodan verb with `hu/fu' ending (archaic)");
$addTag('v4r', "Yodan verb with `ru' ending (archaic)");
$addTag('v5aru', "Godan verb - -aru special class");
$addTag('v5b', "Godan verb with `bu' ending");
$addTag('v5g', "Godan verb with `gu' ending");
$addTag('v5k', "Godan verb with `ku' ending");
$addTag('v5k-s', "Godan verb - Iku/Yuku special class");
$addTag('v5m', "Godan verb with `mu' ending");
$addTag('v5n', "Godan verb with `nu' ending");
$addTag('v5r', "Godan verb with `ru' ending");
$addTag('v5r-i', "Godan verb with `ru' ending (irregular verb)");
$addTag('v5s', "Godan verb with `su' ending");
$addTag('v5t', "Godan verb with `tsu' ending");
$addTag('v5u', "Godan verb with `u' ending");
$addTag('v5u-s', "Godan verb with `u' ending (special class)");
$addTag('v5uru', "Godan verb - Uru old class verb (old form of Eru)");
$addTag('vz', "Ichidan verb - zuru verb (alternative form of -jiru verbs)");
$addTag('vi', "intransitive verb");
$addTag('vk', "Kuru verb - special class");
$addTag('vn', "irregular nu verb");
$addTag('vr', "irregular ru verb, plain form ends with -ri");
$addTag('vs', "noun or participle which takes the aux. verb suru");
$addTag('vs-c', "su verb - precursor to the modern suru");
$addTag('vs-s', "suru verb - special class");
$addTag('vs-i', "suru verb - irregular");
$addTag('kyb', "Kyoto-ben");
$addTag('osb', "Osaka-ben");
$addTag('ksb', "Kansai-ben");
$addTag('ktb', "Kantou-ben");
$addTag('tsb', "Tosa-ben");
$addTag('thb', "Touhoku-ben");
$addTag('tsug', "Tsugaru-ben");
$addTag('kyu', "Kyuushuu-ben");
$addTag('rkb', "Ryuukyuu-ben");
$addTag('nab', "Nagano-ben");
$addTag('hob', "Hokkaido-ben");
$addTag('vt', "transitive verb");
$addTag('vulg', "vulgar expression or word");
$addTag('adj-kari', "`kari' adjective (archaic)");
$addTag('adj-ku', "`ku' adjective (archaic)");
$addTag('adj-shiku', "`shiku' adjective (archaic)");
$addTag('adj-nari', "archaic/formal form of na-adjective");
$addTag('n-pr', "proper noun");
$addTag('v-unspec', "verb unspecified");
$addTag('v4k', "Yodan verb with `ku' ending (archaic)");
$addTag('v4g', "Yodan verb with `gu' ending (archaic)");
$addTag('v4s', "Yodan verb with `su' ending (archaic)");
$addTag('v4t', "Yodan verb with `tsu' ending (archaic)");
$addTag('v4n', "Yodan verb with `nu' ending (archaic)");
$addTag('v4b', "Yodan verb with `bu' ending (archaic)");
$addTag('v4m', "Yodan verb with `mu' ending (archaic)");
$addTag('v2k-k', "Nidan verb (upper class) with `ku' ending (archaic)");
$addTag('v2g-k', "Nidan verb (upper class) with `gu' ending (archaic)");
$addTag('v2t-k', "Nidan verb (upper class) with `tsu' ending (archaic)");
$addTag('v2d-k', "Nidan verb (upper class) with `dzu' ending (archaic)");
$addTag('v2h-k', "Nidan verb (upper class) with `hu/fu' ending (archaic)");
$addTag('v2b-k', "Nidan verb (upper class) with `bu' ending (archaic)");
$addTag('v2m-k', "Nidan verb (upper class) with `mu' ending (archaic)");
$addTag('v2y-k', "Nidan verb (upper class) with `yu' ending (archaic)");
$addTag('v2r-k', "Nidan verb (upper class) with `ru' ending (archaic)");
$addTag('v2k-s', "Nidan verb (lower class) with `ku' ending (archaic)");
$addTag('v2g-s', "Nidan verb (lower class) with `gu' ending (archaic)");
$addTag('v2s-s', "Nidan verb (lower class) with `su' ending (archaic)");
$addTag('v2z-s', "Nidan verb (lower class) with `zu' ending (archaic)");
$addTag('v2t-s', "Nidan verb (lower class) with `tsu' ending (archaic)");
$addTag('v2d-s', "Nidan verb (lower class) with `dzu' ending (archaic)");
$addTag('v2n-s', "Nidan verb (lower class) with `nu' ending (archaic)");
$addTag('v2h-s', "Nidan verb (lower class) with `hu/fu' ending (archaic)");
$addTag('v2b-s', "Nidan verb (lower class) with `bu' ending (archaic)");
$addTag('v2m-s', "Nidan verb (lower class) with `mu' ending (archaic)");
$addTag('v2y-s', "Nidan verb (lower class) with `yu' ending (archaic)");
$addTag('v2r-s', "Nidan verb (lower class) with `ru' ending (archaic)");
$addTag('v2w-s', "Nidan verb (lower class) with `u' ending and `we' conjugation (archaic)");
$addTag('archit', "architecture term");
$addTag('astron', "astronomy, etc. term");
$addTag('baseb', "baseball term");
$addTag('biol', "biology term");
$addTag('bot', "botany term");
$addTag('bus', "business term");
$addTag('econ', "economics term");
$addTag('engr', "engineering term");
$addTag('finc', "finance term");
$addTag('geol', "geology, etc. term");
$addTag('law', "law, etc. term");
$addTag('mahj', "mahjong term");
$addTag('med', "medicine, etc. term");
$addTag('music', "music term");
$addTag('Shinto', "Shinto term");
$addTag('shogi', "shogi term");
$addTag('sports', "sports term");
$addTag('sumo', "sumo term");
$addTag('zool', "zoology term");
$addTag('joc', "jocular, humorous term");
$addTag('anat', "anatomical term");

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

while($xml->name === 'entry') {
    $entry = $xml->expand();

    $data = [
        'id' => null,
        'kanjis' => [],
        'readings' => [],
        'sense' => [],
    ];

    $entSeq = $entry->getElementsByTagName('ent_seq')[0];
    if (!empty($entSeq)) {
        $data['id'] = $entSeq->nodeValue;
    }

    foreach ($entry->getElementsByTagName('k_ele') as $k) {
        $kData = [
            'writing' => $k->getElementsByTagName('keb')[0]->nodeValue,
            'tags' => [],
            'frequency' => [],
        ];

        foreach ($k->getElementsByTagName('ke_inf') as $x) {
            $kData['tags'][] = getTag($x);
        }

        foreach ($k->getElementsByTagName('ke_pri') as $x) {
            $kData['frequency'][] = $x->nodeValue;
        }

        $data['kanjis'][] = $kData;
    }

    foreach ($entry->getElementsByTagName('r_ele') as $r) {
        $rData = [
            'reading' => $r->getElementsByTagName('reb')[0]->nodeValue,
            'not_true_reading' => null,
            'applies_to_subset' => [],
            'tags' => [],
            'frequency' => [],
        ];

        $nok = $r->getElementsByTagName('re_nokanji');
        if (count($nok) > 0) {
            $rData['not_true_reading'] = $nok[0]->nodeValue;
        }

        foreach ($r->getElementsByTagName('re_restr') as $x) {
            $rData['applies_to_subset'][] = $x->nodeValue;
        }

        foreach ($r->getElementsByTagName('re_inf') as $x) {
            $rData['tags'][] = getTag($x);
        }

        foreach ($r->getElementsByTagName('re_pri') as $x) {
            $rData['frequency'][] = $x->nodeValue;
        }

        $data['readings'][] = $rData;
    }

    foreach ($entry->getElementsByTagName('sense') as $sense) {
        $senseData = [
            'applies_to_kanji' => [],
            'applies_to_reading' => [],
            'part_of_speech_tags' => [],
            'synonym' => [],
            'anthonym' => [],
            'context_tags' => [],
            'tags' => [],
            'info' => null,
            'foreign_origin' => [],
            'dialect_tags' => [],
            'translations' => [],
        ];

        foreach ($sense->getElementsByTagName('stagk') as $x) {
            $senseData['applies_to_kanji'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('stagr') as $x) {
            $senseData['applies_to_reading'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('pos') as $x) {
            $senseData['part_of_speech_tags'][] = getTag($x);
        }
        foreach ($sense->getElementsByTagName('xref') as $x) {
            $senseData['synonym'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('ant') as $x) {
            $senseData['anthonym'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('field') as $x) {
            $senseData['context_tags'][] = getTag($x);
        }
        foreach ($sense->getElementsByTagName('misc') as $x) {
            $senseData['tags'][] = getTag($x);
        }
        $sInf = $sense->getElementsByTagName('s_inf');
        if (count($sInf) > 0) {
            $senseData['info'] = $sInf[0]->nodeValue;
        }
        foreach ($sense->getElementsByTagName('lsource') as $x) {
            $senseData['foreign_origin'][] = [
                'value' => $x->nodeValue,
                'lang' => $x->getAttribute('xml:lang') ?? 'eng',
                'describes_fully' => $x->getAttribute('ls_type') ?? 'full',
                'made_from_foreign_words' => $x->getAttribute('ls_wasei'),
            ];
        }
        foreach ($sense->getElementsByTagName('dial') as $x) {
            $senseData['dialect_tags'][] = getTag($x);
        }
        foreach ($sense->getElementsByTagName('gloss') as $x) {
            $senseData['translations'][] = [
                'value' => $x->nodeValue,
                'lang' => $x->getAttribute('xml:lang') ?? 'eng',
                'gender' => $x->getAttribute('g_gend'),
                'type' => $x->getAttribute('g_type'),
            ];
        }

        $data['sense'][] = $senseData;
    }

    echo json_encode($data, JSON_PRETTY_PRINT);

    $xml->next('entry');
}
