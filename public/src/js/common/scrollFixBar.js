define(["jquery"],function($){
    /**
     * 标题栏向下滚动到特定位置就吸附在该位置的实现
     * @param {String} $selector 
     * 需要执行滚动吸附的选择器
     * @param {Object} absoluteCss 
     * 吸附前的样式
     * @param {Object} fixedCss 
     * 固定后的样式
     */
    function scrollFixBar($selector,absoluteCss,fixedCss){
        var isBarFixed = false;
        var $bar = $selector;
        if(!$bar.length){return;}

        var aCss = absoluteCss || {
            'position':'absolute',
            'top':'auto'
        }
        var fCss = fixedCss || {
            'position':'fixed',
            'top':0
        }
        $bar.css(aCss);

        var barOffsetTop = $bar.offset().top;

        $(window).scroll(function(){
            var top = $('body').scrollTop() || $('html').scrollTop();
            if(top > barOffsetTop && !isBarFixed){
                $bar.css(fCss);
                isBarFixed = true;
            }
            if(top <= barOffsetTop&& isBarFixed){
                $bar.css(aCss);
                isBarFixed = false;

            }
        });
        $(window).scroll();
    }
    return scrollFixBar;
});