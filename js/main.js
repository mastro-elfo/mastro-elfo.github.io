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
		$.Each($.Dom.select('body > nav li a'), function(item){
			$.Dom.addEvent(item, 'click', function(event){
				event.preventDefault();
				var href = event.target.getAttribute('href');
				var nav = $.Dom.select('body > nav')[0];
				nav.setAttribute('data-focus', href);
				if (href == '#mainmenu') {
					scrollDown(nav.offsetTop);
					return;
				}
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
