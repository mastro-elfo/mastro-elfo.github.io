
var $$ = $.Dom;

var modules = {
	'ajax': {
		'title': 'Ajax',
		'short': 'Get and Post ajax requests',
		'requires': 'each'
	},
	'base64': {
		'title': 'Base64',
		'short': 'Encode/decode base64 string',
		'requires': 'utf8'
	},
	'class': {
		'title': 'Class',
		'short': 'Create objects with inherited properties',
		'requires': 'each'
	},
	'dom': {
		'title': 'Dom',
		'short': 'Dom elements management',
		'requires': 'each'
	},
	'each': {
		'title': 'Each',
		'short': 'Loop over objects',
		'requires': 'typeof'
	},
	'interval': {
		'title': 'Interval',
		'short': 'Setup intervals',
	},
	'json': {
		'title': 'Json',
		'short': 'Encode/decode json object/string',
	},
	'storage': {
		'title': 'Storage',
		'short': 'Manage local storage',
		'requires': ['each', 'json']
	},
	'timeout': {
		'title': 'Timeout',
		'short': 'Setup timeouts',
	},
	'typeof': {
		'title': 'Typeof',
		'short': 'Extended object type',
	},
	'utf8': {
		'title': 'Utf8',
		'short': 'Encode/decode utf8 string',
	},
};

window.onload = function() {
	var container = $$.id('dollar-builder');
	
	$.Ajax.get('data.appcache', {}, {
		'onSuccess': function(txt) {
			alert(txt);
		}
	});
	
	var list = $$.element('ul');
	$$.inject(list, container);
	
	$.Each(modules, function(module, id){
		var li = $$.element('li', {
				'data-id': id
			}, '<label><input type="checkbox" id="dollar-builder-model-'+id+'" data-id="'+id+'"/><span></span><span class="title">' + module.title + '</span><span class="short">' + (module['short']? module['short'] : '') + '</span>' + '</label>', {
			'click': function(event) {
				$.Each($$.children('dollar-builder', 'input'), function(input){
					$$.removeClass(input, 'required');
				});
				
				var r_dependencies = function(id){
					$$.addClass('dollar-builder-model-'+id, 'required');
					if(modules[id].requires) {
						$.Each(modules[id].requires, function(required){
							r_dependencies(required);
						});
					}
				}
				
				$.Each(modules, function(module, id){
					var input = $$.id('dollar-builder-model-'+id);
					if (input.checked) {
						if(modules[id].requires) {
							$.Each(modules[id].requires, function(required){
								r_dependencies(required);
							});
						}
					}
				});
			}
		});
		$$.inject(li, list);
	});
}
