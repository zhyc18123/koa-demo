define(["jquery","pin","page/head","common/animate","common/common"],function($,pin,headjs,animate) {
    
    var Req = pin.request;

    var SS={};
    SS.deferTimer = [];
    SS.split = 100;
    SS.QuadIn=function(t,b,c,d){
     return c*(t/=d)*t + b;
    }
    SS.easeIn= function(t, b, c, d) {
        return - c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    };
    SS.easeOut= function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };
    SS.easeInOut= function(t, b, c, d) {
        return - c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }
    SS.anima = function (options) {
        var sthis = this;
        var count = parseInt(options.split / SS.split);
        var nowtime = 0;
        while ((function (now) {
            function run() {
                var state = SS.QuadIn(now*SS.split, options.now, options.goal, options.split);
                options.el.numtext(parseInt(state));
            };
            run.defer(SS.split * now, sthis);
        })(++nowtime), nowtime < count);
    }
    Function.prototype.defer = function (millis, obj, args, callback) {
        var sthis = this;
        var fn = function () {
            sthis.apply(obj || sthis, args || []);
            if (typeof callback == "function") callback();
        }
        if (millis > 0) {var v = setTimeout(fn, millis);SS.deferTimer.unshift(v);return v;}
        fn();
        return 0;
    }
    $.fn.toText = function(count,split){
        if(count!=$(this).text()){
            var c = $(this).data("txt")||0;
            SS.anima({el:$(this),now:c,goal:count - c,split:split||800});
        }
    }
    $.fn.numtext = function(num){
        var str=num+"";
        var all ="";
        for(var len=str.length;len>=0;len--){
            all=str.charAt(len)+all;
            if(str.length!=len&&(str.length-len)%3==0&&len!=0)all=","+all;
        }
        $(this).data("txt",num)
        $(this).text(all);
    };
    var root = {
        maxTime:10000,
        gotoNext:function(){
            Req.q("/analyze/analyze_animate_end",{},function(){location.reload(1);});
        },
        lineAnimate:function(){
            $("i.light").css("display","block").stop(true).animate({left:"100%"},root.maxTime/10,"easeOut",function(){
                $("i.light").css("left","0%")
                root.lineAnimate();
            })
        },
        start:function(){
            var animateFun = animate.nameList;
            var inx =  parseInt(Math.random()*animateFun.length);
            $(".current-process").css("display","block").stop(true).animate({width:588},root.maxTime,animateFun[inx],function(){
                root.gotoNext();
            });
            $('#num').toText(pin.getCfg('num'),root.maxTime-1000);
            root.lineAnimate();
        }
    };

    return {
        init:function(){
            headjs.init();
            root.start();
        }
    }
});