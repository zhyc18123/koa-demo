define(['ux',"pipe/school/school/main.js"],function(){

    var Util = pin.util;

    pin.reg("school/school/enrollScore",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
           this.initEvent();
        },
        initEvent:function(){
            var that = this;
            this.jq(".inline-select").each(function(){
                var k = $(this).attr('id');
                that[k] = pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(v){
                        that.json[k]=v;
                        if( k == "province" || k == "ty" ){
                            pin.fire('admitMajorInfo',{ key:[k,v]});
                        }
                        that.reload();
                    }
                })
                that[k].getView();
            });
            this.jq("table tbody tr").hover(function(){
                $(this).addClass('hover')
            },function(){
                $(this).removeClass('hover')
            });
            pin.on('admitEnrollScore',function(e){
                pin.log("admitEnrollScore",e);
                that.json[e.key[0]]=e.key[1];
                setTimeout(function(){
                    that.reload();    
                },100); 
            },1)
        },
        reload:function(){
            var pipeId = this.id;
            var urlData=$.extend({
                sch_id:pin.getCfg("sch_id"),
                pipeId:this.id
            },this.json);
            pipe.loadModel("/school/getEnrollScore.do",urlData);
        }
    }));

},'pipe/school/school/enrollScore.js')