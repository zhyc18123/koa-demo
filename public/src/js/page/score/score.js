define(['request','page/head'],function(Req,headjs) {
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    pin.cfg = PageData;

    var ept = (({

        json:PageData, 
        jq:$, 
        
        init:function(){
            this.onViewReady();
            headjs.init();
        },

        onViewReady:function(){
            var that = this;
            this.initEvent();
        },
        initEvent:function(){
            var that= this;
            this.jq(".inline-select").unbind("click");
            this.jq(".inline-select").click(function(e){
                var target = $(e.target);
                if(target[0].tagName != "LI")
                    return false;
                console.log(target.data("key"));
                that.json.params[$(this).attr('id')] = target.data("key");
                console.log(that.json.params);
                that.reload();
            });
            this.jq(".admit").click(function(e) {
                $(".select-ul").each(function() {
                    if (!$(this).hasClass("hidden")) {
                        $(this).addClass("hidden").prev().removeClass("icon-up");
                    }
                })
            });
            this.jq(".inline-select").click(function(e) {
                e.stopPropagation();
                var $icon = $(this).find(".icon-down");
                var $select = $(this).find(".select-ul");
                $(this).siblings(".inline-select").find(".icon-up").removeClass("icon-up");
                $(this).siblings(".inline-select").find(".select-ul").addClass("hidden");
                $icon.hasClass("icon-up") ? $icon.removeClass("icon-up") : $icon.addClass("icon-up");
                $select.hasClass("hidden") ? $select.removeClass("hidden") : $select.addClass("hidden");;
            });
        },
        reload:function(){

            Req.getScoreList(this.json.params,function(rootData){

                var htmlStr = rootData.data.htmlStr;

                $('.score').html(htmlStr);

            })
        }
    }));

    return ept;
});
