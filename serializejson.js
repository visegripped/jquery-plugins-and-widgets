$.fn.serializeJSON = function(options){
	var json = {}
	var $element = $(this);
	options = options || {}
	options.sanity = options.sanity || false;
	//allows for a different selector to be passed, such as :input.edited
	options.selector = options.selector || ":input";

	$(options.selector,$element).each(function(){
		var val;
		if(!this.name){return}; //early exit if name not set, which is required.

		if ('radio' === this.type) {
			if(json[this.name]) { return; } //value already set, exit early.
			json[this.name] = this.checked ? this.value : '';
			}
		else if('select-multiple' === this.type)	{
			if(!this.value)	{}
			else	{
//multiple select is saved as an array.  If you need it flattened, either write a param to change the behavior or flatten it outside.
				var optionsArr = new Array(); // 'this' loses meaning in the option loop, so a var is created and set after.
				$('option',$(this)).each(function(){
					var $option = $(this);
					if($option.prop('selected'))	{
						optionsArr.push($option.val());
						}
					})
				json[this.name] = optionsArr;
				}
			}
		else if ('checkbox' === this.type) {
			if(options.sanity)	{
				if (this.checked) {json[this.name] = 1;}
				else {json[this.name] = 0;}
				}
			else	{
				if (this.checked) {json[this.name] = 'on';} //must be lowercase. that's the html default and what the old cgi's are looking for.
				}
			}
		else {
			json[this.name] = this.value;
			}
		})
	return this;
	}
