(function ($) {
	// Saving it at first because it can change when the mobile menu is opened
	var navBarHeight = $('.navbar').outerHeight();

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
			scrollTop: $(this.hash).offset().top - navBarHeight,
		}, 500);
	});

	var parallaxElements = $('.parallax');
	function refreshParallax (event) {
		parallaxElements.each(function (i, element) {
				element.style.top = (
					element.parentNode.offsetHeight
					+ element.parentNode.offsetTop
					- $(window).scrollTop()
					- (window.innerHeight / 2)
					- (element.offsetHeight / 2)
				) + 'px';
		});
	};
	$(window).scroll(refreshParallax);
    $(window).on('resize', refreshParallax);
	refreshParallax(); // Init on load
})(jQuery);

AOS.init();
