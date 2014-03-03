$.widget("custom.jpanel",{
	options : {
		defaultState : 'show', //show, hide. sets panel contents to visible or hidden
		content : null, //a jquery object of content to use.
		showToggleButton : true, //toggles the panel open/closed
		showCloseButton : true, //will close the panel (remove it)
		wholeHeaderToggle : true, //set to false if only the expand/collapse button should toggle panel (important if panel is draggable)
		header : null, //string. if set, will create an h2 around this and NOT use firstchild.
		persist : false, //if set to true to remember whether panel content should be visible/hidden
		name : null, //optional, used in conjunction w/ persist. if persist is true and no ID is set, name is required.
		buttons : [] //pass in an array of buttons and they'll be added to the header, next to 'close' and 'toggle'. each array item should be a jQuery object.
		},
	
	_create : function(){
		var
			o = this.options, //shortcut
			$t = this.element;
		
		if($t.data('jpanel'))	{} //already a panel, skip all the styling and data.
		else	{
			$t.addClass('ui-widget ui-jpanel').data('jpanel',true)

			if(o.name)	{$t.addClass('panel_'+o.name)} 
			var
				$header = $("<div \/>").addClass('ui-widget-header  ui-corner-top ui-jpanel-header ui-jpanel-header').css('margin-bottom',0),
				$content = $("<div \/>").addClass('ui-widget-content ui-corner-bottom ui-jpanel-content ui-jpanel-content').css('borderTop','0');

			if(o.wholeHeaderToggle)	{$header.attr('data-verb','toggle')}

			if(o.content)	{$content.append(o.content);}
			else if(o.header)	{$content.append($t.html());} //if a header was passed in, then use the contents of the element.
			else	{$content.append($t.children(":nth-child(2)"));} //no content. first child is title. second child is content.
			$content.appendTo($t); //content area.


			if(o.header)	{$header.append($("<h2 class='ui-jpanel-title' \/>").text(o.header));}
			else	{$header.append($t.children(":first").addClass('ui-jpanel-title'));}
			if(o.wholeHeaderToggle)	{$header.attr('data-verb','toggle')}
			$header.prependTo($t);

			this._handleButtons($header);
			this._handleInitialState();
			this._delegateEvents();
			}
		}, //_init

	
	_delegateEvents : function()	{
		var self = this;
		this.element.on("click.jpanel","[data-verb]",function(event){
			event.preventDefault();
			event.stopPropagation();
			var verb = $(this).data('verb');
			if(typeof self[verb+'Panel'] == 'function')	{
				self[verb+'Panel'](event);
				}
			else	{
				//invalid verb
				}
			return false;
			});
		},

	_setOption : function(option,value)	{
		$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
		switch (option)	{
			case 'state':
				(value === 'collapse') ? this.collapse() : this.expand(); //the expand/collapse function will change the options.state val as well.
				break;

			case 'settingsMenu':
				$.extend(this.options.menu,value); //add the new menu to the existing menu object. will overwrite if one already exists.
				this._destroySettingsMenu();
				this._buildSettingsMenu();
				break;
			
			default:
//					dump("Unrecognized option passed into jpanel via setOption");
//					dump(" -> option: "+option);
				break;
			}
		},

	_handleButtons : function($header)	{

		var o = this.options; //shortcut.
		
		//any custom buttons should be handled/added first. that'll put them left-most thx to the float right/prependTo.
		if(o.buttons.length)	{
			for(var i = o.buttons.length -1; i >= 0; i -= 1)	{
				o.buttons[i].on('click.jpanel',function(event){event.stopPropagation();}); //add a click event on custom buttons to stop propogation, so as to not trigger the toggle
				o.buttons[i].prependTo($header)
				}
			}

		if(o.showToggleButton)	{
			$("<button \/>").text("Toggle").attr({'data-verb':'toggle','title':'hide or show panel contents'}).button({text: false,icons: {primary: "ui-icon-triangle-1-s"}}).prependTo($header);
			}

		if(o.showCloseButton)	{
			$("<button \/>").text("Close").attr({'data-verb':'close','title':'close'}).button({text: false,icons: {primary: "ui-icon-close"}}).prependTo($header);
			}

		$('button',$header).addClass('ui-jpanel ui-jpanel-titlebar-button')
		},

	_handleInitialState : function()	{
		var o = this.options, state;
		if(o.persist)	{
			if(this.options.name || this.element.attr('id'))	{
				try{
					state = window.localStorage.getItem('jpanel_'+(this.options.name ? this.options.name : "_"+this.element.attr('id'))) || o.defaultState;
					}
				catch(e)	{
					if(console in window)	{
						console.warn("In jpanel, something went wrong fetching state from local storage");
						}
					state = 'show';
					}
				}
			else	{
				state = 'show';
				if(console in window)	{
					console.warn("In jpanel, persist is enabled but no 'name' set in options and target element has no id.");
					}
				}
			}
		else if(o.defaultState == 'show' || o.defaultState == 'hide')	{
			state = o.defaultState;
			}
		else	{
			state = 'show'; //always default to showing the content.
			}
		//when the panel is first created, state is not save to localstorage. it isn't saved till the user interacts w/ the panel.
		if(state == 'hide')	{ this.hidePanel(true);}
		else if (state == 'show')	{this.showPanel(true);}
		else	{
			console.warn("Invalid state passed into jpanel");
			}
		},
	
	_localStorageSet : function(state)	{
		var r = false; //what is returned. true if LS var was set.
		if(this.options.name || this.element.attr('id'))	{
			try{
				state = window.localStorage.setItem('jpanel_'+(this.options.name ? this.options.name : "_"+this.element.attr('id')),state);
				r = true;
				}
			catch(e)	{
				if(console in window)	{
					console.warn("In jpanel, persist is enabled but an error occured when attempting to save to local storage.");
					consle.log(e);
					}
				}
			}
		else	{
			if(console in window)	{
				console.warn("In jpanel, persist is enabled but no 'name' set in options and target element has no id.");
				}
			}
		return r;
		},

//toggles the state of the current panel. Will return boolean, true if panel content is now visible and false for now hidden.
	togglePanel : function(){
		var r;
		if($('.ui-widget-content:first',this.element).is(':visible'))	{this.hidePanel(); r = false;}
		else	{this.showPanel(); r = true;}
		return r;
		},

	closePanel : function()	{
		this.element.off("click.jpanel").empty().remove();
		},

//the corner bottom class is added/removed to the header as the panel is collapsed/expanded, respectively, for aeshtetic reasons.
	hidePanel : function(preserveState){
		var $t = this.element;
		preserveState = preserveState || false; //set to true to collapse, but not change state. allows for mass collapse w/out session update and for restoring on a mass-restore
		$("button[data-verb='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-w'},'text':false});
		$('.ui-widget-content:first',this.element).slideUp('slow',function(){
			$('.ui-widget-header',$t).addClass('ui-corner-bottom'); //adding the rounded corners after the animation gives a better appearance of the content section sliding into the header.
			});
		if(!preserveState)	{this._localStorageSet('hide');}
		},

	showPanel : function(preserveState){
		$("button[data-verb='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-s'},'text':false});
		$('.ui-widget-content:first',this.element).slideDown();
		$('.ui-widget-header',this.element).removeClass('ui-corner-bottom');
		if(!preserveState)	{this._localStorageSet('show');}
		},
//the object of destroy is to return the DOM to it's pre-plugin state. so if header or content were passed in, they are removed entirely (they weren't on the DOM to begin with).
	_destroy : function(){
		var $t = this.element, o = this.options;
		//if the header was NOT passed in, put it back where it belongs.
		if(!o.header)	{
			$('.ui-jpanel-title:first',$t).removeClass('ui-jpanel-title').prependTo($t);
			} 
		$('.ui-widget-header:first',$t).empty().remove();

		if(!o.content)	{
			$t.append($('.ui-widget-content:first',$t).html());
			}
		$('.ui-widget-content:first',$t).empty().remove();		
		this.element.removeClass('ui-jpanel ui-widget').removeData('jpanel');
		}
	}); // create the widget
	
