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
})(jQuery);

window.addEventListener('load', function () {
	var parallaxElements = document.querySelectorAll('.parallax');
	function refreshParallax (event) {
		parallaxElements.forEach(function (element) {
			var speed = 1;
			if (element.classList.contains('parallax-fast')) {
				speed = 2;
			} else if (element.classList.contains('parallax-slow')) {
				speed = 0.5;
			}

			element.style.top = (
				(
					element.parentNode.offsetHeight
					+ element.parentNode.offsetTop
					- window.scrollY
					- (window.innerHeight / 2)
					- (element.offsetHeight / 2)
				) * speed
			) + 'px';
		});
	};
	window.addEventListener('scroll', refreshParallax);
	window.addEventListener('resize', refreshParallax);
	refreshParallax(); // Init on load

	var trainElement = document.querySelector('.horizontal-train-parallax');
	function refreshTrainParallax (event) {
		var progress = window.scrollY / window.innerHeight;
		var translateX = window.innerWidth * progress;
		var scale = 1 + (progress * 1.55);
		trainElement.style.transform = 'translateX(' + translateX + 'px) scale(' + scale + ')';
	};
	window.addEventListener('scroll', refreshTrainParallax);
	window.addEventListener('resize', refreshTrainParallax);
	refreshTrainParallax(); // Init on load
});

AOS.init();
