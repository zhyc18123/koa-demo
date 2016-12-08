define(['ux',"mod/verNav.js"],function(){

    var Util = pin.util;

    pin.reg("schoolV2/school/majorInfo",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){

            /**
             * Set view & data
             */
            this.view = $('.sch-mod.sch-major-admit')
            this.json = {
                page: pin.getCfg('page'),
                countPage: pin.getCfg('countPage')
            }

            this.initEvent();
            this.eventGt();
        },
        eventGt:function(){
            var that = this;
            this.jq("#gt").click(function(){
                that.json.types='全部专业(含已停办)';
                that.reload();
                return false;
            });
        },
        initEvent:function(){
            var that = this;

            this.jq('#category').click(function(e){
                var el = $(e.target).closest('li');
                if(el.length){
                    el.find('.icon').toggleClass('checkbox-checked');
                    var arr = []
                    that.jq('#category .checkbox-checked').each(function(){
                        arr.push($(this).parent().text());
                    });
                    that.json.category = arr;
                    that.json['page'] = 1;
                    that.reload();
                }
            });

            this.jq(".page a[jd]").click(function(){
                that.json.page = $(this).attr("jd");
                that.reload();
                return false;
            })

        },
        reload:function(){
            var pipeId = this.id;
            var urlData=$.extend({
                sch_id:pin.getCfg("sch_id"),
                pipeId:this.id
            },this.json);
            pipe.loadModel("/school/v2/getMajorInfo.do",urlData);
        }
    }));

},'pipe/schoolV2/school/majorInfo.js')