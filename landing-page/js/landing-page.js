(function ($) {
	// Fixing the 100vh not ignoring the header
	$('.min-vh-100').each(function (i, element) {
		const height = 'min-height: calc(100vh - ' + $('.navbar').outerHeight() + 'px) !important';
		element.setAttribute('style', height + ';' + (element.getAttribute('style') || ''));
	});

	// Setting the scroll-spy offset to the actual header height
	$('[data-spy="scroll"]').attr('data-offset', $('.navbar').outerHeight() + 10);

	// Setup for smooth animated nav bar links scrolling
	$("a[href^='#']").on('click', function(event) {
		event.preventDefault();
		$('html, body').animate({
			scrollTop: $(this.hash).offset().top - $('.navbar').outerHeight(),
		}, 500);
	});
})(jQuery);

AOS.init();
