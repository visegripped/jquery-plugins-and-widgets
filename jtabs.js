$.widget("custom.jtabs",{
	options : {
		'persist' : false //if enabled, will remember which tab was last open. If multiple tab sets are in use, set value to a descriptor instead of just 'true'. ex: 'homepage' or 'product'
		},
	_create : function()	{
		var self = this,
		o = self.options, //shortcut
		$t = self.element; //this is the targeted element (ex: $('#bob').jtabs() then $t is bob)

		if($t.data('jtabs'))	{} //element has already been set as tabs.
		else	{
			$t.data('jtabs',true)
			$t.addClass('ui-tabs ui-widget ui-jtabs');
			self.tabs = $("ul",$t).first();
//style and move tabs into container.
			self._handleContent();
			self._addClasses2Content();
			
//style and add click events to tabs.
			self._addClassesAndData2Tabs();
			self._addEvent2Tabs();
//make a tab visible/active.
			self._handleDefaultTab();
			}
		},

	_setOption : function(option,value)	{
		$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
		},

	_handleDefaultTab : function()	{
		var o = this.options;
//if no anchor is set, activate the default.
		if(o.persist)	{
			var theAnchor;
			
			try{
				theAnchor = window.localStorage.getItem('jtabs'+(this.options.persist === true ? "" : "_"+this.options.persist));
				}
			catch(e)	{}
			if(theAnchor && $("li[data-jtabs-tab='"+theAnchor+"']",this.element).length)	{
				this.reveal($("li[data-jtabs-tab='"+theAnchor+"']",this.element));
				}
			else	{
				this.reveal($("li:first",this.element));
				}
			}
		else	{
			this.reveal($("li:first",this.element));
			}
		},

	_addEvent2Tabs : function()	{
		var self = this;
		//the click is registered on the li, not the a. that way any part of the 'tab' can be clicked.
		this.tabs.on('click.jtabs','li',function(event){
			event.preventDefault();
			self._handleTabClick($(this));
//				return false; //if function returns false, any delegated events on tab don't run.
			});
		},

	_addClassesAndData2Tabs : function()	{
		this.tabs.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix').css({'padding-left':'0px'});
		this.tabs.find('a').addClass('ui-tabs-anchor').attr('data-role','presentation');
// * 201336 -> wanted a data reference on the li of the tab that was consistent. can be used to show or hide tab, if needed.
		this.tabs.find('li').each(function(){
			$(this).addClass('ui-state-default ui-corner-top');
			var thisAnchor = $(this).find('a').first().attr('href').substr(1);
			$(this).attr('data-jtabs-tab',thisAnchor).data('tab',thisAnchor);
			});
		},
//create a container div and add each content panel to it.
	_handleContent : function()	{
		var $t = this.element,
		self = this;
		
		self.tabContent = $("<div \/>").addClass('ui-widget ui-widget-content ui-jtabs-content ui-corner-bottom ui-corner-tr');
		$t.append(self.tabContent);
		$("[data-jtab-content]",$t).each(function(){
			self.tabContent.append($(this));
			});
		},

	_addClasses2Content : function()	{
		$("[data-jtab-content]",this.element).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").css('display','none');
		},

	_setTabInLS : function(theAnchor)	{
		var support;
		try{
			window.localStorage.setItem('jtabs'+(this.options.persist === true ? "" : "_"+this.options.persist), theAnchor);
			}
		catch(e){
//localstorage not supported.
			}
		},

//handle click needs to be separate from reveal. That way an jtabs('reveal','suchandsuch') can 'trigger' the click on the tab, thus executing any other delegated events that are present.
// any programatic tab changes should trigger the reveal code except the actual delegated click event (that click action would already trigger any other delegated events).
	_handleTabClick : function($tab2show)	{
		var o = this.options;
		if($tab2show)	{
			var dac = $tab2show.data('tab'); //data-jtab-content
			this.tabs.find('.ui-state-active').removeClass('ui-state-active ui-tabs-active');
			$tab2show.addClass('ui-state-active ui-tabs-active');

			this.tabContent.find('.ui-tabs-panel').hide();
			$("[data-jtab-content='"+dac+"']",this.tabContent).show();
			if(o.persist)	{
				this._setTabInLS(dac);
				}
			}
		else	{} //unknownn type for $tab far
		},

	reveal : function($tab)	{
		var $tab2show = false;
		//method accepts string or jquery object as the trigger.
		
		if(Number($tab) >= 0)	{
			$tab2show = $("li[data-jtabs-tab]:eq("+$tab+")",this.tabs)
			}
		if(typeof $tab == 'string')	{
			$tab2show = $("li[data-jtabs-tab='"+$tab+"']",this.tabs);
			}
		//testing for data('tab') ensures that the jquery object passed in is, indeed a tab.
		else if($tab instanceof jQuery && $tab.length && $tab.data('tab'))	{
			$tab2show = $tab;
			}
		else	{
			console.warn("In jtabs, a 'reveal' was triggered but the $tab passed in was either not a string or an object ["+typeof $tab+"] or it was an object but not a valid jquery instance ["+($tab instanceof jQuery)+"], had no length ["+$tab.length+"] or not a tab");
			}
		
		if($tab2show)	{
			//click triggered is NOT specific to jtabs so that any other delegated events are also triggered.
			//if any internal process needs to trigger just the jtabs code, run the _handleTabClick code OR trigger click.jtabs
			$tab2show.trigger('click'); 
			}
		
		},

//clear the message entirely. run after a close. removes element from DOM.
	_destroy : function(){
		this.element.removeClass("ui-tabs ui-widget ui-jtabs");
		this.element.removeData("jtabs");
		$('li',this.tabs).each(function(){
			$(this).removeClass('ui-state-default ui-state-active ui-corner-top').find('a').removeClass('ui-tabs-anchor');
			});
		//the content areas are appended to a div created by the plugin, so they need to be moved back.
		$("[data-jtab-content]",this.element).removeClass("ui-tabs-panel ui-widget-content ui-corner-bottom").css('display','').appendTo(this.element);
		$('.ui-jtabs-content',this.element).empty().remove();
		}
	}); // create the widget
