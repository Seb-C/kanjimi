<?php

// From: http://ftp.monash.edu/pub/nihongo/JMnedict.xml.gz

$namesFile = fopen(__DIR__ . "/../src/Server/Lexer/data/names.csv", "w");

$xml = new XMLReader();
$xml->open(__DIR__.'/xml/Names.xml');

while ($xml->read() && $xml->nodeType != XMLReader::DOC_TYPE);

// move to the first node
while ($xml->read() && $xml->name !== 'entry');

$count = 0; $total = 740691;
while($xml->name === 'entry') {
	$entry = $xml->expand();
	echo ($count++).' / '.$total.' = '.round($count / $total * 100)."%\n";

	$name = null;
	$nameNode = $entry->getElementsByTagName('keb');
	if (!empty($nameNode)) {
		$name = $nameNode[0]->nodeValue;
	}

	$reading = null;
	$readingNode = $entry->getElementsByTagName('reb');
	if (!empty($readingNode)) {
		$reading = $readingNode[0]->nodeValue;
	}

	if (empty($reading) && !empty($name)) {
		$reading = $name;
	}
	if (empty($name) && !empty($reading)) {
		$name = $reading;
	}

	$tags = [];
	foreach ($entry->getElementsByTagName('name_type') as $x) {
		$child = $x->childNodes[0];
		if ($child instanceof DOMEntityReference) {
			$tags[] = $child->nodeName;
		} else {
			die('err');
		}
	}

	$meanings = [];
	foreach ($entry->getElementsByTagName('trans_det') as $x) {
		fputcsv($namesFile, [
			$name,
			$reading,
			$x->nodeValue,
			implode('/', $tags)
		]);
	}

	$xml->next('entry');
}
