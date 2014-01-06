/*
 * cscroller.js 
 * version 0.0.1
 * creator: Santiago Chen
 * Email: santiago1209@foxmail.com
 * cscroller.js is a custom scroller with js;
 * because the default scroller is not good-looking;
 * the cscroller.js is created for better user experience;
 */

/* 
 * ATTRIBUTES:
 * barslotbg:'#ccc',
 * barbg:'#000',
 * barside:'right' | 'left' , default is right;
*/

(function($){


/*
 * With jquery-mousewheel.js for IE compatibility
 *! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Version: 3.0.6
 */
var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

/*
 * cscroller.js
*/
$.fn.cscroller=function(options){
    
    var defaults = {
        barslotbg:'#ccc',
    	barbg:'#000',
    	barside:'right'
    }

    var opts = $.extend({},defaults,options)

    var thisul = $(this).find('ul').addClass('csul').css({
    	'position':'absolute',
    	'margin':0,
    	'padding':0
    });
    
    $(this).addClass('cs').css({
    	'overflow':'hidden',
    	'position':'relative'
    });

    //create scbar
    var thisbar = $('<a class="csbar">bar</a>').css({
    	'cursor':'default',
    	'position':'absolute',
    	'background': opts.barbg,
    	'top':0,
    	'right':0,
        'zIndex': 999

    }).appendTo($(this));
    if(opts.barside=="left"){thisbar.css('left',0)};

    //create scbarslot
    var thisbarslot = $('<div class="csbarslot"></div>').css({
        'position':'absolute',
        'background': opts.barslotbg,
        'height': $(this).height(),
        'width': thisbar.width(),
        'right':0,
        'zIndex': 998
    }).appendTo($(this));
    if(opts.barside=="left"){thisbarslot.css('left',0)};

    var mousestarty, mouseoffsety, mousecurrenty;
    var barstarty, barmaxdragheight;
    var thisulstarty,thisuloffsety;
    var that = $(this);

    barmaxdragheight = $(this).height()-thisbar.height();

    //events listening;
    //mousewheel controll;
    $(this).bind('mouseenter',mouseenterhandler);
    $(this).bind('mouseleave',mouseouthandler);

    function mouseenterhandler(e){
		that.mousewheel(function(e,delta){
			barstarty = thisbar.position().top;
			wheelcontrol(delta);
		})
		
    }

	function mouseouthandler(e){
		window.onmousewheel=document.onmousewheel=null;	
	}

	function wheelcontrol(radian){
		mouseoffsety = Math.max(0,Math.min(barmaxdragheight,(radian+barstarty)));
    	thisbar.css("top",mouseoffsety);
    	thisuloffsety = (mouseoffsety*(thisul.height()-that.height()))/barmaxdragheight;
    	thisul.css("top",-thisuloffsety);
	}

	//drag scrollbar controll;
    thisbar.bind('mousedown', barmousedownhandler);
    $(document).bind('mouseup', barmouseuphandler);

    function barmousedownhandler(e){
    	e.preventDefault();
    	mousestarty = e.pageY;
    	barstarty = thisbar.position().top;
    	thisulstarty = thisul.position().top;
    	$(document).bind('mousemove',barmousemovehandler);
    }
    function barmouseuphandler(e){
    	$(document).unbind('mousemove',barmousemovehandler);
    }
    function barmousemovehandler(e){
    	e.preventDefault();
    	mousecurrenty = e.pageY;
    	mouseoffsety = Math.max(0,Math.min(barmaxdragheight,(mousecurrenty-mousestarty+barstarty)));
    	thisbar.css("top",mouseoffsety);
    	thisuloffsety = (mouseoffsety*(thisul.height()-that.height()))/barmaxdragheight;
    	thisul.css("top",-thisuloffsety);
    }



}


})(jQuery)