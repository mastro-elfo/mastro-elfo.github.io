var Pages = new Class({
	initialize: function(){},
	_history: [],
	go: function(id){
		var page = $(id);
		if (page) {
			var current = $$('.'+this._classes.current)[0];
			if (current) {
				location.href = '#';
				current.removeClass(this._classes.current);
				current.addClass(this._classes.previous);
				page.addClass(this._classes.current);
				this._history.push(current.id);
			}
		}
	},
	back: function(){
		var page = $(this._history.pop());
		if (page) {
			var current = document.body.getChildren('.'+this._classes.current)[0];
			if (current) {
				current.removeClass(this._classes.current);
				page.addClass(this._classes.current);
				page.removeClass(this._classes.previous);
			}
		}
	},
	_classes: {
		current: 'current',
		previous: 'previous'
	}
});
