<?php

ini_set('memory_limit', -1);

$recursivelyFindData = function (DOMNode $node, array $inheritedAttributes = []) use (&$recursivelyFindData) {
	$data = [];
	do {
		$attributes = [];
		if ($node instanceof DOMElement) {
			if ($node->hasAttribute('kvg:element')) {
				$attributes['element'] = $node->getAttribute('kvg:element');
			}

			if ($node->hasAttribute('kvg:position')) {
				$attributes['position'] = $node->getAttribute('kvg:position');
			} elseif (!empty($attributes['element']) && !empty($inheritedAttributes['position'])) {
				$attributes['position'] = $inheritedAttributes['position'];
			}
		}

		$components = [];
		if ($node->firstChild !== null) {
			$components = $recursivelyFindData($node->firstChild, $attributes);
		}

		if (!empty($attributes) && !empty($attributes['element'])) {
			$nodeData = $attributes;
			$nodeData['components'] = $components;
			$data[] = $nodeData;
		} elseif (!empty($components)) {
			array_push($data, ...$components);
		}
	} while (($node = $node->nextSibling) !== null);

	return $data;
};

$count = 0;
$total = 6743;
$kanjis = [];
foreach (new DirectoryIterator(realpath(__DIR__ . '/../www/img/KanjiVG')) as $file) {
	if (!$file->isDot() && preg_match('/^[^-]+\.svg$/', $file->getFilename())) {
		echo "$count / $total (now starting {$file->getFilename()})\n";

		$svg = new DOMDocument();
		$svg->load($file->getPathname());

		$data = $recursivelyFindData($svg);
		if (empty($data)) {
			continue; // No useful data in this file
		}

		$kanjis[$data[0]['element']] = $data[0];

		$count++;
	}
}

print_r($kanjis);
