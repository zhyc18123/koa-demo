define(['ux'],function(){

    var Util = pin.util;

    pin.reg("school/school/ismyschool",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
            var that = this;
            this.jq(".close").click(function(){
                that.jq().cssDisplay(0);
                return false;
            });
            this.tips();
            this.contentId = this.id+"_content";
            this.jq("#content").attr("id",this.contentId)
            this.bntArea();
        },
        tips:function(){
            var tid = 0;
            var that = this;
            var tipsEl = that.jq('.tips');
            function hide(){
                tipsEl.cssDisplay(0);
            }
            this.jq(".tips-txt").hover(function(){
                tipsEl.cssDisplay(1);
                clearTimeout(tid);
            },function(){
                tid = setTimeout(hide,200);
            });
            tipsEl.hover(function(){
                clearTimeout(tid);
            },function(){
                tid = setTimeout(hide,200);
            });
        },
        bntArea:function(){
            var that = this;
            this.jq('#ok').click(function(){
                var urlData=$.extend({pipeId:that.contentId},that.json);
                pipe.loadModel("/account/setLastSchool.do",urlData);
                return false;
            });
            this.jq('#cancel').click(function(){
                pipe.loadModel("/account/setSchoolAndMajor.do",{pipeId:that.contentId});
                return false;
            });
        }
    }));

},"pipe/school/school/ismyschool.js");