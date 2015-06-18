
(function (window) {
	'use strict';

	window.App = window.App || {};

	App.TodoView = new Class({
		// a view abstraction bound to collection that displays the current view list based upon known data.

		// normal view
		Extends: Epitome.View,

		// not API, but a wrapper property
		tagName: 'tr',

		options: {
			// eavesdrop on these events
			events: {
				//'blur:relay(input.edit)': 'update',
				//'click:relay(input.toggle)': 'statusChange',
				//'keypress:relay(input.edit)': 'handleKeypress',
				//'click:relay(button.destroy)': 'removeItem',
				//'dblclick:relay(label)': 'editing'
			},

			// define actual event handlers
			onReady: function () {
				// initial view
				this.render();
			},

			// when collection changes, save the data to storage and re-render
			'onChange:collection': function () {
				this.collection.store();
				this.render();
			},

			// when models get removed, re-render
			'onRemove:collection': function () {
				this.collection.store();
				this.render();
			},

			// when sort is applied, re-render
			'onSort:collection': function () {
				this.collection.store();
				this.render();
			},

			// when a new model is added, re-render
			'onAdd:collection': function () {
				this.collection.store();
				this.render();
			},

			// fired when editing ends
			onUpdate: function (e, el) {
				var p = el.getParent('tr').removeClass(this.options.editingClass);
				var val = el.get('value').trim();

				if (!val.length) {
					// the render method stores the model into the element, get it and remove
					this.collection.removeModel(p.retrieve('model'));
					return;
				}

				p.retrieve('model').set('title', val);
			},

			// when the X is pressed, drop the model
			onRemoveItem: function (e, el) {
				if (e && e.stop) {
					e.stop();
				}

				// the render method stores the model into the element, get it and remove
				this.collection.removeModel(el.getParent('tr').retrieve('model'));
			}
		},

		render: function () {
			// main render method, will also fire onRender
			var todos = new Elements();
			var self = this;

			// empty the container.
			this.empty();

			// the route controller works with the todoFilter to help determine what we render.
			this.collection.each(function (model) {
				var obj = model.toJSON();
				var li = new Element(self.tagName).store('model', model);

				// compile template and store resulting element in our Elements collection
				todos.push(li.set('html', self.template(obj)));
			});

			// inject the elements collection into the container element
			this.element.adopt(todos);

			// propagate the render event.
			this.parent();
			return this;
		}
	});
})(window);
