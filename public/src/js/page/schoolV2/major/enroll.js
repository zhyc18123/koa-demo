define(['ux'],function(){

    var Util = pin.util;

    pin.reg("schoolV2/major/enroll",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
           this.initEvent();
        },
        initEvent:function(){
            var that = this;
            this.jq(".inline-select").each(function(){
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(){
                        return true;
                    }
                }).getView();
            });
        }
    }));

},'pipe/schoolV2/major/enroll.js');