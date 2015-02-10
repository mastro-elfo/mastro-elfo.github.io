$.Dom.addEvent(window, 'load', function(){
	
	// Scroll to chapter
	(function(){
		var pageYOffset = window.pageYOffset;
		var scrollUp = function(toY){
			if (window.pageYOffset > toY) {
				window.scrollBy(0, -Math.min(50, window.pageYOffset - toY));
				pageYOffset = window.pageYOffset;
				setTimeout(function(){
					scrollUp(toY);
				}, 10);
			}
			else {
				// alert('end scroll up'+(window.pageYOffset - toY))
			}
		};
		var scrollDown = function(toY){
			if (window.pageYOffset < toY) {
				window.scrollBy(0, Math.min(50, toY - window.pageYOffset));
				if (pageYOffset != window.pageYOffset) {
					pageYOffset = window.pageYOffset;
					setTimeout(function(){
						scrollDown(toY);
					}, 10);
				}
			}
			else {
				// alert('end scroll down: '+(window.pageYOffset - toY))
			}
		};
		$.Each($.Dom.select('body > nav a'), function(item){
			$.Dom.addEvent(item, 'click', function(event){
				event.preventDefault();
				var to = $.Dom.id(item.getAttribute('href').substring(1)).offsetTop;
				if (window.pageYOffset > to) {
					setTimeout(function(){
						scrollUp(to);
					}, 10);
				}
				else {
					setTimeout(function(){
						scrollDown(to);
					}, 10);
				}
			});
		});
	})();
	
	// Show/hide qrcode
	$.Dom.addEvent('contacts-qrcodeview', 'click', function(){
		if ($.Dom.hasClass('contacts-qrcodelargeview', 'large-view')) {
			$.Dom.removeClass('contacts-qrcodelargeview', 'large-view');
		}
		else {
			$.Dom.addClass('contacts-qrcodelargeview', 'large-view');
		}
	});
	$.Dom.addEvent('contacts-qrcodelargeview', 'click', function(){
		$.Dom.removeClass('contacts-qrcodelargeview', 'large-view');
	});
	
	// Scroll to top
	(function(){
		var scroll = function(toY){
			if (window.pageYOffset > toY) {
				window.scrollBy(0, -50);
				setTimeout(function(){
					scroll(toY);
				}, 10);
			}
		};
		$.Each($.Dom.select('body > article > footer:first-of-type'), function(item){
			$.Dom.addEvent(item, 'click', function(){
				setTimeout(function(){
					scroll(0);
				}, 10);
			});
		});
	})();
	
	// Set data-ready to true to manage CSS transition and special effects
	document.body.setAttribute('data-ready', true);
});
