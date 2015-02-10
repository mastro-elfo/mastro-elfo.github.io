
$.Dom.addEvent(window, 'load', function(){
	var resetTimeout = function(){
		document.body.removeAttribute('data-screensaver');
		$.Timeout.set('screensaver', function(){
			$.Dom.fireEvent(window, 'screensaver-timeout');
		}, 600000);
	};
	
	$.Dom.addEvent(window, 'screensaver-timeout', function(){
		document.body.setAttribute('data-screensaver', true);
	});
	
	
	$.Dom.addEvent(document.body, 'mousemove', resetTimeout);
	$.Dom.addEvent(document.body, 'keydown', resetTimeout);
	$.Dom.addEvent(document.body, 'click', resetTimeout);
	// wheel
	// $.Dom.addEvent(document.body, 'mousemove', resetTimeout);
	
	$.Dom.inject($.Dom.element('style', {}, '@keyframes moveX{from{left:0;}to{left:calc(100% - 1em);}}@keyframes moveY{from{top:0;}to{top:calc(100% - 1em);}}body[data-screensaver][data-ready]:after{font-size: 5rem;content:"";display:block;position:fixed;width:1em;height:1em;z-index:1000;border-radius:1em;background:orange;background:radial-gradient(circle at 0.3em 0.3em,red,transparent);animation:moveX 3.05s linear 0s infinite alternate,moveY 3.4s linear 0s infinite alternate}'), document.head);
	
	resetTimeout();
});