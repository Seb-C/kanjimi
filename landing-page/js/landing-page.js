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
	var startScroll = window.scrollY;
	var currentScroll = window.scrollY;
	var targetScroll = window.scrollY;
	var startTime = 0;
	var currentTime = 0;
	var targetTime = 0;
	var listeners = [];
	function animateNextFrame () {
		window.requestAnimationFrame(function () {
			animateNextFrame();

			currentTime = +new Date();
			var progress = (currentTime - startTime) / (targetTime - startTime);
			if (progress > 1) {
				progress = 1;
			}

			currentScroll = startScroll + (targetScroll - startScroll) * progress;
			listeners.forEach(function (listener) {
				listener(currentScroll);
			});
		});
	}
	animateNextFrame();

	function scrollEvent (event) {
		startScroll = currentScroll;
		targetScroll = window.scrollY;
		startTime = currentTime;
		targetTime = startTime + 150;
	}
	window.addEventListener('scroll', scrollEvent);
	window.addEventListener('resize', scrollEvent);
	scrollEvent(); // Init on load

	document.querySelectorAll('.parallax').forEach(function (element) {
		listeners.push(function (scrollY) {
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
					- scrollY
					- (window.innerHeight / 2)
					- (element.offsetHeight / 2)
				) * speed
			) + 'px';
		});
	});

	var trainElement = document.querySelector('.horizontal-train-parallax');
	listeners.push(function (scrollY) {
		var progress = scrollY / window.innerHeight;
		var translateX = window.innerWidth * progress;
		var scale = 1 + (progress * 1.55);
		trainElement.style.transform = 'translateX(' + translateX + 'px) scale(' + scale + ')';
	});
});

AOS.init();
