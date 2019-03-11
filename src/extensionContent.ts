const walker = document.createTreeWalker(
	document.body,
	NodeFilter.SHOW_TEXT,
);
while (walker.nextNode()) {
	console.log('myext', walker.currentNode.data);
}
