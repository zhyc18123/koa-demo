define(['jquery','pin','request','ui/ux','page/head'],function($,pin,Req,ux,headjs) {
    
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    pin.cfg = PageData;

    // pin.reg("rank/major_rank",Util.create(pin.getCls("defaultView"),{
    var ept = (({

        json:PageData, 
        jq:$, 
        
        init:function(){
            this.onViewReady();
            headjs.init();
        },

        getViewBefore:function(){
            if(this.json.params.page!=1){
                this.getView = $.noop;
                var nowtr = this.jq("table tbody tr");
                $("#"+this.id+" table tbody").append(nowtr);
                $('.more a').cssDisplay(nowtr.length == 20);
                this.view = $("#"+this.id);
            } else {
                $('.more a').cssDisplay(1);
            }
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
                        if ($(this).attr('id') == "diploma") {
                            that.json.params["majorCategory"]= "";
                        }
                        that.json.params[$(this).attr('id')]= target.attr('value');
                        that.json.params.page=1;
                        console.log(that.json.params);
                        that.reload(false);
                    }
                });
            }
        },
        onViewReady:function(){
            var that = this;
            this.initEvent();
            // this.searchInput();
            // this.searchBtn();
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
                        var txt2 = "";
                        if($("#diploma .tag-hover").attr("value") == 7) {
                            txt2 += "2016年完美志愿中国大学" + $.trim($("#majorCategory .tag-hover").text()) + "本科专业薪酬排行榜";
                        } else {
                            txt2 += "2016年完美志愿中国大学" + $.trim($("#majorCategory .tag-hover").text()) + "专科专业薪酬排行榜";
                        }
                        if(txt){
                            txt= "，" + txt + "第一，你觉得呢？"
                        }
                        return {
                            "bdUrl":pin.getCfg('bdUrl')||location.href,
                            "bdText":txt2 + txt
                        };
                    }
                }
            });
        },
        // searchInput:function(){
        //     var el = this.jq('#searchInput');
        //     var that = this;
        //     /*var v = el.val() || '输入具体学校名称';
        //     el.focusText('hover',v,el.parent());*/
        //     el.keydown(function(e){
        //         if(e.keyCode == 13){
        //             var val = $.trim($(this).val());
        //             that.json.params.searchKey = val;
        //             that.json.params.page=1;
        //             that.reload();
        //         }
        //     });
        // },
        // searchBtn:function(){
        //     var el = this.jq('#searchBtn');
        //     var that = this;
        //     /*var v = el.val() || '输入具体学校名称';
        //     el.focusText('hover',v,el.parent());*/
        //     el.click(function(e){
        //         var val = $.trim(that.jq('#searchInput').val());
        //         that.json.params.searchKey = val;
        //         that.json.params.page=1;
        //         that.reload();
        //     });
        // },
        reload:function(isMore){
            // var pipeId = this.id;
            // var urlData=$.extend({pipeId:this.id},this.json.params);
            // pipe.loadModel("/rank/major",urlData);

            var that = this;

            Req.getMajorRankList(this.json.params,function(rootData){

                var htmlStr = rootData.data.htmlStr;

                var tbodyStr = $(rootData.data.htmlStr).find("#tbody").html();

                if(isMore){
                    $('#tbody').append(tbodyStr);
                }else{
                    $('.inner_rank').html(htmlStr);
                }

                //  处理查看更多按钮
                // var appendtr = $(rootData.data.htmlStr).find("table tbody tr");
                // $('.more a').cssDisplay(appendtr.length == 20);
                $('.more a').cssDisplay(rootData.data.hasMore);
                that.init();
            })


        }
    }));

    return ept;

});
