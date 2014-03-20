(function ( $ ) {
	$.widget("custom.stickytab",{
		options : {
			'tabTitle' : 'Recent Content',
			'tabID' : null //optional param used to set an ID on the container element.
			},
		_isFocusable : function()	{
			//highlight the tab portion of this.sticky.
			},
		_create : function(){
			var $t = this.element, o = this.options;
			if($t.data('stickytab'))	{
				console.log(' -> already a stickytab. ');
				}
			else	{
				$t.data('stickytab',true);

				var 
					self = this, //a reference for this that can be used within some functions.
					top = null;  //will get set if some stickytabs already exist.
				
				self.sticky = $("<div \/>").addClass('ui-widget ui-stickytab'); //this is the container, will include the tab and content.
				var $tab = $("<div \/>").addClass("ui-stickytab-tab ui-state-default ui-corner-top").append($("<span \/>").text(o.tabTitle).addClass("ui-sticktab-tab-inner"));
				if($('.ui-stickytab').length)	{
					var $last = $('.ui-stickytab:first'); //the tabs are PREPENDED, so you want the 'first' child is the bottom tab.
					top = $last.position().top + $(".ui-stickytab-tab",$last).outerWidth() + 5; //the +5 is for a little space between the tabs. w/ opacity, they don't look good w/ overlap. if 5 is changed, update closeSticky.
					}

				$("<div \/>").addClass("ui-stickytab-inner")
					.append($tab)
					.width(this.element.outerWidth())
					.append($("<div \/>").addClass('ui-widget-content ui-stickytab-content'))
					.appendTo(this.sticky);

				if(top)	{self.sticky.css('top',top);} //position this tab below the last
				if(o.tabID)	{self.sticky.attr('id',o.tabID);}
				
				self.sticky.prependTo(document.body);

				$tab
					.width($tab.width()) //need a set width on this. Rotate requires a block element.
					.css({'display':'block','right':1,'transform':'rotate(90deg)','transform-origin':' 100% 100% 0','top':($tab.outerWidth() - 30),'cursor':'pointer'}) //
					.on('click.stickytab',function(){
						self.toggleSticky();
						})
				//in some browsers, transform-origin compensates for the axis the tab is rotated on. In some, like IE, it's not. The code below will compensate.
				//a difference of 2 in the check and the re-position is present so that a little play occurs between the tab and the body.
				if(self.sticky.width() - $tab.position().left > 2)	{
					$tab.css('right',((self.sticky.width() - $tab.position().left) * -1) + 2);
					}
				self._moveAnimate();
				self._handleDelegation();
				self._addCloseButton();
				setTimeout(function(){
					self.hideSticky();
					},1500);
				}
			}, //_create

//moves the contents into the tab content and animates it for an added visual indicator of what just happened.
		_moveAnimate : function(){
			var $t = this.element; 
			var $np = $('.ui-stickytab-content',this.sticky); //New Parent. Where this.element is going to get moved to on the DOM.
			var oldOffset = $t.offset(); //the physical location relative to it's original parent of this.element. Used in the animation.
			$t.appendTo($np);
			var newOffset = $t.offset(); //the physical location relative to it's new parent of this.element. Used in the animation.
			var temp = $t.clone().appendTo('body'); //a copy of this.element used for animating.
			temp.css('position', 'absolute')
				.css('left', oldOffset.left)
				.css('top', oldOffset.top)
				.css('zIndex', 1000);
			$t.hide();
			temp.animate( {'top': newOffset.top, 'left':newOffset.left}, 'slow', function(){
				$t.show();
				temp.remove();
				});
			},
		
		_addCloseButton : function()	{
			var self = this;
			var $button = $("<button \/>").text('Remove Tab').button({text: false,icons: {primary: "ui-icon-trash"}}).removeClass('ui-corner-all').addClass('ui-corner-top').appendTo($('.ui-stickytab-inner',this.sticky));
			$button
				.css({'position':'absolute','top':($button.outerHeight() * -1) + 3,'right':0,'z-index':1}) // the +3 is to get a little bit of play between the button and the tab area.
				.on('click.stickytab',function(){
					self.closeSticky();
					});
			},
		
		_handleDelegation : function()	{
			var self = this;
			$('.ui-stickytab-content').on("click.stickytab","a, button, input[type='submit']",function(event){
				//do not prevent the default. This is for links/buttons that were in the original content, moved into the tab.
				//when one is clicked, the tab should condense.
				self.hideSticky();
				});
			},

		toggleSticky : function()	{
			if(this.sticky.position().left >= 0)	{
				this.hideSticky();
				}
			else	{
				this.showSticky();
				}
			},

		showSticky : function()	{
			if(this.sticky.position().left != 0)	{
				this.sticky.animate({left: 0}, 'slow');
				}
			else	{} //already open.
			},

		hideSticky : function()	{
			this.sticky.animate({left: -(this.sticky.outerWidth())}, 'slow');
			},
		
		closeSticky : function()	{
// SANITY -> because these are prepended to the dom, an index of 0 is the bottom-most tab.
			var tabIndex = $('.ui-stickytab').index(this.sticky);
			console.log(" -> numTabs: "+$('.ui-stickytab').length);
			console.log(" -> tabIndex: "+tabIndex);
			//if this is the bottom-most tab or there is only 1 tab, it can be safely cleared w/ no further action.
			if(tabIndex == 0 || $('.ui-stickytab').length == 1)	{
				this._destroy();
				}
			else	{
				this.sticky.hide(); //hide it, then shift everything up.
				var tabWidth = $('.ui-stickytab-tab',this.sticky).outerWidth()  + 5; //the 5 is the margin added between tabs.
				$('.ui-stickytab').each(function(index){
					console.log(' -> index: '+index+' for '+$('.ui-sticktab-tab-inner',$(this)).text());
					if(index < tabIndex)	{
						$(this).animate({top: "-="+tabWidth}, 1000);
						}
					})
				}
			},
		
		_destroy : function()	{
			//the nature of this pulls the content off the DOM, so no attempt is made to put it back. In an app environment, where it came may be long gone.
			this.sticky.slideUp('fast',function(){
				$(this).empty().remove();
				})
			}
		
		}); // create the widget
	}( jQuery ));
