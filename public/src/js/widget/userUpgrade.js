define(['jquery','pin','request'],function($,pin,Req){
	var PageData = $.extend({},window.PageData);
	var getCfg = function(name){ return PageData[name]}
	
	var uid = getCfg("uid");
	var nick_name = getCfg("nick_name");
    var isVip = getCfg("isVip");
    var isLogin = getCfg("isLogin");
	var cardPrivilege = getCfg("cardPrivilege")>>0;

    /*
    //test
    isVip = true;
    isLogin = true;
    cardPrivilege = 3;
    */

	//test
	var goods_id = '';
	var original_price = 0; //原价 
	var activity_price = 0; //当前价格
	var couponInfo = null;/*{
		coupon_price:400,
		agent_name:'',
		coupon_code:'a123'
	};*/

	var UpdateUI = {
		sheet:$(".js-upgrade-sheet"),
		init:function(){
			this.render();
			this.domEvents();

		},
		render:function(){
			var self = this;
			var sheet = this.sheet;
			sheet.find(".js-uname").text(nick_name);
			sheet.find(".js-price").text('￥'+activity_price||'?');
			sheet.find(".js-originalPrice").text('原价 ￥'+original_price||'?');

		},
		domEvents:function(){
			var self = this;
			var sheet = this.sheet;
			sheet.find(".js-uname").text(nick_name);

			sheet.on("click",".radio-box",function(e){
				$(this).addClass("active").siblings(".radio-box").removeClass("active");
				UpdateUI.setPayType($(this).data("type"));
			}).on("click",".pro-buy-btn a",function(e){
				return UpdateUI.order(e);
			});

			$(".js-upgrade-paymentCode,.js-upgrade-paymentTip").on("click",".js-order-retry",function(e){
                $(".js-upgrade-paymentTip").addClass("hide");
                $(".js-upgrade-sheet").removeClass("hide");
				//UpdateUI.order(e); //主要用于支付宝，让用户购买链接
			});

            $(".js-upgrade-paymentCode").on("click",".pop-close",function(e){
                UpdateUI.clearOldOrderInfo();
                $(this).closest(".popup").addClass("hide");
                $("#layer-mask").addClass("hide");
                return false;
            });


		},
		setPayType:function(payType){
            UpdateUI.orderInfo.payType = payType;
            UpdateUI.getAlipayLink();
        },
		orderInfo:{
			orderid:'',
            pid:'',
            qrCode:'',
            qrCodeTime:60,
            qrCodeCoutdownTimer:0,
            qrCodeStatTimer:0,
            username:nick_name,
            nick_name:nick_name,
            payType:'wechat',
            goods_id:goods_id,
            activity_price:activity_price,
            rebatePrice:couponInfo?activity_price-couponInfo.coupon_price:activity_price,
            useDiscounted:couponInfo?true:false,
            discountCode:couponInfo?couponInfo.coupon_code:'',
            agent_name:couponInfo?couponInfo.agent_name:'',
            coupon_price:couponInfo?couponInfo.coupon_price:0

		},
		getPrice:function(fn){
			var self = this;
			if(goods_id&&activity_price){
				fn&&fn();
			}else{
				Req.getGoods({goods_type:"vipupgrade"},function(resp){
					if(resp.isOk()){
						var goodsInfo = resp.data.data;
						goods_id = goodsInfo.goods_id;
						original_price = goodsInfo.original_price.toFixed(2);
						activity_price = goodsInfo.activity_price.toFixed(2);
						self.orderInfo.goods_id = goods_id;
						self.orderInfo.activity_price = activity_price;
						self.orderInfo.activity_price = activity_price;
						self.render();
						fn&&fn();
					}
				});
			}
			
		},
		order:function(e){
            var sheet = this.sheet;
			if(!isLogin){
                alert('请先登录',function(){
                	ipinAuth.loginBox(location.href);
                });
                e.preventDefault();
                return false;
            }else if(cardPrivilege>0&&cardPrivilege<3){
                alert('您已经是完美志愿黄金VIP，请勿重复开通');
                e.preventDefault();
                return false;
            }else if(UpdateUI.orderInfo.qrCodeCoutdownTimer>0){
                e.preventDefault();
                return false;
            }

            sheet.find(".spinner").removeClass("hide");
            var orderInfo = UpdateUI.orderInfo;
            var resolveDiscountCode = (orderInfo.discountCode&&orderInfo.useDiscounted)||!(orderInfo.discountCode||orderInfo.useDiscounted);
            if(orderInfo.payType&&resolveDiscountCode){
                if(UpdateUI.orderInfo.payType=='wechat'){
                    console.log("UpdateUI.getWxPayLink")
                    UpdateUI.getUpgradeWxPayLink();
                    e.preventDefault();
                    return false;
                }else{
                    UpdateUI.clearOldOrderInfo();
                    UpdateUI.countDown();
                    UpdateUI.popshow('paymentTip',true);
                }
             }else{
                if(orderInfo.discountCode&&!orderInfo.useDiscounted){
                    alert('请使用填写的优惠码');
                }
                e.preventDefault();
                return false;
             }

        },
		clearOldOrderInfo:function(){
            clearInterval(UpdateUI.orderInfo.qrCodeCoutdownTimer);
            clearInterval(UpdateUI.orderInfo.qrCodeStatTimer);

            UpdateUI.orderInfo.qrCodeCoutdownTimer = 0;
            UpdateUI.orderInfo.qrCodeStatTimer = 0;
            UpdateUI.orderInfo.orderid = '';
            UpdateUI.orderInfo.pid = '';
            UpdateUI.orderInfo.qrCode = '';

            UpdateUI.sheet.find(".pro-buy-btn .spinner").addClass("hide");

        },
		getUpgradeWxPayLink:function(){
            UpdateUI.clearOldOrderInfo();
            Req.getUpgradeWxPayLink({
                promo_code:UpdateUI.orderInfo.discountCode,
                goods_id:UpdateUI.orderInfo.goods_id,
                user_name:UpdateUI.orderInfo.username
            },function(resp){
                if(resp.data.code==200){
                    UpdateUI.orderInfo.orderid = resp.data.orderid;
                    UpdateUI.orderInfo.pid = resp.data.pid;
                    UpdateUI.getWXPayQrCode();
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
            UpdateUI.orderInfo.qrCode = '/buy/getWXPayQrCode?pid='+UpdateUI.orderInfo.pid;
            UpdateUI.countDown();
            UpdateUI.renderPaymentCode('ready');
        },
        countDown:function(){
        	var self = this;
            var ms = 60;

            //开始倒计时
            UpdateUI.orderInfo.qrCodeCoutdownTimer = setInterval(function(){
                ms = ms-1;
                UpdateUI.orderInfo.qrCodeTime = ms;
                if(UpdateUI.orderInfo.payType=='wechat'){
                   UpdateUI.renderPaymentCode('update');
                }
                if(ms==0){
                    clearInterval(UpdateUI.orderInfo.qrCodeCoutdownTimer);
                    UpdateUI.orderInfo.qrCodeCoutdownTimer = 0;
                    UpdateUI.sheet.find(".pro-buy-btn .spinner").addClass("hide");
                }
            },1000);

            //开始轮询付款状态
            if(UpdateUI.orderInfo.payType=='wechat'){
                var checkTime = 5000;
                UpdateUI.orderInfo.qrCodeStatTimer = setInterval(function(){
                    UpdateUI.queryWXPayStatus();
                },checkTime);
            }
        },
        xhr:null,
        queryWXPayStatus:function(){
            if(UpdateUI.orderInfo.qrCodeTime==0){
                return;
            }
            xhr = UpdateUI.xhr;
            var params = {
                order_id:UpdateUI.orderInfo.orderid,
                pay_type:UpdateUI.orderInfo.payType=='wechat'?'wechat':'alipay',
                user_name:UpdateUI.orderInfo.username,
                user_pay:UpdateUI.orderInfo.rebatePrice,
                promo_code:UpdateUI.orderInfo.discountCode
            }
            xhr&&xhr.abort();
            UpdateUI.xhr = Req.queryWXPayStatus(params,function(resp){
                if(UpdateUI.orderInfo.qrCodeTime==0){
                    clearInterval(UpdateUI.orderInfo.qrCodeStatTimer);
                    UpdateUI.orderInfo.qrCodeStatTimer = 0;
                }
                if(resp.data.code==200){
                    clearInterval(UpdateUI.orderInfo.qrCodeStatTimer);
                    window.location.href="/buy/success?pay_type="+params.pay_type+'&trade_status=TRADE_SUCCESS'
                }
            });
            
            
        },

        getAlipayLink:function(){
        	var sheet = this.sheet;
            var username = UpdateUI.orderInfo.username||'nick';
            var href = '/buy/getUpgradeAlipayLink?goods_id='+UpdateUI.orderInfo.goods_id+'&promo_code='+UpdateUI.orderInfo.discountCode+'&user_name='+username;

            sheet.find(".pro-buy-btn a").attr("href",href);
        },
        renderPaymentCode:function(status){
        	status = status||'update';
        	var pop = $(".js-upgrade-paymentCode");
        	
        	if(status=='ready'){
        		pop.find(".js-payment-cost").text('支付'+this.orderInfo.activity_price+'元');
        		pop.find(".qrcode_box img").attr("src",this.orderInfo.qrCode);
        	}else if(status=='update'){
        		pop.find(".wxpay-time span").text(UpdateUI.orderInfo.qrCodeTime);
        		if(this.orderInfo.qrCodeTime>0){
	    			pop.find(".qrcode-pop").addClass("hide");
	    			pop.find(".wxpay-time").css({
	    				"visibility":"visible"
	    			});
	    		}else{
	    			pop.find(".qrcode-pop").removeClass("hide");
	    			pop.find(".wxpay-time").css({
	    				"visibility":"hidden"
	    			});
	    		}
        	}

    		UpdateUI.popshow('paymentCode',true);
        	
        },
        popshow:function(k,frag){
        	var pop;
        	switch(k){
        		case 'paymentTip':
        			pop = $(".js-upgrade-paymentTip");
        			break;
        		case 'paymentCode':
        			pop = $(".js-upgrade-paymentCode");
        			break;
        	}


        	if(frag){
        		$(".pop-buy").addClass("hide");
        		pop.removeClass("hide");
        	}else{
        		pop.addClass("hide");
        	}
        

        }

	};

	UpdateUI.init();


	var ept = {
        hard:true,
		json:getCfg("json"),
		init:function(){
			this.domEvents();

			return this;
		},
		domEvents:function(){
			var self = this;
			$(".pop-character-btn a").on("click",function(){
				self.hideTip();
				self.show();
			});

            $(".pop-character .pop-close").on("click",function(){
                if(self.updateHard()){
                    location.href="/";
                }
            });
		},
        updateHard:function(){
            if(location.pathname=="/zhiyuan/bespoke"||location.pathname=="/forecast"){
                return true;
            }else{
                return false;
            }
        },
		hideTip:function(){
			$("#layer-mask").addClass("hide");
			$(".pop-character").addClass("hide");
		},
		tip:function(txt){
			txt = txt||'即可使用该功能';
			var pop = $(".pop-character");
			$("#layer-mask").removeClass("hide");
			pop.find(".js-tip").text(txt);
			pop.removeClass("hide");
		},
		show:function(option){
            option = option||{};
            if(option.hard!=undefined){
                this.hard = !!option.hard;
            }
            var self = this;
			UpdateUI.getPrice(function(){
				$("#layer-mask").removeClass("hide");
				$(".pop-buy-gold").removeClass("hide");
                $(".js-upgrade-sheet .pop-close").on("click",function(){
                    if(self.updateHard()){
                        location.href="/";
                    }
                    
                });
			});
		},
		hide:function(){
			$("#layer-mask").addClass("hide");
			$(".pop-buy-gold").addClass("hide");
		},
        refuse:function(){

        }


	}



	return ept.init();
});