define([
        'jquery','pin',
        'page/schoolV2/schoolMain', 
        'page/schoolV2/school/schMajorInfo', 
        'page/schoolV2/base',
        'page/schoolV2/stats',
        'page/head'
    ],function($,pin,schoolMain,schMajorInfo,base,stats,headjs) {

    //console.log(schoolMain);
    
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    
    var isLogin = PageData.isLogin;

    var ept =  {
        json:PageData,
        jq:$,
        init:function() {
            schoolMain.init();
            schMajorInfo.init();
            base.init();
            stats.init();
            headjs.init();
            this.initEvent();
        },
        initEvent:function (){
            $("#login_link").click(function() {
                // ipinAuth.loginBox();
                return false;
            });
            $("#reg_link").click(function() {
                // ipinAuth.regBox();
                return false;
            });



            //check login todo : remove 
            $(document.body).click(function(e){
                var target = e.target;
                var needloginEl = $(target).closest('[needlogin]')
                if(needloginEl.length&&!isLogin){
                    var obj = {};
                    if(needloginEl.attr("t")){
                        obj.t = needloginEl.attr("t");
                    }
                    this.needLogin(obj);
                }
            });

        },
        needLogin:function(e){
            var url = "";
            switch(e.t){
                case 'zhiyuan':
                    url = "/zhiyuan";
            }
            ipinAuth.regBox(url);
        }
    }


    return ept; 
});
