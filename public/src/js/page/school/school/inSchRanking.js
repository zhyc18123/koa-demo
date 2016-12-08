define('ux',function(){

    var Util = pin.util;

    pin.reg("school/school/inSchRanking",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
            var that = this;
            var lock = false;
            var allEl = this.jq(".mod-hd span");
            allEl.click(function(){
                var el = $(this);
                if(lock)return false;
                if(!el.hasClass("span-hover")){
                    lock = true;
                    allEl.removeClass('span-hover');
                    el.addClass("span-hover");
                    that.reload(el.attr("jd"));
                }
            });
        },
        reload:function(rankingType){
            var urlData={
                sch_id:pin.getCfg("sch_id"),
                rankingType:rankingType,
                pipeId:this.id,
                diploma:this.json.diploma,
                major_id:this.json.major_id
            };
            pipe.loadModel("/school/getInSchRanking.do",urlData);
        }
    }));

},'pipe/school/school/inSchRanking.js');