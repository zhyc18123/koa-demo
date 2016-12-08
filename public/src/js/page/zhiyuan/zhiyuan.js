define([
    "jquery","pin","avalon","ui/ui","ui/ux",
    'page/head',
    "page/zhiyuan/zhiyuan/selectArea",
    "widget/page",
    'common/fixBottom',
    "common/common"
    ],
    function($,pin,avalon,ui,ux,headjs,selectArea,Page,Vdialog) {
    
    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]} 
    
    var Req = pin.request;
    var isLogin = getCfg("isLogin");
    var isVip = isLogin&&getCfg("isVip");
    var myscore = getCfg("myscore");

    if(myscore.prov=='15'){
        alert("因为内蒙古的志愿填报方式较特殊，暂不支持模拟填报。您可以查询感兴趣的学校和专业。",function(){
            history.go(-1);
        });
        //return;
    }

    
    var root = avalon.define({
        $id:"root",
        iszhuanke:false,
        showGuide:false,
        guideStep:1,
        guideClick:function(e) {
            if(root.guideStep<3){
                root.guideStep+=1;
            } else {
                root.showGuide = false;
            }
            pin.cancelAll(e);
        }
    });

    root.$watch('showGuide',function(v) {
        if(v){
            avalon.nextTick(function() {
                $('html,body').prop('scrollTop',0);
            });
            $('html').css('overflowY','hidden');
        } else {
            $('html').css('overflowY','scroll');
        }
    });
    avalon.scan(document.body);

    pin.on('guide',function() {
        root.showGuide = true;
    });


    return {
        json:PageData,
        init:function(){
            headjs.init();
            selectArea.init();
            
            $("#gotoFill").click(function(){
                if(!isLogin){
                    ipinAuth.loginBox('/fill');  
                    return false;
                }
                if(this.json.colleSchCount <5 && isLogin){
                    alert("收藏学校有点少喔，至少收藏5个学校吧");
                    return false;
                }
            });
            window.fixBottom();
            $(document.body).on("click", function(e) {
                console.log("clickBody>>>",1111)
                pin.fire("clickBody",e);
            });

        }
    }
});
