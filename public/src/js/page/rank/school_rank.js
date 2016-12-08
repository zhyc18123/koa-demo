define(['jquery','pin','request','ui/ux','page/head'],function($,pin,Req,ux,headjs) {
    
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    pin.cfg = PageData;

    // pin.reg("rank/school_rank",Util.create(pin.getCls("defaultView"),{
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
            this.searchInput();
            this.searchBtn();
            if(this.json.params.page == 1){
                this.jq(".more a").cssDisplay( this.jq('table tbody tr').length >= 20 );
                //this.jq(".out-des").insertBefore('body>.foot');
            } else {
               //this.jq(".out-des").remove();
            }
            this.jq(".more a").unbind("click");
            this.jq('.more a').click(function(){
                that.json.params.page++;
                that.reload(true);
                return false;
            });
        },

        initEvent:function(){
            var that= this;
            if(this.json.params.page == 1){
                this.jq(".base-form .bd").unbind("click");
                this.jq(".base-form .bd").click(function(e){
                    var target = $(e.target);
                    var type = $(this).attr('type');

                    if(target.hasClass('tag')){
                        if (!target.hasClass('tag-hover')) {
                            target.addClass('tag-hover').siblings().removeClass('tag-hover');
                        }
                        if (target.attr('value') == 5) {
                            that.json.params["rankType"]= "xinchou";
                        }
                        that.json.params[$(this).attr('id')]= target.attr('value');
                        that.json.params.page=1;
                        console.log(that.json.params);
                        that.reload(false);
                    }
                    // if(target.hasClass('tag')){
                    //     var val = [];
                    //     target.checkClass('tag-hover',!target.hasClass('tag-hover'));
                    //     if(target.attr('all')){
                    //         if(target.hasClass('tag-hover')){
                    //             target.closest('.bd').find('.tag-hover').removeClass('tag-hover');
                    //             target.addClass('tag-hover');
                    //         } else {
                    //             target.addClass('tag-hover');
                    //             return;
                    //         }
                    //         val = [];
                    //     } else {
                    //         if( type == 'radio' ){
                    //             if( target.hasClass('tag-hover') ){
                    //                 target.addClass('tag-hover');
                    //                 //当前已经选中;
                    //                 return;
                    //             }
                    //             $(this).find('.tag').removeClass('tag-hover');
                    //             target.addClass('tag-hover');
                    //         }
                    //         target.closest('.bd').find('[all]').removeClass('tag-hover');
                    //         $(this).find('.tag-hover').each(function(){
                    //             var v = $(this).attr('value');
                    //             if(v){
                    //                 val.push(v);
                    //             } else {
                    //                 val.push($.trim($(this).text()))
                    //             }
                    //         });
                    //     }
                    //     that.json.params[$(this).attr('id')]=val[0];
                    //     that.json.params.page=1;
                    //     that.reload();
                    // }
                });
            }

            if(window._bd_share_main){
                window._bd_share_main.init();
            }
            window.getShare = function(cmd,config){};
            pin.util.share({
                "common":{
                    "bdSnsKey":{},
                    },
                "share":{
                     'onBeforeClick':function(cmd,config){
                    var txt = $.trim($("table a:eq(0)").text());
                    var txt2 = ""
                    if(txt){
                         txt= "，" + txt + "第一，你觉得呢？"
                    }
                    if ($("#rankType .tag-hover").attr("value") == "meizhi") {
                        txt2 += "2016年完美志愿" + $.trim($("#province .tag-hover").text()) + $.trim($("#rankType .tag-hover").text()) + "的大学";
                    } else {
                        txt2 += "2016年完美志愿" + $.trim($("#province .tag-hover").text()) + "大学" + $.trim($("#rankType .tag-hover").text());
                    }
                    return {
                        "bdUrl":pin.getCfg('bdUrl')||location.href,
                        "bdText":txt2 + txt
                    };
                    }
                }
            });
        },

        searchInput:function(){
            var el = this.jq('#searchInput');
            var that = this;
            /*var v = el.val() || '输入具体学校名称';
            el.focusText('hover',v,el.parent());*/
            el.keydown(function(e){
                if(e.keyCode == 13){
                    var val = $.trim($(this).val());
                    that.json.params.searchKey = val;
                    that.json.params.page=1;
                    that.reload(false);
                }
            });
        },

        searchBtn:function(){
            var el = this.jq('#searchBtn');
            var that = this;
            /*var v = el.val() || '输入具体学校名称';
            el.focusText('hover',v,el.parent());*/
            el.click(function(e){
                var val = $.trim(that.jq('#searchInput').val());
                that.json.params.searchKey = val;
                that.json.params.page=1;
                that.reload(false);
            });
        },

        reload:function(isMore){

            var that = this;

            Req.getSchRankList(this.json.params,function(rootData){

                var htmlStr = rootData.data.htmlStr;

                var tbodyStr = $(rootData.data.htmlStr).find("#tbody").html();

                if(isMore){
                    $('#tbody').append(tbodyStr);
                }else{
                    $('.rank').html(htmlStr);
                }

                //  处理查看更多按钮
                // var appendtr = $(rootData.data.htmlStr).find("table tbody tr");
                // $('.more a').cssDisplay(appendtr.length == 20);
                $('.more a').cssDisplay(rootData.data.hasMore);

            })
        }
    }));

    return ept;

});
