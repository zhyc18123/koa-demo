define(['ui/ux',"common/verNav","page/head"],function(ux,varNav,headjs) {

    var Util = pin.util;
    var ept = {
        init:function() {
        headjs.init();
        varNav.init();
        $(".inline-select").each(function(){
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
        }
    }  
    return ept;  
});
