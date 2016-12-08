define(["jquery"],function($){
    var firstBottom = $(".first-bottom");
    var fn = function(){
        var footHeight = $("#footer").outerHeight()||0;
        var st = $(window).scrollTop();
        var sh = Math.max(document.documentElement.scrollHeight||0,document.body.scrollHeight);
        var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        var bb = sh - st - clientHeight;
        if(bb < footHeight){
            firstBottom.css("bottom",footHeight-bb);
        } else {
            firstBottom.css("bottom",0);
        }
    }
    window.fixBottom = fn;
    setTimeout(function(){fn()},100);
    setTimeout(function(){fn()},200);
    $(window).scroll(fn);
    $(window).resize(fn);
});