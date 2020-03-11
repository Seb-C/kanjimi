window.addEventListener('load', function () {
	const data = JSON.parse(unescape(
		document.location.search.substring(1),
	));

	addFavicon(data.favicon);
	document.title = data.title;
	document.body.innerHTML = '<iframe src="' + data.url + '"></iframe>';

	var test = document.body.getElementsByTagName('iframe')[0];
	test.addEventListener('load', function () {
		console.log(test.contentWindow, test.contentWindow.document);
	});
});

function addFavicon(url) {
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}
