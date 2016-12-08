define(['ui/ux',"common/verNav","page/head"],function(ux,verNav,headjs){

    var Util = pin.util;

    pin.on("pageEnd",function(){
        pin.cfg.isLogin = this.cfg.isLogin
        pin.debug = this.cfg.debug
        $("#login_link").click(function() {
            // ipinAuth.loginBox();
            return false;
        });
        $("#reg_link").click(function() {
            // ipinAuth.regBox();
            return false;
        });
    });

    var ept ={
        init:function(){
            headjs.init();
            $(".inline-select").each(function(){
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
    }
    return ept;
});