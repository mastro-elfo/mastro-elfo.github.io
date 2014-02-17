/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mastro-elfo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Module: Dom
 * Requires: Each
 */

$['Dom'] = {
	'id': function(id) {
		return document.getElementById(id);
	},
	'children': function(element, tag, a_class) {
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		
		var list = element.getElementsByTagName(tag);
		var elements = [];
		$.Each(list, function(item){
			if (!a_class || $.Dom.hasClass(item, a_class)) {
				elements.push(item);
			}
		});
		return elements;
	},
	'parents': function(element, tag, a_class){
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		tag = tag.toUpperCase();
		var parents = [];
		var parent = element.parentNode;
		while(parent && parent.tagName) {
			if (parent.tagName == tag && (!a_class || $.Dom.hasClass(parent, a_class))) {
				parents.push(parent);
			}
			parent = parent.parentNode;
		}
		return parents;
	},
	'hasClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		return element.className.split(' ').indexOf(a_class) != -1;
	},
	'addClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		if (!$.Dom.hasClass(element, a_class)) {
			element.className += ' '+a_class;
		}
	},
	'removeClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var classes = element.className.split(' ');
		var idx = 0;
		while((idx = classes.indexOf(a_class)) != -1) {
			classes.splice(idx, 1);
		}
		element.className = '';
		$.Each(classes, function(item){
			element.className += ' '+item;
		});
	},
	'addEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.addEventListener(event, fn);
	},
	'removeEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.removeEventListener(event, fn);
	},
	'element': function(tag, attributes, content, events) {
		typeof attributes == 'undefined' ? attributes = {} : 0;
		typeof content == 'undefined' ? content = '' : 0;
		typeof events == 'undefined' ? events = {} : 0;
		
		var element = document.createElement(tag);
		$.Each(attributes, function(value, key){
			element.setAttribute(key, value);
		});
		$.Each(events, function(value, key){
			$.Dom.addEvent(element, key, value);
		});
		element.innerHTML = content;
		
		return element;
	},
	'inject': function(element, container, where) {
		typeof where == 'undefined'? where = 'append' : 0;
		switch(where) {
			default:
				// Append element into container
				container.appendChild(element);
				break;
			case 'first':
				// Insert element into container in the first position
				if (container.childNodes[0]) {
					container.insertBefore(element, container.childNodes[0]);
				}
				else {
					container.appendChild(element);
				}
				break;
			case 'before':
				// Insert element before container
				container.parentNode.insertBefore(element, container);
				break;
			case 'after':
				// Insert element after container
				if (container.nextSibling) {
					container.parentNode.insertBefore(element, container.nextSibling);
				}
				else {
					container.parentNode.appendChild(element);
				}
				break;
		}
	},
	'destroy': function(element, container) {
		typeof container == 'undefined' ? container = element.parentNode : 0;
		container.removeChild(element);
	},
	'style': function(element, css_property, value){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		
		var _foo = function(key, value){
			key = key.replace(/(\-)([a-z])/, function(a){return a[1].toUpperCase();});
			element.style[key] = value;
		}
		
		if (typeof css_property == 'object') {
			$.Each(css_property, function(key, value){
				_foo(key, value);
			});
		}
		else {
			_foo(css_property, value);
		}
	}
};
