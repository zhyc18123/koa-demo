define(['ux',"mod/verNav.js"],function(){

    var Util = pin.util;

    pin.reg("schoolV2/school/schoolRanking",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
            var that = this;
            this.initEvent();
        },
        initEvent:function(){
            var that= this;
            this.jq(".inline-select").each(function(){
                var k = $(this).attr('id');
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(v){}
                }).getView();
            });
            var allTr = $(".ranking-table tbody tr")
            allTr.mouseover(function(){
                allTr.removeClass("hover");
                $(this).addClass('hover');
            })
            allTr.eq(0).addClass('hover');
        }
    }));

},'pipe/schoolV2/school/schoolRanking.js')