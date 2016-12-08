define(["jquery","pin","request","widget/userUpgrade","common/gapageview","ui/ui"],function($,pin,Req,UserUpgrade,Gapageview) {//fixed: by linhuabiao date:2016.6.8
	var cardPrivilege = pin.getCfg("cardPrivilege")>>0;
	var isLogin = !!pin.getCfg("isLogin");
	var isVip = !!pin.getCfg("isVip");

	if(!window.console){
		//某些低端IE8在未唤出调试器时console不存在
		window.console = {
			log:function(){}
		}
	}

	window.alert = function(msg,fn){
		pin.ui.MsgBox.alert('',msg,fn||function(){});
	}


	//global events
	$(document.body).on("click",".js-login-link",function(e){
		$("#login_link").trigger("click");

		e.preventDefault();
		return false;

	}).on("click",".js-reg-link",function(e){
		$("#reg_link").trigger("click");

		e.preventDefault();
		return false;

	}).on("click",".return-top",function(e){
		$('html,body').animate({scrollTop: '0px'}, 500);
		e.preventDefault();
		return false;
		
	}).on("click",".js-promote",function(e){
		var requirePrivilege = $(this).data("privi")>>0||1;
		if(cardPrivilege&&(cardPrivilege==requirePrivilege||cardPrivilege<3)){
			return true;
		}else{
			var txt = $(this).data("txt");
			if(!cardPrivilege){
				txt = txt||"即可使用该功能";
				txt ='开通VIP会员'+txt;
				alert(txt,function(){
					location.href="/buy/product";
				});
				
			}else{
				txt = txt||"即可使用该功能";
				UserUpgrade.tip(txt);
			}

			e.preventDefault();
			return false;
		}
	}).on("click",".js-showupgrade",function(e){
		var hard = $(this).data("hard");
		UserUpgrade.show({hard:hard});

		e.preventDefault();
		return false;
	}).on("click",".pop-close",function(e){
		$(this).closest(".popup").addClass("hide");
		$("#layer-mask").addClass("hide");
		e.preventDefault();
		return false;
	});




	function activateVIP(){
        var $btn =  $('.btn-activate-vip')
        var $activate =  $('.pop.activate-card')
        var $protocol =  $('.pop.protocol-confirm')
        if(!$("#pop_overlay").length){
            var $overlay=  $('<div id=pop_overlay></div>')
            $activate.after($overlay)
        }

        $btn.on('click', function (e) {
            e.preventDefault()
            if (pin.cfg.isLogin){
            	$(".activate-card h4").text("激活VIP");
            	$(".activate-card .btn-info").val("激活VIP卡");
            	$(".activate-card").find("input[name='login_type']").val('');
                $activate.add($overlay).show()
            } else{
                ipinAuth.loginBox();
            }
        });

        $activate.find('.close').on('click', function (e) {
            e.preventDefault()
            $activate.add($overlay).hide()
        });

        var $form = $activate.find('form');
        $form.on('submit', function (e) {
            e.preventDefault();
            var actionType = $(".activate-card").find("input[name='login_type']").val();
            if(actionType){
            	//VIP卡登录
            	return;
            }


            var params = {
                card_no: $form[0].card_no.value,
                card_pwd: $form[0].card_pwd.value
            }
            if(!params.card_no){
                alert("请输入完美志愿卡号");
                return;
            }else if(!params.card_pwd){
                alert("请输入完美志愿卡密码");
                return;
            }

            Req.bind_card(params, function (fb) {
                var data = fb.data
                if (data.code == 200) {
                    alert('激活成功')
                    location.href = '/zhiyuan';
                } else {
                    alert(data.data.msg||"卡号或密码错误，请重新输入");
                }
            })
        })
    }

    activateVIP();




	function vipCardLogin(){
        var $btn =  $('#login_vipcard_link')
        var $activate =  $('.pop.activate-card')
        var $protocol =  $('.pop.protocol-confirm')
        var $overlay = $("#pop_overlay")
        if(!$overlay.length){
            $overlay=  $('<div id=pop_overlay></div>')
            $activate.after($overlay);
 			$overlay.show();
        }

        $btn.on('click', function (e) {
            e.preventDefault()
            if (!pin.cfg.isLogin){
            	$(".activate-card h4").text("卡号登录");
            	$(".activate-card .btn-info").val("登录");
                $activate.add($overlay).show()
            }

        })
        $activate.find('.close').on('click', function (e) {
            e.preventDefault()
            $activate.add($overlay).hide()
        })

        var $form = $activate.find('form');
        $form.on('submit', function (e) {
            e.preventDefault();
            var actionType = $(".activate-card").find("input[name='login_type']").val();
            if(!actionType){
            	return;
            }

            var params = {
                card_no: $form[0].card_no.value,
                card_pwd: $form[0].card_pwd.value,
                login_type:$form[0].login_type.value,
            }
            if(!params.card_no){
                alert("请输入完美志愿卡号");
                return;
            }else if(!params.card_pwd){
                alert("请输入完美志愿卡密码");
                return;
            }



            Req.ajaxLogin(params, function (fb) {
                var data = fb.data
                if (data.code == 200) {
                    location.reload();
                } else {
                	if(params.login_type=='card'){
                		alert(data.data.msg||"卡号或密码错误，请重新输入");
                	}else{
                		alert(data.data.msg||"账号或密码错误，请重新输入");
                	}
                    
                }
            })
        })
    }

    vipCardLogin();




	function sendMsg(conctent){
		var xhr;
		if(window.XMLHttpRequest){
			xhr = new XMLHttpRequest();
		}else if(window.ActiveXObject){
			try{
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			}catch(err){
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}

		xhr.open('POST','/collecterror',true);
       	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;");
		xhr.send('msg='+conctent);
	}

	window.onerror = function(a,b,c,d,e){
		if(window._webConf_debug){
			return false;
		}else{
			return true;//do not send email
		}

		try{
			var platform = '[platform]'+navigator.platform;
			var ua = '[userAgent]'+navigator.userAgent;
			var cookieEnabled = '[cookieEnabled]'+navigator.cookieEnabled;
			var docMode = '[documentMode]'+document.documentMode;
			var compatMode = '[compatMode]'+document.compatMode;
			var msg = '[errMsg]'+a;
			var page = '[page]'+window.location.href;
			var file = '[file]'+b;
			var codePos = '[codePos]row:'+c+',col:'+d;
			var stack = '[stack]';

			if(e.stack){
				stack+=e.stack;
			}else if (!e.stack && window.opera) {
	            stack+= (String(e).match(/of linked script \S+/g) || []).join("\r\n");
	        }else{
	        	stack+=e;
	        }
				
			var errorLog = [platform,ua,cookieEnabled,docMode,compatMode,msg,page,file,codePos,stack].join('\r\n');
			sendMsg(errorLog);
		}catch(err){
			console.log(err)
		}
		

		return false;
	}

	if(!window._webConf_debug){
		setTimeout(function(){
			console.log("");
			console.log("");
			console.log("%ciPIN 让决策更智能","text-shadow:2px 2px 2px #666;color:#00aff0;font-size:48px;font-weight:bold;");
			console.log("%c旗下项目：","text-shadow:2px 2px 2px #666;color:#00aff0;font-size:40px;font-weight:bold;");
			console.log("%chttp://www.ipin.com","color:#00aff0;font-size:20px;font-weight:bold;");
			console.log("%chttp://www.wmzy.com","color:red;font-size:20px;font-weight:bold;");
			console.log("%chttp://www.lopan.com","color:green;font-size:20px;font-weight:bold;");
			console.log("%chttp://www.haohr.com","color:rgba(42, 125, 245, 0.86);font-size:20px;font-weight:bold;");
			console.log("%c加入iPIN，踏上大数据的浪峰!","text-shadow:2px 2px 2px #yellow;color:rgba(224, 67, 10, 0.86);font-size:24px;font-weight:bold");
			console.log("%c欢迎优秀的前端工程师加入我们，请将简历发送至 hr@ipin.com, 注明来自console","color:#333;font-size:24px;font-weight:bold");
			console.log("%c职位介绍：http://www.ipin.com/join.html#joinus","color:#333;font-size:18px;")
			console.log("")
		},10000);
	}

	return {
		
	}

});