
var partList = [];

var Part = new Class({
	Implements: [Options, Events],
	options: {
		price: 0,
		quantity: 1,
		'onUpdate:quantity': function(){
			var self = this;
			this.data.prices.each(function(price){
				if(self.options.quantity >= price.from && self.options.quantity <= price.to) {
					self.set('price', price.cost);
					self.options.element.getElement('.cost').set('html', (self.options.quantity * price.cost).toFixed(3));
				}
			});
		},
		enabled: true,
		'onUpdate:enabled': function(){},
		'onUpdate': function(){
			var totalCost = 0;
			var totalParts = 0;
			var totalByType = 0;
			partList.each(function(item){
				if(item.options.enabled) {
					totalCost += item.options.quantity * item.options.price;
					totalParts += +item.options.quantity;
					totalByType++;
				}
			});
			$('result-table-foot-quantity').set('html', totalParts +'/'+ totalByType);
			$('result-table-foot-cost').set('html', totalCost.toFixed(2));
		}
	},
	data: {},
	initialize: function(data, options) {
		this.data = data;
		this.setOptions(options);
	},
	render: function() {
		var self = this;
		
		this.options.element.set('html', '');
		
		// Product image
		new Element('td').inject(this.options.element);
		
		// Product name
		new Element('td', {
			'html': this.data.displayName
		}).inject(this.options.element);
		
		// Quantity
		new Element('input', {
			'type': 'number',
			'value': this.options.quantity,
			'min': 0,
			'class': 'quantity'
		}).addEvents({
			'change': function(){
				self.set('quantity', this.value);
			}
		}).inject(new Element('td').inject(this.options.element));
		
		// Price
		new Element('td', {
			'class': 'price'
		}).inject(this.options.element);
		
		// Cost
		new Element('td', {
			'html': 0,
			'class': 'cost'
		}).inject(this.options.element);
		this.set('quantity', this.options.quantity);
		
		// General action
		new Element('td', {
			'html': '<span class="hidden">?</span>'
		}).inject(this.options.element);
		
		// Enable / Disable
		new Element('input', {
			'type': 'checkbox',
			'checked': this.options.enabled? 'checked' : 'false'
		}).addEvents({
			'click': function(){
				self.set('enabled', this.checked);
			}
		}).inject(new Element('td').inject(this.options.element));
		this.set('enabled', this.options.enabled);
		
		// Remove
		new Element('td', {
			'html': 'x'
		}).addEvents({
			'click': function(){
				if(confirm('Are you sure you want to delete this item?')) {
					self.destroy();
				}
			}
		}).inject(this.options.element);
		
		return this;
	},
	
	set: function(option, value) {
		this.options[option] = value;
		this.fireEvent('update');
		this.fireEvent('update:' + option);
	},
	
	destroy: function(){
		var self = this;
		partList.each(function(item, i){
			if(item == self) {
				self.options.element.destroy();
				partList.splice(i, 1);
			}
		});
	}
});

function reloadCost(quantity, prices, update) {
	update.set('html', '');
	prices.each(function(price){
		if(price.from && quantity >= price.from) {
			if(price.to && quantity <= price.to) {
				update.set('html', quantity * price.cost);
			}
		}
	});
}

window.addEvent('domready', function(){
	$('query-ids').addEvent('submit', function(event){
		event.preventDefault();
		var ids = event.target[0].value.split(',');
		ids.each(function(id){
			id = id.trim();
			
			if(!$('part-' + id)) {
				var tr = new Element('tr').inject('result-table-body');
				var td = new Element('td', {
					'colspan': '8'
				}).inject(tr);
				var waiter = new Element('img', {
					src: '',
					alt: 'Wait...'
				}).inject(td);
				
				new Request.JSON({
					url: ''//
						+'https://api.element14.com/catalog/products'//
						+'?term=id%3A' + id//
						+'&callInfo.responseDataFormat=JSON'//
						+'&callInfo.omitXmlSchema=false'//
						+'&callInfo.callback='//
						+'&callInfo.apiKey=gd8n8b2kxqw6jq5mutsbrvur'//
						+'&resultsSettings.offset=0'//
						+'&resultsSettings.numberOfResults=1'//
						+'&resultsSettings.refinements.filters='//
						+'&resultsSettings.responseGroup=prices'//
						+'&storeInfo.id=it.farnell.com',
					onSuccess: function(json){
						json.premierFarnellPartNumberReturn.products.each(function(item){
							partList.push(new Part(item, {
								id: id,
								element: tr
							}).render());
						});
					},
					onFailure: function(xhr){
						waiter.destroy();
						td.set('html', 'Failed!');
						alert(xhr);
					}
				}).setHeader('Access-Control-Allow-Origin', 'https://api.element14.com/').send();
			}
		});
		partList[0] && partList[0].fireEvent('update');
	});
});