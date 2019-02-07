<?php

$xml = new XMLReader();
$xml->open('./xml/Dictionary.xml');

// TODO test to remove
function outerHTML($e) {
     $doc = new DOMDocument();
     $doc->appendChild($doc->importNode($e, true));
     return $doc->saveHTML()."\nLineNo: ".$e->getLineNo();
}

// TODO re-check everything
// TODO remove unused properties
// TODO add comments to describe properties
// TODO better property naming
// TODO stats on the structure to take the best
// TODO translate to another language (SQL?)

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

    $entSeq = $entry->getElementsByTagName('ent_seq')->item(0);
    if (!empty($entSeq)) {
        $data['id'] = $entSeq->nodeValue;
    }

    foreach ($entry->getElementsByTagName('k_ele') as $k) {
        $kData = [
            'writing' => $k->getElementsByTagName('keb')[0]->nodeValue,
            'info' => [],
            'frequency' => [],
        ];

        foreach ($k->getElementsByTagName('ke_inf') as $x) {
            $kData['info'][] = $x->nodeValue;
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
            'info' => [],
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
            $rData['info'][] = $x->nodeValue;
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
            'part_of_speech' => [],
            'synonym' => [],
            'anthonym' => [],
            'context' => [],
            'info' => [],
            'info2' => [],
            'foreign_origin' => [],
            'dialect' => [],
            'translations' => [],
        ];

        foreach ($sense->getElementsByTagName('stagk') as $x) {
            $senseData['applies_to_kanji'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('stagr') as $x) {
            $senseData['applies_to_reading'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('pos') as $x) {

            // pos, misc, ke_inf, dial, re_inf, field
            // toujours seul dans la balise
            // Ces balises ne contiennent jamais rien d'autre
            // pas de tag non documente dans la liste
            // aucun attribut non documente

            // TODO try to properly get tags (xml entities) everywhere
            print_r($x->childNodes->item(0));
            var_dump([
                outerHTML($x),
                $x->nodeValue,
            ]); exit;
            $senseData['part_of_speech'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('xref') as $x) {
            $senseData['synonym'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('ant') as $x) {
            $senseData['anthonym'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('field') as $x) {
            $senseData['context'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('misc') as $x) {
            $senseData['info'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('s_inf') as $x) {
            $senseData['info2'][] = $x->nodeValue;
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
            $senseData['dialect'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('gloss') as $x) {
            $xData = [
                'value' => $x->nodeValue,
                'lang' => $x->getAttribute('xml:lang') ?? 'eng',
                'gender' => $x->getAttribute('g_gend'),
                'g_type' => $x->getAttribute('g_type'), // TODO
                'exact_matches' => [],
            ];

            foreach ($x->getElementsByTagName('pri') as $pri) {
                $senseData['exact_matches'][] = $pri->nodeValue;
            }

            $senseData['translations'][] = $xData;
        }

        $data['sense'][] = $senseData;
    }

    print_r($data);

    $xml->next('entry');
}

// <!ENTITY MA "martial arts term">
// <!ENTITY X "rude or X-rated term (not displayed in educational software)">
// <!ENTITY abbr "abbreviation">
// <!ENTITY adj-i "adjective (keiyoushi)">
// <!ENTITY adj-ix "adjective (keiyoushi) - yoi/ii class">
// <!ENTITY adj-na "adjectival nouns or quasi-adjectives (keiyodoshi)">
// <!ENTITY adj-no "nouns which may take the genitive case particle `no'">
// <!ENTITY adj-pn "pre-noun adjectival (rentaishi)">
// <!ENTITY adj-t "`taru' adjective">
// <!ENTITY adj-f "noun or verb acting prenominally">
// <!ENTITY adv "adverb (fukushi)">
// <!ENTITY adv-to "adverb taking the `to' particle">
// <!ENTITY arch "archaism">
// <!ENTITY ateji "ateji (phonetic) reading">
// <!ENTITY aux "auxiliary">
// <!ENTITY aux-v "auxiliary verb">
// <!ENTITY aux-adj "auxiliary adjective">
// <!ENTITY Buddh "Buddhist term">
// <!ENTITY chem "chemistry term">
// <!ENTITY chn "children's language">
// <!ENTITY col "colloquialism">
// <!ENTITY comp "computer terminology">
// <!ENTITY conj "conjunction">
// <!ENTITY cop-da "copula">
// <!ENTITY ctr "counter">
// <!ENTITY derog "derogatory">
// <!ENTITY eK "exclusively kanji">
// <!ENTITY ek "exclusively kana">
// <!ENTITY exp "expressions (phrases, clauses, etc.)">
// <!ENTITY fam "familiar language">
// <!ENTITY fem "female term or language">
// <!ENTITY food "food term">
// <!ENTITY geom "geometry term">
// <!ENTITY gikun "gikun (meaning as reading) or jukujikun (special kanji reading)">
// <!ENTITY hon "honorific or respectful (sonkeigo) language">
// <!ENTITY hum "humble (kenjougo) language">
// <!ENTITY iK "word containing irregular kanji usage">
// <!ENTITY id "idiomatic expression">
// <!ENTITY ik "word containing irregular kana usage">
// <!ENTITY int "interjection (kandoushi)">
// <!ENTITY io "irregular okurigana usage">
// <!ENTITY iv "irregular verb">
// <!ENTITY ling "linguistics terminology">
// <!ENTITY m-sl "manga slang">
// <!ENTITY male "male term or language">
// <!ENTITY male-sl "male slang">
// <!ENTITY math "mathematics">
// <!ENTITY mil "military">
// <!ENTITY n "noun (common) (futsuumeishi)">
// <!ENTITY n-adv "adverbial noun (fukushitekimeishi)">
// <!ENTITY n-suf "noun, used as a suffix">
// <!ENTITY n-pref "noun, used as a prefix">
// <!ENTITY n-t "noun (temporal) (jisoumeishi)">
// <!ENTITY num "numeric">
// <!ENTITY oK "word containing out-dated kanji">
// <!ENTITY obs "obsolete term">
// <!ENTITY obsc "obscure term">
// <!ENTITY ok "out-dated or obsolete kana usage">
// <!ENTITY oik "old or irregular kana form">
// <!ENTITY on-mim "onomatopoeic or mimetic word">
// <!ENTITY pn "pronoun">
// <!ENTITY poet "poetical term">
// <!ENTITY pol "polite (teineigo) language">
// <!ENTITY pref "prefix">
// <!ENTITY proverb "proverb">
// <!ENTITY prt "particle">
// <!ENTITY physics "physics terminology">
// <!ENTITY rare "rare">
// <!ENTITY sens "sensitive">
// <!ENTITY sl "slang">
// <!ENTITY suf "suffix">
// <!ENTITY uK "word usually written using kanji alone">
// <!ENTITY uk "word usually written using kana alone">
// <!ENTITY unc "unclassified">
// <!ENTITY yoji "yojijukugo">
// <!ENTITY v1 "Ichidan verb">
// <!ENTITY v1-s "Ichidan verb - kureru special class">
// <!ENTITY v2a-s "Nidan verb with 'u' ending (archaic)">
// <!ENTITY v4h "Yodan verb with `hu/fu' ending (archaic)">
// <!ENTITY v4r "Yodan verb with `ru' ending (archaic)">
// <!ENTITY v5aru "Godan verb - -aru special class">
// <!ENTITY v5b "Godan verb with `bu' ending">
// <!ENTITY v5g "Godan verb with `gu' ending">
// <!ENTITY v5k "Godan verb with `ku' ending">
// <!ENTITY v5k-s "Godan verb - Iku/Yuku special class">
// <!ENTITY v5m "Godan verb with `mu' ending">
// <!ENTITY v5n "Godan verb with `nu' ending">
// <!ENTITY v5r "Godan verb with `ru' ending">
// <!ENTITY v5r-i "Godan verb with `ru' ending (irregular verb)">
// <!ENTITY v5s "Godan verb with `su' ending">
// <!ENTITY v5t "Godan verb with `tsu' ending">
// <!ENTITY v5u "Godan verb with `u' ending">
// <!ENTITY v5u-s "Godan verb with `u' ending (special class)">
// <!ENTITY v5uru "Godan verb - Uru old class verb (old form of Eru)">
// <!ENTITY vz "Ichidan verb - zuru verb (alternative form of -jiru verbs)">
// <!ENTITY vi "intransitive verb">
// <!ENTITY vk "Kuru verb - special class">
// <!ENTITY vn "irregular nu verb">
// <!ENTITY vr "irregular ru verb, plain form ends with -ri">
// <!ENTITY vs "noun or participle which takes the aux. verb suru">
// <!ENTITY vs-c "su verb - precursor to the modern suru">
// <!ENTITY vs-s "suru verb - special class">
// <!ENTITY vs-i "suru verb - irregular">
// <!ENTITY kyb "Kyoto-ben">
// <!ENTITY osb "Osaka-ben">
// <!ENTITY ksb "Kansai-ben">
// <!ENTITY ktb "Kantou-ben">
// <!ENTITY tsb "Tosa-ben">
// <!ENTITY thb "Touhoku-ben">
// <!ENTITY tsug "Tsugaru-ben">
// <!ENTITY kyu "Kyuushuu-ben">
// <!ENTITY rkb "Ryuukyuu-ben">
// <!ENTITY nab "Nagano-ben">
// <!ENTITY hob "Hokkaido-ben">
// <!ENTITY vt "transitive verb">
// <!ENTITY vulg "vulgar expression or word">
// <!ENTITY adj-kari "`kari' adjective (archaic)">
// <!ENTITY adj-ku "`ku' adjective (archaic)">
// <!ENTITY adj-shiku "`shiku' adjective (archaic)">
// <!ENTITY adj-nari "archaic/formal form of na-adjective">
// <!ENTITY n-pr "proper noun">
// <!ENTITY v-unspec "verb unspecified">
// <!ENTITY v4k "Yodan verb with `ku' ending (archaic)">
// <!ENTITY v4g "Yodan verb with `gu' ending (archaic)">
// <!ENTITY v4s "Yodan verb with `su' ending (archaic)">
// <!ENTITY v4t "Yodan verb with `tsu' ending (archaic)">
// <!ENTITY v4n "Yodan verb with `nu' ending (archaic)">
// <!ENTITY v4b "Yodan verb with `bu' ending (archaic)">
// <!ENTITY v4m "Yodan verb with `mu' ending (archaic)">
// <!ENTITY v2k-k "Nidan verb (upper class) with `ku' ending (archaic)">
// <!ENTITY v2g-k "Nidan verb (upper class) with `gu' ending (archaic)">
// <!ENTITY v2t-k "Nidan verb (upper class) with `tsu' ending (archaic)">
// <!ENTITY v2d-k "Nidan verb (upper class) with `dzu' ending (archaic)">
// <!ENTITY v2h-k "Nidan verb (upper class) with `hu/fu' ending (archaic)">
// <!ENTITY v2b-k "Nidan verb (upper class) with `bu' ending (archaic)">
// <!ENTITY v2m-k "Nidan verb (upper class) with `mu' ending (archaic)">
// <!ENTITY v2y-k "Nidan verb (upper class) with `yu' ending (archaic)">
// <!ENTITY v2r-k "Nidan verb (upper class) with `ru' ending (archaic)">
// <!ENTITY v2k-s "Nidan verb (lower class) with `ku' ending (archaic)">
// <!ENTITY v2g-s "Nidan verb (lower class) with `gu' ending (archaic)">
// <!ENTITY v2s-s "Nidan verb (lower class) with `su' ending (archaic)">
// <!ENTITY v2z-s "Nidan verb (lower class) with `zu' ending (archaic)">
// <!ENTITY v2t-s "Nidan verb (lower class) with `tsu' ending (archaic)">
// <!ENTITY v2d-s "Nidan verb (lower class) with `dzu' ending (archaic)">
// <!ENTITY v2n-s "Nidan verb (lower class) with `nu' ending (archaic)">
// <!ENTITY v2h-s "Nidan verb (lower class) with `hu/fu' ending (archaic)">
// <!ENTITY v2b-s "Nidan verb (lower class) with `bu' ending (archaic)">
// <!ENTITY v2m-s "Nidan verb (lower class) with `mu' ending (archaic)">
// <!ENTITY v2y-s "Nidan verb (lower class) with `yu' ending (archaic)">
// <!ENTITY v2r-s "Nidan verb (lower class) with `ru' ending (archaic)">
// <!ENTITY v2w-s "Nidan verb (lower class) with `u' ending and `we' conjugation (archaic)">
// <!ENTITY archit "architecture term">
// <!ENTITY astron "astronomy, etc. term">
// <!ENTITY baseb "baseball term">
// <!ENTITY biol "biology term">
// <!ENTITY bot "botany term">
// <!ENTITY bus "business term">
// <!ENTITY econ "economics term">
// <!ENTITY engr "engineering term">
// <!ENTITY finc "finance term">
// <!ENTITY geol "geology, etc. term">
// <!ENTITY law "law, etc. term">
// <!ENTITY mahj "mahjong term">
// <!ENTITY med "medicine, etc. term">
// <!ENTITY music "music term">
// <!ENTITY Shinto "Shinto term">
// <!ENTITY shogi "shogi term">
// <!ENTITY sports "sports term">
// <!ENTITY sumo "sumo term">
// <!ENTITY zool "zoology term">
// <!ENTITY joc "jocular, humorous term">
// <!ENTITY anat "anatomical term">
