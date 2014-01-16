/*
 * cscroller.js 
 * version 0.0.4
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
 * barautohide:false | true,  default  is false;
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
    	barside:'right',
        barautohide:false
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

    //create scbarwrap
    var thisbarwrap = $('<div class="csbarwrap"></div>').css({
        'position':'absolute',
        'width': 20,
        'top':0,
        'right':0,
        'margin':0,
        'padding':0,
        'zIndex': 997
    }).appendTo($(this)).hide();
    if(thisul.height()>$(this).height()){
        thisbarwrap.show();
        if(opts.barautohide==true){
            thisbarwrap.hide()
        }
    }
    if(opts.barside=="left"){thisbar.css('left',0)};


    //create scbar
    var thisbar = $('<a class="csbar">bar</a>').css({
    	'cursor':'default',
    	'position':'absolute',
    	'background': opts.barbg,
    	'top':0,
        'height': 20,
        'margin':0,
        'padding':0,
        'width': '100%',
        'zIndex': 999
    }).appendTo(thisbarwrap);

    //create scbarslot
    var thisbarslot = $('<div class="csbarslot"></div>').css({
        'position':'absolute',
        'background': opts.barslotbg,
        'height': $(this).height(),
        'width': '100%',
        'margin':0,
        'padding':0,
        'zIndex': 998
    }).appendTo(thisbarwrap);

    var mousestarty, mouseoffsety, mousecurrenty;
    var barstarty, barmaxdragheight, barslotlastheight, barlastheight, barlasttop, scaleratio;
    var thisulstarty,thisuloffsety;
    var that = $(this);

    barslotlastheight = thisbarslot.height();
    barlastheight = thisbar.height();
    //barlasttop = thisbar.position().top;

    barmaxdragheight = $(this).height()-thisbar.height();

    //resize events listen
    $(window).resize(function(){
        if(thisul.height()>that.height()){
            thisbarwrap.show();
            if(opts.barautohide==true){
                thisbarwrap.hide();
            }
        }
        else{
            thisbarwrap.hide();
        }
        
        thisbarslot.css("height",that.height());
        scaleratio = thisbarslot.height()/barslotlastheight;
        thisbar.css('height',barlastheight*scaleratio);
        barstarty = thisbar.position().top;
        barmaxdragheight = that.height()-thisbar.height();
        thisbar.css("top", barlasttop*scaleratio);
        

    })

    //events listening;
    //mousewheel controll;
    $(this).bind('mouseenter',mouseenterhandler);
    $(this).bind('mouseleave',mouseouthandler);

    function mouseenterhandler(e){
        barslotlastheight = thisbarslot.height();
        barlastheight = thisbar.height();
        
        if(thisul.height()>that.height()&&opts.barautohide==true){
            thisbarwrap.show();
        }
        console.log("ouseenterhandler thisbar top: "+thisbar.position().top);
		that.mousewheel(function(e,delta){
			barstarty = thisbar.position().top;
			wheelcontrol(delta);
		})
		
    }

	function mouseouthandler(e){
        if(opts.barautohide==true){thisbarwrap.hide();}
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
        barlasttop = thisbar.position().top;
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