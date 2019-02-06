<?php

$xml = new XMLReader();
$xml->open('./xml/Dictionary.xml');

// TODO test to remove
function outerHTML($e) {
     $doc = new DOMDocument();
     $doc->appendChild($doc->importNode($e, true));
     return $doc->saveHTML()."\nLineNo: ".$e->getLineNo();
}

// TODO re-chek everything
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
        'ent_seq' => null,
        'k_ele' => [],
        'r_ele' => [],
        'sense' => [],
    ];

    $entSeq = $entry->getElementsByTagName('ent_seq')->item(0);
    if (!empty($entSeq)) {
        $data['ent_seq'] = $entSeq->nodeValue;
    }

    foreach ($entry->getElementsByTagName('k_ele') as $k) {
        $kData = [
            'keb' => $k->getElementsByTagName('keb')[0]->nodeValue,
            'ke_inf' => [],
            'ke_pri' => [],
        ];

        foreach ($k->getElementsByTagName('ke_inf') as $x) {
            $kData['ke_inf'][] = $x->nodeValue;
        }

        foreach ($k->getElementsByTagName('ke_pri') as $x) {
            $kData['ke_pri'][] = $x->nodeValue;
        }

        $data['k_ele'][] = $kData;
    }

    foreach ($entry->getElementsByTagName('r_ele') as $r) {
        $rData = [
            'reb' => $r->getElementsByTagName('reb')[0]->nodeValue,
            're_nokanji' => null,
            're_restr' => [],
            're_inf' => [],
            're_pri' => [],
        ];

        $nok = $r->getElementsByTagName('re_nokanji');
        if (count($nok) > 0) {
            $rData['re_nokanji'] = $nok[0]->nodeValue;
        }

        foreach ($r->getElementsByTagName('re_restr') as $x) {
            $rData['re_restr'][] = $x->nodeValue;
        }

        foreach ($r->getElementsByTagName('re_inf') as $x) {
            $rData['re_inf'][] = $x->nodeValue;
        }

        foreach ($r->getElementsByTagName('re_pri') as $x) {
            $rData['re_pri'][] = $x->nodeValue;
        }

        $data['r_ele'][] = $rData;
    }

    foreach ($entry->getElementsByTagName('sense') as $sense) {
        $senseData = [
            'stagk' => [],
            'stagr' => [],
            'pos' => [],
            'xref' => [],
            'ant' => [],
            'field' => [],
            'misc' => [],
            's_inf' => [],
            'lsource' => [],
            'dial' => [],
            'gloss' => [],
        ];

        foreach ($sense->getElementsByTagName('stagk') as $x) {
            $senseData['stagk'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('stagr') as $x) {
            $senseData['stagr'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('pos') as $x) {


            // TODO try to properly get tags (xml entities) everywhere
            print_r($x->childNodes->item(0));
            var_dump([
                outerHTML($x),
                $x->nodeValue,
            ]); exit;
            $senseData['pos'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('xref') as $x) {
            $senseData['xref'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('ant') as $x) {
            $senseData['ant'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('field') as $x) {
            $senseData['field'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('misc') as $x) {
            $senseData['misc'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('s_inf') as $x) {
            $senseData['s_inf'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('lsource') as $x) {
            $senseData['lsource'][] = [
                'value' => $x->nodeValue,
                'lang' => $x->getAttribute('xml:lang'),
                'ls_type' => $x->getAttribute('ls_type'),
                'ls_wasei' => $x->getAttribute('ls_wasei'),
            ];
        }
        foreach ($sense->getElementsByTagName('dial') as $x) {
            $senseData['dial'][] = $x->nodeValue;
        }
        foreach ($sense->getElementsByTagName('gloss') as $x) {
            $xData = [
                'value' => $x->nodeValue,
                'lang' => $x->getAttribute('xml:lang'),
                'g_gend' => $x->getAttribute('g_gend'),
                'g_type' => $x->getAttribute('g_type'),
                'pri' => [],
            ];

            foreach ($x->getElementsByTagName('pri') as $pri) {
                $senseData['pri'][] = $pri->nodeValue;
            }

            $senseData['gloss'][] = $xData;
        }

        $data['sense'][] = $senseData;
    }

    print_r($data);

    $xml->next('entry');
}
