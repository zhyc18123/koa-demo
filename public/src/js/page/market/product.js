define(["jquery","pin","avalon",'page/head',"request",'common/scrollFixBar','common/getFlash',"widget/userUpgrade","common/common","ui/ui","ui/ux"],
    function($,pin,avalon,headjs,Req,scrollFixBar,getFlash,UserUpgrade) {

    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]}
    var isLogin = !!getCfg("isLogin");
    var isVip = !!isLogin&&getCfg("isVip");
    var couponInfo = getCfg("couponInfo");
    var clientmark = getCfg("clientmark");

    var card_type_int = getCfg("card_type_int");
    var originalPrice = getCfg("original_price").toFixed(2);//原价 
    var activity_price = getCfg("activity_price").toFixed(2);//当前价格
    var goods_id = getCfg("goods_id");

    
    var root = avalon.define({
        $id:"root",
        isLogin:isLogin,
        isVip:isVip,

        login:function(){
            location.hash="popbuy";
            root.popshow('paymentInfo',false);
            ipinAuth.loginBox(location.href);
            return false;
        },

        checkMobile:function(mobile){
            if(!mobile){
                alert('请输入您的手机号码');
                return false
            }else if(!(/^1\d{10}$/g).test(mobile)){
                alert('请输入11位手机号码');
                return false
            }else if (!/^1[7|3|4|5|8]\d{9}$/.test(mobile)) {
                alert('不是有效的手机号码，请检查');
                return false
            }

            return true;
        },

        getImageIdentifyCode:function(){
            if(root.orderInfo.verifyStat==1){
                return;
            }
            var mobile = root.orderInfo.nick_name;
            if(!root.checkMobile(mobile)){
                return;
            }

            var imgurl = "http://www.ipin.com/account/getImageIdentifyCode.do?phone="+mobile+"&_="+new Date()*1;
            $("#identifyCode").attr("src",imgurl);
            root.orderInfo.showIdentifyCode = true;
            root.orderInfo.identifyCode = '';
        },
        checkImageIdentifyCode:function(){
            if(root.orderInfo.verifyStat==1){
                return;
            }

            var identifyCode = root.orderInfo.identifyCode;
            if(!(/^[0-9a-z]{4}$/i).test(identifyCode)){
                return;
            }
            var mobile = root.orderInfo.nick_name;
            if(!root.checkMobile(mobile)){
                return;
            }

            root.orderInfo.verifyStat=1;
            Req.checkImageIdentifyCode({code:identifyCode,mobile:mobile,act:"reg"},function(r){
                if(r.getCode()==1024){//图形验证码验证通过，已发送手机验证码
                    root.orderInfo.showIdentifyCode = false;
                    root.orderInfo.verifyStat = 1;
                    var countDown=120;
                    root.regVerifyCodeCountDown = setInterval(function(){
                        countDown = countDown-1;
                        if(countDown<=0){
                            clearInterval(root.regVerifyCodeCountDown);
                            root.orderInfo.verifyStat=0;
                            $("#valicodeBtn").text('再次发送');
                        }else{
                            $("#valicodeBtn").text('再次发送('+countDown+')');
                        }

                    },1000);

                }else if(r.getCode()==1||r.getCode()==300010016){//验证码输入正确，短信发送失败
                    alert('短信发送失败,请重试');
                    root.orderInfo.verifyStat=0;
                    root.orderInfo.identifyCode = '';
                    root.getImageIdentifyCode();
                }else if(r.getCode()==4){//验证码输入错误
                    alert('图形验证码输入错误');
                    root.orderInfo.verifyStat=0;
                    root.orderInfo.identifyCode = '';
                    root.getImageIdentifyCode();
                }else{
                    alert(r.data.msg);
                    root.orderInfo.verifyStat=0;
                    root.orderInfo.identifyCode = '';
                    root.getImageIdentifyCode();
                }

            });

        },
        regVerifyCodeCountDown:null,
        checkRegVerifyCode:function(){
            var mobile = root.orderInfo.nick_name;
            var verify = root.orderInfo.verify;
            if(!root.orderInfo.identifyCode){//先输入图片验证码
                return;
            }
            if(verify.length<6){
                return;
            }
            if(!root.checkMobile(mobile)){
                return;
            }

            $("#field_valicode").prop("disabled",true);
            $("#field_nick_name").prop("disabled",true);
            Req.checkRegVerifyCode({mobile:mobile,clientmark:clientmark,verify:verify},function(resp){
                var data =resp.getData();
                if(data.code==1){
                    root.orderInfo.token = data.token;
                    root.orderInfo.verifyStat=1;
                    $("#field_valicode").prop("disabled",true);
                    $("#field_nick_name").prop("disabled",true);
                }else{
                    clearInterval(root.regVerifyCodeCountDown);
                    $("#valicodeBtn").text('再次发送');
                    root.orderInfo.verifyStat=0;
                    $("#field_valicode").prop("disabled",false).val('');
                    $("#field_nick_name").prop("disabled",false);
                    alert(data.msg);
                }

            });
        },

        sitebarPop:'',
        showSiberPop:function(poptarget,frag){
            root.sitebarPop = frag?poptarget:'';
        },

        stepIndex:1,
        bespokeStep:function(stepIndex){
            root.stepIndex = stepIndex;
        },
        featuresTab:0,
        showFeaturesTab:function(tabIndex){
            root.featuresTab = tabIndex;
        },

        productIntroNav:0,
        switchProductIntroNav:function(navIndex,e){
            root.productIntroNav = navIndex;
        },
        featrueIndex:0,
        showFeatrueImg:function(index,frag){
            if(index==12||index==10||index==9){
                return;
            }
            if(frag!==false){
                root.featrueIndex = index;
            }
            
        },
        showFeatrueImgNav:function(n){
            var index = root.featrueIndex+n;

            while(index==12||index==10||index==9){
                index = index+n;
            }
            


            index = Math.max(Math.min(13,index),0);
            root.featrueIndex = index;
        },
        functionIndex:0,
        showFunctionPic:function(index){
            root.functionIndex = index;
        },
        showmorebacks:false,
        showFeedbacks:function(){
            root.showmorebacks = true;
        },
        layerShow:{
            paymentInfo:false,
            paymentCode:false,
            paymentTip:false
        },
        layerMask:{
            get:function(){
                return this.functionIndex!=0 ||this.layerShow.paymentInfo||this.layerShow.paymentCode||this.layerShow.paymentTip;
            }
        },

        popshow:function(layerName,frag){
            for(var k in root.layerShow.$model){
                if(k==layerName){
                    if(frag==true&&layerName=='paymentInfo'){
                        if(root.isVip&&card_type_int!=2){
                            if(getCfg('cardPrivilege')==3){
                                UserUpgrade.show();
                            }else{
                                alert('您已经是完美志愿VIP，请勿重复开通');    
                            }
                            

                        }else{
                            root.clearOldOrderInfo(); 
                            root.layerShow[k]=frag;
                        }
                       
                    }else{
                        root.layerShow[k]=frag;
                    }
                }else{
                    if(frag==true){//close other pop
                        root.layerShow[k]=false;
                    }
                }

            }

            
        },

        orderInfo:{
            orderid:'',
            pid:'',
            qrCode:'',
            qrCodeTime:60,
            qrCodeCoutdownTimer:0,
            qrCodeStatTimer:0,
            username:'',
            nick_name:'',
            identifyCode:'',
            showIdentifyCode:false,
            verify:'',
            verifyStat:'',
            token:'',
            clientmark:'',
            payType:'wechat',
            goods_id:goods_id,
            activity_price:activity_price,
            rebatePrice:couponInfo?activity_price-couponInfo.coupon_price:activity_price,
            useDiscounted:couponInfo?true:false,
            discountCode:couponInfo?couponInfo.coupon_code:'',
            agent_name:couponInfo?couponInfo.agent_name:'',
            coupon_price:couponInfo?couponInfo.coupon_price:0
        },
        useDiscount:function(){
            root.getRebateCost();
        },
        setPayType:function(payType){
            root.orderInfo.payType = payType;
            root.getAlipayLink();

        },
        changeDiscount:function(){
            root.orderInfo.rebatePrice = root.orderInfo.activity_price;
            root.orderInfo.useDiscounted = false;
            root.orderInfo.coupon_price = 0;
            root.orderInfo.agent_name = '';


        },
        getRebateCost:function(){
            var params = {
                goods_id:root.orderInfo.goods_id,
                promo_code:root.orderInfo.discountCode,
            }

            Req.getRebateCost(params,function(resp){
                if(resp.data.code==200){
                    if(resp.data.data.code==0){
                        root.orderInfo.rebatePrice = resp.data.data.rebatePrice;
                        root.orderInfo.coupon_price = resp.data.data.coupon_price;
                        root.orderInfo.useDiscounted =  !!root.orderInfo.discountCode;
                        root.orderInfo.agent_name = resp.data.data.agent_name;
                        root.getAlipayLink();
                    }else{
                        alert('无效的优惠码');
                    }
                    
                }else{
                    alert('查询优惠码失败')
                }
            });
        },

        order:function(e){
            if(root.isVip&&card_type_int!=2){
                alert('您已经是完美志愿VIP，请勿重复开通');
                pin.cancelAll(e);
                return;
            }

            if(!isLogin){
                if(!root.orderInfo.nick_name){
                    alert('请输入手机号码');
                    pin.cancelAll(e);
                    return;
                }else if(!root.orderInfo.token){
                    alert('请获取并校验手机验证码');
                    pin.cancelAll(e);
                    return;
                }
            }

            if(root.orderInfo.qrCodeCoutdownTimer>0){
                pin.cancelAll(e);
                return;
            }

            var orderInfo = root.orderInfo.$model;
            var resolveDiscountCode = (orderInfo.discountCode&&orderInfo.useDiscounted)||!(orderInfo.discountCode||orderInfo.useDiscounted);
            if(orderInfo.payType&&resolveDiscountCode){
                if(root.orderInfo.payType=='wechat'){
                    root.getWxPayLink();
                    pin.cancelAll(e);
                }else{
                    root.clearOldOrderInfo();
                    root.countDown();
                    root.popshow('paymentTip',true);
                }
             }else{
                if(orderInfo.discountCode&&!orderInfo.useDiscounted){
                    alert('请使用填写的优惠码');
                }
                pin.cancelAll(e);
             }
        },
        clearOldOrderInfo:function(){
            clearInterval(root.orderInfo.qrCodeCoutdownTimer);
            clearInterval(root.orderInfo.qrCodeStatTimer);

            root.orderInfo.qrCodeCoutdownTimer = 0;
            root.orderInfo.qrCodeStatTimer = 0;
            root.orderInfo.orderid = '';
            root.orderInfo.pid = '';
            root.orderInfo.qrCode = '';

        },
        getWxPayLink:function(){
            root.clearOldOrderInfo();
            Req.getWxPayLink({
                promo_code:root.orderInfo.discountCode,
                goods_id:root.orderInfo.goods_id,
                user_name:root.orderInfo.username
            },function(resp){
                if(resp.data.code==200){
                    root.orderInfo.orderid = resp.data.orderid;
                    root.orderInfo.pid = resp.data.pid;
                    root.getWXPayQrCode();
                }else{
                    if(resp.data.code=="11106"){
                        alert('您已经是完美志愿VIP，请勿重复开通');
                    }else{
                        alert('订单生成失败:'+resp.data.code);
                    }
                }
            });
        },
        getWXPayQrCode:function(){
            root.orderInfo.qrCode = '/buy/getWXPayQrCode?pid='+root.orderInfo.pid;
            root.popshow('paymentCode',true);
            root.countDown();
        },
        countDown:function(){
            var ms = 60;
            root.orderInfo.qrCodeCoutdownTimer = setInterval(function(){
                ms = ms-1;
                root.orderInfo.qrCodeTime = ms;
                if(ms==0){
                    clearInterval(root.orderInfo.qrCodeCoutdownTimer);
                    root.orderInfo.qrCodeCoutdownTimer = 0;
                }
            },1000);

            if(root.orderInfo.payType=='wechat'){
                var checkTime = 5000;
                root.orderInfo.qrCodeStatTimer = setInterval(function(){
                    root.queryWXPayStatus();
                },checkTime);
            }

            
        },
        xhr:null,
        queryWXPayStatus:function(){
            if(root.orderInfo.qrCodeTime==0){
                return;
            }
            xhr = root.xhr;
            var params = {
                order_id:root.orderInfo.orderid,
                pay_type:root.orderInfo.payType=='wechat'?'wechat':'alipay',
                user_name:root.orderInfo.username,
                user_pay:root.orderInfo.rebatePrice,
                promo_code:root.orderInfo.discountCode
            }
            xhr&&xhr.abort();
            root.xhr = Req.queryWXPayStatus(params,function(resp){
                if(root.orderInfo.qrCodeTime==0){
                    clearInterval(root.orderInfo.qrCodeStatTimer);
                    root.orderInfo.qrCodeStatTimer = 0;
                }
                if(resp.data.code==200){
                    clearInterval(root.orderInfo.qrCodeStatTimer);
                    //root.popshow('paymentTip',true);
                    window.location.href="/buy/success?pay_type="+params.pay_type+'&trade_status=TRADE_SUCCESS'
                }
            });
            
            
        },

        expertIndex:1,
        hoverExpert:function(expertIndex){
            root.expertIndex = expertIndex;
        },
        getAlipayLink:function(){
            var username = root.orderInfo.username||'nick';
            var href = '/buy/getAlipayLink?goods_id='+root.orderInfo.goods_id+'&promo_code='+root.orderInfo.discountCode+'&user_name='+username;

            $("#orderBtn a").attr("href",href);
        },
        expertIndex:1,
        hoverExpert:function(expertIndex){
            root.expertIndex = expertIndex;
        },
        isTabClick:false,
        introAnchor:function(e){
            var id = $(this).attr("href").substring(1,this.length);
            var top = $('#'+id).offset().top;
            root.isTabClick = false;

            $('html,body').animate({
                scrollTop: top - (id=="intro"? 0 :$('#introNav').outerHeight())},
                200, function() {
                    root.isTabClick = false;
            });
            e.preventDefault();
        },  
        $title: $('#introNav a'),
        scrollChangeTab:function($title){
            var offsetList = [];
            $title.each(function() {
                var id = $(this).attr("href").substring(1,this.length);
                var top = $('#'+id).offset().top - (id=="intro"? 0:$('#introNav').outerHeight());
                offsetList.push(top);
            });
            root.autoActive(offsetList);

            var poll = null;
            $(window).scroll(function(){ 
                clearTimeout(poll);
                poll = setTimeout(function(){
                    if(!root.isTabClick) {
                        root.autoActive(offsetList, $title);
                    } 
                }, 100)
            })
        },

        autoActive:function(offsetList){
            var that = this;
            var scrollTop = $('body').scrollTop() ? $('body').scrollTop():$('html').scrollTop();

            for(var i = 1, len = offsetList.length; i < len;++i){
                if(scrollTop < offsetList[i]){
                    root.switchProductIntroNav(i-1)
                    break;
                }
                else if(scrollTop > offsetList[len-1]){
                    root.switchProductIntroNav(len-1)
                    break;
                }
            }
        },

        play:function(src,e){
            
            // var img = this.parentNode.getElementsByTagName("img")[0];

            if(!$('.zm-mask').length){
                $('body').css('position','relative').append($('<div ms-click="hideVideo" class="zm-mask" style="position:fixed;left:0;top:0;width:100%;height:100%;z-index:10000;background:rgba(0,0,0,.5)"><i ms-click="hideVideo" class="zm-closeBtn" style="position:absolute;font-size:45px;right:100px;top:100px;border-radius:50%;border:1px solid #aaa;width:50px;width:50px;text-align:center;line-height:48px;cursor:pointer;color:#aaa;z-index:1000">X</i><div class="container" style="position:absolute;left:0;right:0;top:0;bottom:0;margin:auto;"></div></div>'))

                avalon.scan(document.body,[root]);
            }
            else{
                $('.zm-mask').show();
            }
            var height = Math.max(400,$(window).innerHeight()-400);
            var width = height*1.6;
            var $container = $('.zm-mask').children('.container');

            $container.css({
                width:width+'px',
                height:height+'px'
            });

            getFlash($container,{
                src:src,
                width:width,
                height:height
            },{},{allowFullScreen:true});

            pin.cancelAll(event);
        },
        hideVideo:function(){
            var $mask =  $('.zm-mask');
            var $container = $mask.children('.container');
            $mask.hide();
            if(!!$container.length)
                $container.empty();
        },
    });


    root.orderInfo.$watch("username",function(){
        root.getAlipayLink();
    });
    root.orderInfo.$watch("discountCode",function(){
        root.getAlipayLink();
    });

    avalon.scan(document.body);

    function initEvents(){
        if(location.hash=="#popbuy"){
            root.popshow('paymentInfo',true);
            location.hash = '';
        }
        root.scrollChangeTab(root.$title);

        if(location.hash=="#comments"||location.hash=="#uservideo"){
            $(window).scrollTop($(window).scrollTop()-$("#introNav").height());
        }
    }
    


    return {
        init:function(){
            headjs.init();
            initEvents();


             //由于设置[ms-controller]{display: none!important;},需要在avalon.scan之后执行dom操作
            var aCss = {
                'position':'absolute',
                'top':'0px'
            }
            scrollFixBar($('#introNav'),aCss)
        }
    }

});