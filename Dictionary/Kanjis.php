<?php

// From: http://ftp.monash.edu/pub/nihongo/kanjidic2.xml.gz

$languageCodes = ['en', 'fr', 'pt', 'es'];

$readingsCsv = fopen(__DIR__ . "/../src/Server/Lexer/data/kanjis-readings.csv", "w");

$meaningsCsvPerLang = [];
foreach ($languageCodes as $lang) {
	$file = fopen(__DIR__ . "/../src/Server/Lexer/data/kanjis-meanings-$lang.csv", "w");
	$meaningsCsvPerLang[$lang] = $file;
}

$xml = new XMLReader();
$xml->open(__DIR__.'/xml/Kanjis.xml');

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);

// move to the first node
while ($xml->read() && $xml->name !== 'character');

$count = 0; $total = 13108;
while($xml->name === 'character') {
	$character = $xml->expand();
	echo ($count++).' / '.$total.' = '.round($count / $total * 100)."%\n";

	$kanji = $character->getElementsByTagName('literal')[0]->nodeValue;

	foreach ($character->getElementsByTagName('reading') as $reading) {
		$type = $reading->getAttribute('r_type');
		if ($type == 'ja_on' || $type == 'ja_kun') {
			fputcsv($readingsCsv, [$kanji, $reading->nodeValue]);
		}
	}

	foreach ($character->getElementsByTagName('meaning') as $meaning) {
		$lang = empty($meaning->getAttribute('m_lang')) ? 'en' : $meaning->getAttribute('m_lang') ;
		fputcsv($meaningsCsvPerLang[$lang], [$kanji, $meaning->nodeValue]);
	}

	$xml->next('character');
}
