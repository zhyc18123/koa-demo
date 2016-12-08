define(["jquery","pin",'ui/ui',"ui/ejs","ui/tpl"],function($,pin,ui,Tpl){


    var P = pin;
    var Util = P.util;
    var Req = P.request;
    var doc = document.body;
    var msgBox = ui.MsgBox;

    
    
    
    P.reg("regSuccess",Util.create(P.getCls("Layer"),{
        view : 'regBox',
        contentHtml:"regSuccess",
        cs:"win-tips win-success",
        destroy:true,
        appendTo:doc,
        onclose:function(){
            location.reload(1);
        }
    }));

    P.reg("Reg",Util.create(P.getCls("Layer"),{
        view : 'regBox',
        destroy:true,
        contentHtml:"reg",
        //cs:"win-reg",
        appendTo:doc,
        sendAuth:false,
        authtype:"reg",
        startTime:function(){
            var that = this;
            if(that.time<1){
                that.sendAuth = false;
                that.jq("#getAuthCode").removeClass('disable').html('获取验证码')
            } else{
                that.jq("#getAuthCode span").text(that.time);
                setTimeout(function(){
                    that.time--;
                    that.startTime();
                },1000);
            }
        },
        initEvent:function(){
            var that = this;
            var hasPlaceholder = ("placeholder" in document.createElement("input"));
            if(!hasPlaceholder){
                that.jq(".row .ietip").removeClass("hide");

            }

            this.jq(".ag-ch").on("click",function(e){
                if(that.jq(this).hasClass("active")){
                    that.jq(this).removeClass("active");
                    that.jq("#agreeTxt").prop("checked",false);
                }else{
                    that.jq(this).addClass("active");
                    that.jq("#agreeTxt").prop("checked",true);
                }
            });
            this.jq("input").focus(function(){
                 that.clearErr();
                 if(this.value.length){
                    that.jq(this).closest(".ietip").addClass("hide");
                 }
            }).on("blur",function(e){
                if(this.value.length==0&&!hasPlaceholder){
                    that.jq(this).closest(".ietip").removeClass("hide");
                }

            }).on("change",function(){
                if($.trim(this.value).length>0){
                    that.jq(this).closest(".input").addClass("active");
                }else{
                    that.jq(this).closest(".input").removeClass("active");
                }
            });
            this.jq("#login").click(function(){
                that.jq().remove();
                that.afterHide();
                pin.use("loginBox").display(1);
            });
            this.jq("#getAuthCode").click(function(){
                if(!that.sendAuth){
                    var rv = that.getServerAuthCode(function(){
                        that.setCountDown(120);
                    });
                }
                return false;
            });
            this.jq(".btn-reg").click(function(){
                that.send();
                return false;
            });       
        },
        clearErr:function(){
            var that = this;
            that.jq(".err-inner").cssDisplay(0);
            that.jq(".row .input").removeClass("inp-tip");
        },
        showErr:function(txt,field){
            this.jq(".err-inner").cssDisplay(1).find("span").html(txt);
            if(field){
                this.jq(field).closest(".input").addClass("inp-tip");
            }
        },
        getMobile:function(){
            var mobile = this.jq("#mobile").val();
            var that = this;
            if(!mobile){
                that.showErr('请输入您的手机号',this.jq("#mobile"));
                return false
            }
            if (!/^1[7|3|4|5|8]\d{9}$/.test(mobile)) {
                that.showErr('不是有效的手机号，请检查',this.jq("#mobile"));
                return false
            } else {
                return mobile;
            }
        },
        getPwd:function(){
            var that = this;
            var pwd = this.jq("#password").val();
            if(!pwd){
                that.showErr('请输入密码',this.jq("#password"));
                return false
            }
            if (!/^.{6,16}$/.test(pwd)) {
                that.showErr('密码长度需在6~16位之间',this.jq("#password"));
                return false;
            } else {
                return pwd;
            }
        },
        
        showIdentifyCodeUI:function(mobile){
            var identify = P.use("Identify");
            identify.cacheData('mobile',mobile);
            identify.cacheData('hostUI',this);
            identify.display(1);
            identify = null;
        },
        reSendAuthCode:function(){
            var that = this;
            that.clearErr();
            that.jq("#verify").focus();
            that.sendAuth=false;
            that.jq("#getAuthCode").trigger("click");
        },
        declareAuthCode:function(){
            var that = this;
            that.clearErr();
            that.jq("#verify").focus();
            that.sendAuth=true;
            that.setCountDown(120);
        },
        getAuthCode:function(){
            var that = this;
            var verify = this.jq("#verify").val();
            if (!verify) {
                that.showErr('请输入短信验证码',this.jq("#verify"));
                return false
            } else {
                return verify;
            }
        },
        setCountDown:function(time){
            var that = this;
            that.time=time||120;
            that.jq("#getAuthCode").addClass("disable").html('<span>'+that.time+'</span> 秒后可<br>重新获取');
            that.startTime();
        },
        getServerAuthCode:function(fn){
            var that = this;
            var mobile = this.getMobile();
            if(!mobile){return false;}
            that.sendAuth = true;

            Req.postReq("/account/getAuthCode.do",{mobile:mobile,authtype:this.authtype},function(r){
                that.sendAuth = false;
                if(r.getCode()==0){
                    fn();
                }else if(r.getCode()==300010015){//tdentifyCode needed 300010015
                    that.showIdentifyCodeUI(mobile);
                } else{//other 300019999
                    var msg = r.data.msg ? r.data.msg :"未知错误" ;
                    that.showErr(msg,that.jq("#verify"));
                }
            });
            return true;
        },
        send:function(){
            var that = this;
            var mobile = this.getMobile();
            if(!mobile){return false;}
            var pwd = this.getPwd();
            if(!pwd){return false;}
            var verify = this.getAuthCode();
            if(!verify){return false;}
            if(!this.jq("#agreeTxt:checked").length){
                that.showErr('请阅读并同意《用户协议》');
                return false;
            }
            Req.postReq("/account/registerMobile.do",{account:mobile,password:pwd,authCode:verify},function(r){
                if(r.getCode() == 0){
                    if(location.pathname == "/account/auth"){
                        pin._auth.callback(r.getData());
                    } else {
                        location.reload();  
                    }
                } else {
                    var msg = r.data.msg ? r.data.msg :"未知错误" ;
                    that.showErr(msg);
                }
            });
        },
        onViewReady:function(){
            this.initEvent();
        }
    }));

    
    P.reg("Identify",Util.create(P.getCls("Layer"),{
        view : 'regBox',
        destroy:true,
        contentHtml:"identify",
        //cs:"win-reg",
        appendTo:doc,
        dataCache:{},
        cacheData:function(key,value){
            if(arguments.length>1){
                this.dataCache[key] = value;
            }else if(arguments.length==1){
                return this.dataCache[key];
            }else{
                return this.dataCache;
            }
        },
        clearCacheData:function(){
            for(var k in this.dataCache){
                delete this.dataCache[k]
            }
        },
        destroyUI:function(){
            this.clearCacheData();
            this.display(false);
        },

        initEvent:function(){
            var that = this;
            this.jq("input").focus(function(){
                 that.clearErr();
            }).on("change",function(){
                if($.trim(this.value).length>0){
                    that.jq(this).closest(".input").addClass("active");
                }else{
                    that.jq(this).closest(".input").removeClass("active");
                }
            });



            var t,identifyCodeInput = this.jq("#identifyCode");
            this.jq("#identifyCodeImg").click(function(){
                if(t&&(new Date()-t<1000)){
                    that.showErr("请稍后再试",this);
                    return;
                }

                var mobile = that.getMobile();
                if(mobile){
                    that.showIdentifyCode(mobile,function(){
                        identifyCodeInput.val('');
                    });
                }
            });

            this.jq(".js-change").on("click",function(){
                that.jq("#identifyCodeImg").trigger("click");
            });

            var identifyCodeHandler = function(e){
                var eventType = e.type;
                var identifyCode = $.trim(identifyCodeInput.val());
                if(identifyCode==identifyCodeInput.data("oval")){
                    return;
                }else{
                    identifyCodeInput.data("oval",identifyCode);
                }
                
                
                if(identifyCode.length==4){
                    var mobile = that.getMobile();
                    var hostUI = that.getHostUI();

                    that.checkImageIdentifyCode({code:identifyCode,phone:mobile,act:'reg'},function(r){
                        if(r.getCode()==1){
                            hostUI.reSendAuthCode();
                            that.destroyUI();
                        }else if(r.getCode()==1024){
                            hostUI.declareAuthCode();
                            that.destroyUI();
                        }else{
                            var msg = "验证码错误" ;
                            that.showErr(msg,identifyCodeInput);
                            that.showIdentifyCode(mobile,function(){
                                if(eventType=='click'){
                                    that.showErr('请输入四位图片验证码');
                                    identifyCodeInput.data("oval",'');
                                }
                                identifyCodeInput.val('');
                            });
                        }
                    });
                }else{
                    if(eventType=='click'){
                        that.showErr('请输入四位图片验证码');
                    }
                }
            }

            /*if (!("oninput" in document.createElement("input"))) {
                identifyCodeInput.bind("propertychange",identifyCodeHandler);
            } else {
                identifyCodeInput.bind("input",identifyCodeHandler);
            }*/
            this.jq(".btn-reg").on("click",identifyCodeHandler);
                 
        },
        clearErr:function(){
            var that = this;
            that.jq(".err-inner").cssDisplay(0);
            that.jq(".row .input").removeClass("inp-tip");
        },
        showErr:function(txt,field){
            this.jq(".err-inner").cssDisplay(1).find("span").html(txt);
            if(field){
                this.jq(field).closest(".input").addClass("inp-tip");
            }
        },
        getHostUI:function(){
            return this.cacheData('hostUI');
        },
        getMobile:function(){
            return this.cacheData('mobile');
        },
        showIdentifyCode:function(mobile,fn){
            var that = this;
            var img = that.jq("#identifyCodeImg");
            var imgurl = '/account/getImageIdentifyCode.do?phone='+mobile+'&_='+new Date()*1;

            img[0].onload = function(){
                fn&&fn();
                this.onload = null;
            };
            img.attr("src",imgurl);
            img.closest(".row").removeClass("hide");
        },
        checkImageIdentifyCode:function(data,fn){
            Req.q("/account/checkImageIdentifyCode.do",data,fn);
        },

        onViewReady:function(){
            this.initEvent();
            var that = this;
            var mobile = that.getMobile();
            if(mobile){
                that.showIdentifyCode(mobile);
            }
        }
    }));


    
    P.reg("changePwd",Util.create(P.getCls("Reg"),{
        view : 'regBox',
        destroy:true,
        contentHtml:"changePwd",
        cs:"win-forgot",
        appendTo:doc,
        sendAuth:false,
        authtype:"changepwd",
        send:function(){
            var mobile = this.getMobile();
            if(!mobile){return false;}
            var pwd = this.getPwd();
            if(!pwd){return false;}
            var verify = this.getAuthCode();
            if(!verify){return false;}
            var that = this;
            Req.postReq("/account/resetPwd.do",{account:mobile,password:pwd,authCode:verify},function(r){
                if(r.getCode() == 0){
                    msgBox.alert("",'密码修改成功！',function(){
                        that.close();
                    });
                } else {
                    var msg = r.data.msg ? r.data.msg :"未知错误" ;
                    that.showErr(msg);
                }
            });
        },
        onViewReady:function(){
            this.initEvent();
        }
    }));

    var SetRole = P.reg("SetRole",Util.create(P.getCls("Layer"),{
        view : 'regBox',
        contentHtml:"setrole",
        cs:"filling-res",
        appendTo:doc,
        ejsTpl:true,
        destroy:true,
        role:"examinee",
        labelValue:{
            "examinee":["就读高中","请填写您就读的高中"],
            "parents":["孩子高中","请填写孩子就读的高中"],
            "student":["就读大学","请填写当前就读的大学"],
            "worker":["当前职业","请填写当前从事的职业"]
        },
        showErr:function(txt){
            this.jq(".err-inner").cssDisplay(1).find("span").html(txt);
        },
        initEvent:function(){
            var allANode = this.jq(".btn-group a");
            var that = this;
            this.jq("input").focus(function(){
                that.jq(".err-inner").cssDisplay(0);
            });
            allANode.click(function(){
                allANode.removeClass("cur");
                $(this).addClass("cur");
                that.role = $(this).attr("jd");
                var l = that.labelValue[that.role];
                that.jq("#label").text(l[0]+"：");
                that.jq("#text").attr("placeholder",l[1]);
                var txt = "*以便为您提供毕业前景分析"
                if(that.role=='worker'){
                    txt = '*以便为您提供精准职位分析'
                }
                that.jq('.spec span').text(txt);
                return false;
            });
            this.jq(".btn").click(function(){
                that.send();
                return false;
            });
        },
        send:function(){
            var that = this;
            var text = this.jq("#text").val();
            if(!text){
                this.showErr("请填写您的"+that.labelValue[that.role][0])
                return false;
            }
            Req.q("/account/setRole.do",{'base.role':this.role,"text":text},function(r){
                if(r.isOk()){
                    that.jq().remove();
                    that.afterHide();
                    pin.use("regSuccess").display(1);
                } else {
                    msgBox.alert("","设置用户信息失败！");
                }
            })
        },
        onViewReady:function(){
            this.initEvent();
        }
    }));

    P.reg("loginBox",Util.create(P.getCls("Layer"),{
        view : 'regBox',
        contentHtml:"newLoginBox",
        cs:"win-login",
        appendTo:doc,
        txt:"用以下账号登录，即可查看详细信息",
        destroy:true,
        onViewReady:function(){
            this.initEvent();
        },
        login:function(){
            var mobile = this.jq("#mobile").val();
            var password = this.jq("#password").val();
            
            this.jq("#login_back").val(pin.getCfg("loginCallback") || location.href);
            
            if(!mobile){
                this.showErr("请输入手机号码",this.jq("#mobile"));
                return false;
            }
            if(!password){
                this.showErr("请输入密码",this.jq("#password"));
                return false;
            }

    
            if(password && mobile){
                this.jq("#loginForm").submit();
            }
        },
        showErr:function(txt,field){
            this.jq(".err-inner").cssDisplay(1).find("span").html(txt);
            if(field){
                 this.jq(field).closest(".input").addClass("inp-tip");
            }
        },
        clearErr:function(){
            var that = this;
            that.jq(".err-inner").cssDisplay(0);
            that.jq(".row .input").removeClass("inp-tip");
        },
        initEvent:function(){
            var that = this;
            this.jq("input").focus(function(){
                that.clearErr();
                
            }).on("change",function(){
                if($.trim(this.value).length>0){
                    that.jq(this).closest(".input").addClass("active");
                }else{
                    that.jq(this).closest(".input").removeClass("active");
                }
            });
            this.jq("#reg").click(function(){
                that.jq().remove();
                that.afterHide();
                pin.use("Reg").display(1);
                return false;
            });
            this.jq(".btn-reg").click(function(){
                that.login();
                return false;
            });
            this.jq("#changePwd").click(function(){
                that.jq().remove();
                that.afterHide();
                pin.use("changePwd").display(1);
                return false;
            });
            
        }


    }));

    P.reg('SetEmail',Util.create(pin.ui.Layer,{
        contentHtml:"setmail",
        type:1,
        closeAble:false,
        view : 'Box',
        cs:"win-fixed mail",
        appendTo:doc,
        ejsTpl:true,
        req:function(){
            $.extend(Req,{
                setResume : function(data,fn){
                    return this.postReq("/account/setResume.do",data,fn);
                }
            });
        },
        onViewReady:function(){
            this.initEvent();
            this.req();
        },
        initEvent:function(){
            var that = this;
            this.jq('input')
                .focusText("focus")
                .placeholder()
                
            this.jq('input:first')
                .blur(function(){
                    if(!that.chkEmail()){
                        $(this).addClass("error");
                        that.errorTips(1,"请填写正确的邮箱地址");
                        that.jq(".err-tips").cssDisplay(1);
                    }
                })
                .focus(function(){
                    $(this).removeClass("error");
                    that.errorTips(0);
                })
                .keydown(function(e){
                    if(e.keyCode == 13){
                        that.jq('.bnt').trigger('click');
                    }
                });

            this.jq('i.checkbox').click(function(){
                $(this).toggleClass('checkbox-checked');
                that.errorTips(!$(this).hasClass('checkbox-checked'),"请阅读并同意《用户协议》");
                return false;
            });

            this.jq(".bnt").click(function(){
                that.send();
                return false;
            });
            //SetRole.prototype.initEvent.call(this);
        },
        errorTips:function(b,txt){
            this.jq(".err-tips").cssDisplay(b);
            if(txt){
                this.jq(".err-tips span").html(txt);
            }
        },
        getEmail:function(){
            var email = ""
            if(this.chkEmail()){
                email = $.trim(this.jq("input").val());
            } else {
               this.errorTips(1,"请填写正确的邮箱地址");
               return false;
            }
            if(!this.jq('i.checkbox').hasClass('checkbox-checked')){
                this.errorTips(1,"请阅读并同意《用户协议》");
                return false;
            }
            return email
        },
        send: function(role,info){
            var that = this;
            var val = this.getEmail();
            if(val === false){
                return;
            }
            if(this.sendmailLock) {
                msgBox.alert("","邮件发送中...");
                return;
            }
            that.sendmailLock = true;
            Req.q("/account/setEmail.do",$.extend({"email":val,'base.role':role},info),function(r){
                if(r.isOk()){
                    if(pin.getCfg('regBefore7')){
                        msgBox.success("",'邮件已发送！');
                    } else {
                        var obj = {email:val,type:that.type};
                        if(that.type == 2){
                            obj.contentHtml='sendmail2';
                        }
                        pin.use("MailSend",obj).display(1);
                    }
                    that.display(0)
                } else {
                    msgBox.alert("",r.getData().msg);
                }
                that.sendmailLock = false;
            })
        },
        chkEmail : function(){
            var val = this.jq("input").val()
            flag = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/i.test(val);
            return flag;
        }
    }));

    P.reg("protocol",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"protocol",
        cs:"win-fixed protocol",
        appendTo:doc,
        closeAble:false,
        onViewReady:function(){
            var that = this;
            this.jq("#ok").click(function(){
                that.display(0);
                P.use("SetEmail",{
                    img:pin.getCfg('userImg'),
                    gender:pin.getCfg('gender'),
                    screen_name:pin.getCfg('screen_name')
                }).display(1);
            });
            this.jq("#cancel").click(function(){
                P.use("protocol-confirm",{ p: that }).display(1);
                return false;
            });
        }
    }));

    P.reg("inviteShowMore",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"quota",
        cs:"win-fixed quota",
        appendTo:doc,
        destroy:true
    }));

    P.reg("PayConfirm",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"payconfirm",
        cs:"win-fixed protocol-confirm pay-confirm",
        appendTo:doc,
        onViewReady:function(){
            var that = this;
            this.jq("#ok").click(function(){
                location.href="/pay/vip.do";
                that.close();
                return false;
            });
            this.jq("#cancel").click(function(){
                location.reload(1);
                return false;
            });
        }
    }));

    P.reg("protocol-confirm",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"protocol-confirm",
        cs:"win-fixed protocol-confirm",
        appendTo:doc,
        onViewReady:function(){
            var that = this;
            this.jq("#ok").click(function(){
                that.close();
                return false;
            });
            this.jq("#cancel").click(function(){
                that.close();
                that.p.display(0);
                return false;
            });
        }
    }));
    
    P.reg("MailSend",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"sendmail",
        cs:"win-fixed mail-send",
        appendTo:doc,
        s:60,
        timeOut:false,
        type:1,
        onViewReady:function(){
            var that = this;
            if( this.type==2){
                this.runTime();
                this.reSend();
            }
            this.getEmailServer();
            
            this.jq('#changeEnail').click(function(){
                P.use("SetEmail",{
                    img:pin.getCfg('userImg'),
                    gender:pin.getCfg('gender'),
                    type:that.type
                }).display(1);

                that.display(0);

                return false;
            });
        },
        getEmailServer:function(){
            var rv = this.email.match(/^\w+((-\w+)|(\.\w+))*\@([A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+)$/i);
            rv = rv[4];
            var mailServer = emailServerName[rv];
            mailServer = "http://"+(mailServer ? mailServer : "mail."+rv);
            this.jq("#loginEmail").attr("href",mailServer)
        },
        onclose:function(){
            if(this.type == 1){
                location.reload(1);
            }
        },
        runTime:function(){
            var that = this;
            that.jq('.tt .s').html(that.s);
            setTimeout(function(){
                that.jq('.tt .s').html(--that.s);
                if(that.s<=0){
                    that.jq(".tt a").addClass("hover");
                    that.timeOut = true;
                } else {
                    that.runTime()
                }
            },1000);
        },
        reSend:function(){
            var that = this;
            this.jq("#resend").click(function(){
                if(that.timeOut){
                    pin.getCls("SetEmail").prototype.sendMail.call(that,that.email);
                    that.s = 60;
                    that.timeOut = false;
                    that.runTime()
                } else {
                    msgBox.alert("","发送太频繁了");
                }
                return false;
            })
        }
    }));

    var emailServerName={
        "163.com": "email.163.com",
        "126.com": "email.126.com",
        "sina.com": "mail.sina.com.cn",
        "sina.cn": "mail.sina.com.cn",
        "vip.sina.com": "mail.sina.com.cn",
        "my3ia.sina.com": "mail.sina.com.cn",
        "sohu.com": "mail.sohu.com",
        "qq.com": "mail.qq.com",
        "vip.qq.com": "mail.qq.com",
        "msn.com": "www.hotmail.com",
        "hotmail.com": "www.hotmail.com",
        "live.com": "www.hotmail.com",
        "live.cn": "www.hotmail.com",
        "yahoo.com.com": "mail.cn.yahoo.com",
        "yahoo.cn": "mail.cn.yahoo.com",
        "139.com": "mail.10086.cn",
        "189.com": "www.189.cn",
        "sogou.com": "mail.sogou.com",
        "tianya.cn": "mail.tianya.cn",
        "gmail.com": "mail.google.com",
        "tom.com": "mail.tom.com",
        "foxmail.com": "www.foxmail.com",
        "21cn.com": "mail.21cn.com",
        "yeah.net": "www.yeah.net",
        "wo.com.cn": "mail.wo.com.cn"
    }

    P.reg("AutoComplete",Util.create({
        inputor:null,
        tpl:null,
        ulDom:null,
        reqFn:null,
        content:null,
        searchBefore:$.noop,
        searchAfter:$.noop,
        displayUl:$.noop,
        inputorFcous:$.noop,
        nowIdx:-1,
        onblur:$.noop,
        needclick:false,
        selectIdx:function(){
            if(this.nowIdx != -1){
                var children = this.ulDom.find("li")
                children.removeClass("hover");
                children.eq(this.nowIdx).addClass("hover");
            }
        },
        clickIdx:function(){
            if(this.needclick){
                this.needclickLock=true;
            }
            if(this.nowIdx != -1){
                this.ulDom.find("li").eq(this.nowIdx).find("a")[0].click();
                this.inputor.blur();
            } else {
                var val = $.trim(this.inputor.val());
				val = encodeURIComponent(val)
                if(val.length>1){
                    location.href="/search/search.do?searchKey="+val+"&searchType="+pin.getCfg('searchType');
                }
            }
        },
        searchData:[],
        setSearchData:function(val){
            this.searchData.push(val);
            if(this.searchData.length>10){
                this.searchData.shift();
            }

        },
        getSearchData:function(val){
            return this.searchData.pop();
        },
        onViewReady:$.noop,
        cache:{},
        getExtData:$.noop,
        getData:function(v,fn){
            var that = this;
            console.log('autposearch>>>',v)
            if( !that.cache[v] ){
                return this.reqFn(v,function(r){
                    if(r.isOk()){
                        //that.cache[v] = r.getData();
                        that.cache = r.getData();
                        //fn(that.cache[v]);
                        fn(r.getData());
                        //关闭缓存
                    }
                    that.searchAfter();
                },this.getExtData());
            } else {
                fn(that.cache[v]);
                that.searchAfter();
            }
        },
        showUl:0,
        chkData:function (d) {
            var totalLength = d.inc.length + d.loc.length + d.sch.length + d.major.length + d.sch_major.length + d.position.length + d.customer.length;
            return totalLength != 0;
        },
        getUlHtml:function(d){
            return Tpl.ejs(this.tpl,d);
        },
        minCharLength:2,
        init : function(opt){
            var that = this;
            $.extend(this,opt);
            var xhr,searchKey,searchKeyLoad;
            var valChange = function(e){
                if(that.needclick){
                    that.needclickLock=false;
                }
                console.log('valChange')
                var val = $.trim($(this).val());
                /*if (!e.keyCode){ return; }
                if( "38,40,13,32".indexOf(e.keyCode) == -1 ){
                    that.ulDom.html('');
                }*/
                that.setSearchData(val);
                if(val.length>that.minCharLength - 1){
                    xhr&&xhr.abort();
                    if( val == searchKey ){
                        return;
                    }
                    that.searchBefore();
                    
                    xhr=that.getData(that.getSearchData(),function(d){
                            d.keyword = function(n){
                                return n.replace(new RegExp(val,"g"),function(all){return "<span>"+all+"</span>"})
                            }
                            if(that.chkData(d)){
                                that.ulDom.html(that.getUlHtml(d));
                                that.displayUl(1);
                            } else {
                                that.ulDom.html('');
                                that.displayUl(0);
                            }
                            that.nowIdx= that.needclick?0:-1;
                            that.selectIdx();
                            P.fire("resizeFoot");
                            that.inputorFcous(1);
                            searchKey = val;
                        })
                } else {
                    if(val.length>1 && that.ulDom.find("li").length){
                        that.displayUl(1);
                    } else{
                        that.ulDom.html('');
                        that.displayUl(0);
                    }
                    that.inputorFcous(1);
                    P.fire("resizeFoot");
                }
            }


            var time=0,timer=0,timeSlot=100;
            var handler = function(e){
                console.log('handler')
                var elm = this;
                if(new Date()-time>timeSlot){
                    clearTimeout(timer);
                    valChange.call(elm,e);
                }else{
                    timer = setTimeout(function(){
                        valChange.call(elm,e);
                    },timeSlot)
                }
            };

            if (!("oninput" in document.createElement("input"))) {
                that.inputor.bind("propertychange",handler);
            } else {
                that.inputor.bind("input",handler);
            }

            that.inputor.focus(function(){
                var val = $.trim($(this).val());
                if(val.length>1 && that.ulDom.find("li").length){
                    that.displayUl(1);
                    that.selectIdx();
                    P.fire("resizeFoot");
                }
                that.inputorFcous(1);
            })
            .blur(function(){
                setTimeout(function(){
                    that.inputorFcous(0);
                    that.displayUl(0);
                    P.fire("resizeFoot");
                    searchKey = null;
                    if(that.needclick && !that.needclickLock){
                        that.onblur();
                    }
                },200);
            })
            .keydown(function(e){
                var len = that.ulDom.find("li").length-1;
                switch(e.keyCode){
                    //上
                    case 38 :
                        that.nowIdx--;
                        if(that.nowIdx<0){
                           that.nowIdx = len; 
                        }
                        that.selectIdx();
                        return false;
                    //下 
                    case 40:
                        that.nowIdx++;
                        if(that.nowIdx>len){
                            that.nowIdx = 0;
                        }
                        that.selectIdx();
                        return false;
                    case 13 :
                        that.clickIdx();
                        return false
                }
            })
            .placeholder();

            that.ulDom.on('hover', 'li', function (e) {
                that.nowIdx = that.ulDom.find('li').index(this)
                that.ulDom.find('.hover').removeClass('hover')
                this.classList.add('hover')

            })

            this.onViewReady();
        }
    }));

    P.reg("pageTool",Util.create({
        init:function(){
            this.el = $(Tpl.parse("pageTool"))
            this.el.appendTo("body");
            this.pageEvent();
            this.toolEvent();
        },
        pageEvent:function(){
            var that = this;
            var fn = function(){
                var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                that.el.find(".gotoback").cssDisplay($(window).scrollTop()>0  && $("html").prop("scrollHeight") > clientHeight)
            }
            fn();
            $(window).resize(fn);
            $(window).scroll(fn);
        },
        toolEvent:function(){
            this.el.find(".gotoback").click(function(){
                $("html,body").animate({"scrollTop":0});
                return false;
            });
            this.el.find(".feedback").click(function(){
                P.use("feedbackBox",{
                    toolEl:$(this)
                }).display(1);
                return false;
            });
            this.el.find(".share-bnt").click(function(){
                var el = $(".bds_more")[0];
                el && el.click();
                return false;
            })
        }
    }));

    P.reg("feedbackBox",Util.create(P.getCls("Layer"),{
        view:"feedbackBox",
        appendTo:doc,
        context:true,
        mask:false,
        autoCenter:false,
        destroy:true,
        afterShow:function(){
            this.toolEl.addClass("feedback-show");
            return P.getCls("Layer").prototype.afterShow.apply(this,[])
        },
        afterHide:function(){
            this.toolEl.removeClass("feedback-show");
            return P.getCls("Layer").prototype.afterHide.apply(this,[])
        },
        onViewReady:function(){
            var that = this;
            this.jq(".bnt").click(function(){
                that.send();
                return false;
            });
            this.jq().placeholder();
            this.jq('#text,#contact').focus(function(){
                that.msg(0);
                $(this).removeClass('orange-border')
            })
        },
        send:function(){
            var that = this;
            var txt = $.trim(this.jq("#text").val());
            var contact = $.trim(this.jq("#contact").val());
            if (txt && contact){
                Req.postReq("/account/feedback.do",{txt:txt,contact:contact,url:location.href},function(r){
                    if(r.isOk()){
                        msgBox.success("","您的反馈已记录，谢谢!");
                    } else {
                        that.msg(1,"服务器错误!")
                    }
                    that.close()
                })
            } else {
                var msg = ''
                if(!txt){
                    this.jq("#text").addClass('orange-border')
                    msg += "请留下你的联系方式"
                }
                if(!contact){
                    this.jq("#contact").addClass('orange-border')
                    msg += "请描述你的反馈"
                }
                that.msg(1,msg)
            }
        },
        msg:function(b,msg){
            this.jq(".err-tips").cssDisplay(b).find('span').html(msg)
        }
    }));

    pin.reg("select",Util.create(pin.getCls("Base"),{
        context:true,
        val:function(){
            var that = this;
            var spanEl = this.jq("span:eq(0)");

            if(arguments.length==0){
                if(spanEl.attr(this.attrValue) == undefined){
                    spanEl.attr(this.attrValue,$.trim(spanEl.text()));
                }
                return spanEl.attr(this.attrValue) + "";
            } else {
                var val = arguments[0];
                function setVal(val){
                    var valEl;
                    if(typeof val == "string"){
                        valEl = that.jq("ul li["+that.attrValue+"='"+val+"']");
                        if (!valEl.length){
                            that.jq("ul li").each(function(){
                                if($.trim($(this).text()) == val){
                                  valEl = $(this);
                                  return false;  
                                }
                            });
                        }
                    } else {
                        valEl = $(val);
                    }
                    return valEl;
                }
                if (this.multiple){
                    var returnEl = $();
                    if($.type(val) == "string"){
                        val = val.split(',')
                    }
                    $(val).each(function(i,v){
                        var rv = setVal(v);
                        rv.length && ( returnEl = returnEl.add(rv) );
                    });
                    var value = [];
                    var txt = [];
                    $(returnEl).each(function(){
                        var el = $(this);
                        value.push(that.getValue(el));
                        txt.push( that.getElTxt(el) );
                    });
                    txt = txt.join(',') || that.nullTxt;
                    spanEl.text(that.getTextFormat(txt)).attr(this.attrValue,value.join(','));
                    this.selectEl(returnEl);
                } else {
                    var valEl = setVal(val);
                    spanEl.text(that.getTextFormat( that.getElTxt(valEl) )).attr(this.attrValue,this.getValue(valEl));
                    this.selectEl(valEl);
                }
                return this.jq()
            }
        },
        getElTxt:function(el){
            if(!el.length){
                return this.nullTxt;
            }
            return el.text();
        },
        getTextFormat:function(txt){
            return txt;
        },
        getValue:function(el){
            el = $(el);
            if(el.length){
                var value = el[0].getAttributeNode(this.attrValue);
                return value ? value.value : $(el).text();
            }else {
                return '';
            }
        },
        nullTxt:'<空>',
        selectEl:function(el){
            this.ulDom.find('li')
                .removeClass('selected')
                .removeClass('hover')
            el && el.addClass('selected');
        },
        focusRemoveClass:'',
        setOption:function(arr){
            var html="";
            if($.type(arr) == "array"){
                arr.forEach(function(item,idx){
                    if($.type(item) == "array"){
                        html += "<li "+this.attrValue+"='"+item[1]+"'>"+item[0]+"</li>";
                    } else {
                        html += "<li "+this.attrValue+"='"+item+"'>"+item+"</li>";
                    }
                });
                this.jq("ul").html(html);
                this.jq("ul li:first").addClass("first");
            } else {
                throw "输入项 不是数组";
            }
        },
        onchange:$.noop,
        changeIng:$.noop,
        multiple:false,
        radio:false,
        autoColumn:true,
        minCol:3,
        maxCol:5,
        autoPosition:true,
        lockPosition:false,
        changePosition:function(){
            if(this.autoPosition){
                //left right
                var cw = document.documentElement.clientWidth || document.body.clientWidth;
                var left = this.jq().offset().left - $(window).scrollLeft();
                var ulWidth = this.ulDom.width();
                var d='';

                if(left + ulWidth > cw  && left > cw/2 ){
                    d = 'r';
                } else {
                    d = 'l';
                }
                if(this.lockPosition){
                    if(['r','l'].indexOf(this.lockPosition)!=-1){
                        d = this.lockPosition;
                    }
                }
                switch(d){
                    case 'r':
                        this.ulDom.css({
                            left:'auto',
                            right:this.ulDom.css('marginLeft')
                        });
                        break;
                    case 'l':
                        this.ulDom.css({
                            left:'',
                            right:''
                        });
                        break;
                }

                var ch = document.documentElement.clientHeight || document.body.clientHeight;
                var top = this.jq().offset().top - $(window).scrollTop();
                var ulHeight = this.ulDom.height();
                if(top + ulHeight > ch  && top > ch/2 ){
                    d = 't'
                } else {
                    d = 'b'
                }
                if(this.lockPosition){
                    if(['t','b'].indexOf(this.lockPosition)!=-1){
                        d = this.lockPosition;
                    }
                }
                switch(d){
                    case 't':
                        this.ulDom.css({top:-ulHeight})
                        break;
                    case 'b':
                        this.ulDom.css({top:''})
                        break;
                }

            }
        },
        initDom:function(ulDom){

            if(  this.autoColumn && this.maxCol != 1 &&  ( ( ulDom.length == 0 && this.jq('ul li').length > 10 )  || this.multiple || this.outMode ) ){
                var col = parseInt ( this.jq('ul li').length / 10 );
                this.col = col = Math.min(Math.max(this.minCol,col),this.maxCol)
                if ( ulDom.length == 0  ){
                    this.jq('ul').before('<div class="select-m select-col-'+col+' hidden"></div>');
                    this.jq('ul').removeAttr('class')
                    this.jq('ul').appendTo(this.jq('.select-m'));
                    ulDom = this.jq('.select-m');
                } else {
                    ulDom.attr("class",'select-m select-col-'+col + ' hidden')
                }
            }
            if(this.multiple){
                ulDom.append(
                    Tpl.ejs(['<div class="bnt-area"><% for(var i=0,len=data.length;i<len;i++){ %>',
                '    <a href="#" id="<%= data[i].id%>" class="bnt"><%= data[i].title%></a>',
                '<% } %></div>'].join(''),this.buttons)
                );
            }
            return ulDom;
        },
        buttons:[
            {id:"cancel",title:"取消选择"},
            {id:"ok",title:"确定"}
            /*{id:"allSelect",title:"全选"},
            {id:"close",title:"关闭"}*/
        ],
        bntOk:function(el){
            var val,that = this;
            that.val(that.jq('li.selected'));
            val = that.val();
            if(that._val != val){
                that._val = val;
                that.onchange(val,this);
            }
            setTimeout(function(){that.jq().triggerHandler('blur');},100)
        },
        bntCancel:function(el){
            var val,that = this;
            that.jq('li.selected').removeClass('selected')
            that.val([]);
            val = that.val();
            if(that._val != val){
                that._val = val;
                that.onchange(val,this);
            }
            this.jq("#allSelect").html('全选');
            setTimeout(function(){that.jq().triggerHandler('blur');},100);
        },
        bntAllSelect:function(el){
            var that = this;
            var selected = el.data('_selected_')
            if(selected == undefined || selected == true){
                el.data('_selected_',false);
                that.jq('li').addClass('selected');
                el.html('取消全选');
            } else {
                el.data('_selected_',true);
                that.jq('li').removeClass('selected');
                el.html('全选');
            }
            that.changeIng();
        },
        bntClose:function(){
            that._hide();
        },
        initEvent:function(ulDom){
            var that = this;

            this.jq().click(function(e){
                var target = e.target;
                if(that.hidden){
                    if(!Util.ancestorOf(ulDom[0],e.target) ){
                        that._show()
                    }
                } else if( !Util.ancestorOf(ulDom[0],e.target) ){
                   that._hide()
                }
                pin.fire("select:click",{uId:that.uId});
            });
            if(this.multiple || that.radio){
                this.jq('.bnt-area').click(function(e){
                    var target = e.target;
                    if(target.tagName == "A"){
                        var idStr = $(target).attr('id');
                        var fnkey = "bnt"+idStr.charAt(0).toUpperCase()+idStr.substr(1);
                        if(that[fnkey]){
                            that[fnkey]($(target))
                        }
                        return false;
                    }
                });
            }
            this.liEvent(this.jq("li"));

            pin.on("select:click",function(obj){
                if(obj.uId!=that.uId && !that.hidden){
                    that.display(0);
                }
            });
            this.jq().data("_valfn",function(args){
                return that.val.apply(that,args);
            });
            this.jq().focus(function(e){that._show();})
            .blur(function(e){that._hide();});
        },
        liEvent:function(liDom){
            var that = this;
            liDom.click(function(e){
                var val,rv;
                that.changeIng();
                if(that.multiple){
                    $(this).toggleClass('selected');
                    rv = false;
                } else if(that.radio) {
                    $(this).parent().find('li.selected').removeClass('selected');
                    $(this).addClass('selected');
                    rv = false;
                } else {                    
                    if(!$(this).hasClass('selected')){
                        that.val(this);
                        val = that.val();
                        if(that._val != val){
                            that._val = val;
                            rv = that.onchange(val,this);
                        }
                    }
                }
                if(rv === false){
                    return false;
                } else {
                    setTimeout(function(){that.jq().triggerHandler('blur');},100);
                }
            })
            .hover(function(){
                $(this).addClass("hover");
            },function(){
                $(this).removeClass("hover");
            });
        },
        multipleAutoChkValue:true,
        setDef:function(def){
            this._val = this.def = def;
            this.jq().data("_val",this.def);
        },
        attrValue:'value',
        onViewReady:function(){
            var that = this;
            var ulDom = that.jq('.select-m, .dropdown-box');

            var spanEl = this.jq("span:eq(0)");
            this.attrValue = spanEl.attr("_v_") || this.attrValue;

            ulDom = this.initDom(ulDom);

            if( ulDom.length==0 ){
                ulDom = this.jq('ul');
            }
            this.ulDom = ulDom;
            //验证
            if(this.multiple && this.multipleAutoChkValue ){
                this.val(this.val());
            }
            this._val = this.def = this.val();
            this.jq().data("_val",this.def);

            this.initEvent(ulDom);
            this.changePosition();

            setTimeout(function(){
                that.hidden = 1;
            },500);

            if(Util.ie){
                this.jq("span").attr("hidefocus","true");
            }

        },
        _show:function(){
            this.jq().removeClass(this.focusRemoveClass);
            this.display(1);
        },
        _hide:function(data){
            data!="select" && this.display(0);
            this.nodeDisplay(0);
        },
        afterHide:function(){
            this._hide("select");
        },
        nodeDisplay:function(b){
            this.ulDom && this.ulDom.cssDisplay(b);
            if(b){
                this.changePosition();
            }
            var v = this.val();
            if(this.def == this.val() || (v == "" && !b)){
                this.cssNode.checkClass(this.hoverClass,b);
            } else {
                this.cssNode.addClass(this.hoverClass);
            }
            this.jq("i.icon").checkClass("up",b);
        }
    }));

    pin.reg("companySearch",Util.create(pin.getCls("Base"),{
        context:true,
        selectItem:$.noop,
        hoverClass:'company-search-hover',
        search:{
            "searchType":'inc',
            "form":'inc',
            "idKey":'inc_id',
            "nameKey":'inc_name'
        },
        onViewReady:function(){
            var el = this.jq();
            var that = this;
            this.jq('.change-company').click(function(){
                that.display(1);
                return false;
            });
            var search = this.search;
            pin.use("AutoComplete",{
                inputor:this.jq(".search-mod input"),
                tpl:'<% for(var i=0;i<data.'+search.form+'.length;i++){ %><li jd="<%=data.'+search.form+'[i].'+search.idKey+'%>"><%=data.'+search.form+'[i].'+search.nameKey+'%></li><%}%>',
                ulDom:this.jq(".search-ul ul"),
                reqFn:Util.bind(function(searchKey,fn){return this.q("/search/searchJson.do",{searchKey:searchKey,searchType:search.searchType,"hasStat":search.hasStat},fn);},Req),
                content:this.jq(""),
                displayUl:$.noop,
                clickIdx:function(){
                    if( this.nowIdx != -1 ){
                        that.selectItem( this.ulDom.find("li").eq(this.nowIdx) )
                    }
                }
            });
            this.jq(".search-ul ul").click(function(e){
                if(e.target.tagName == 'LI'){
                    that.selectItem(e.target);
                    return false;
                }
            });
        },
        nodeDisplay:function(b){
            this.jq().checkClass(this.hoverClass,b);
        }
    }));
    
    pin.reg('SetMycompany',Util.create(pin.getCls("Layer"),{
        appendTo:$('body')[0],
        cs:'input-pop mycompany',
        contentHtml:'myconpany',
        buttonHtml:'myconpany-bf',
        showFb:false,
        view:'Box',
        selectItem:function(el,fromBlur){
            fromBlur || this.jq('input').blur();
            this.inc_id = $(el).attr('jd');
            this.name = $.trim($(el).text());
            this.jq('input').val(this.name);
        },
        callBack:$.noop,
        onViewReady:function(){
            var that = this;
            this.jq('#ok').click(function(){
                Req.postReq("/account/setMyCompany.do",{"name":that.name,"inc_id":that.inc_id},function(r){
                    if(r.isOk()){
                        that.callBack(that.name,that.inc_id);
                        that.display(0);
                    } else {
                        MsgBox.alert("",'服务器错误！');
                    }
                });
                return false;
            });
            var autoCompany = pin.use("AutoComplete",{
                inputor:this.jq("input"),
                tpl:'<% for(var i=0;i<data.inc.length;i++){ %><li<%if(i==0){%> class="first hover"<%}%> jd="<%=data.inc[i].inc_id%>"><%=data.inc[i].inc_name%></li><%}%>',
                ulDom:this.jq(".auto-complete"),
                reqFn:Util.bind(function(searchKey,fn){return this.q("/search/searchJson.do",{searchKey:searchKey,searchType:"inc"},fn);},Req),
                content:this.jq(".input"),
                needclick:true,
                inputorFcous:function(b){
                    this.content.checkClass('input-hover',b);
                },
                clickIdx:function(b){
                    this.needclickLock=true;
                    if( this.nowIdx != -1 && this.ulDom.find("li").length){
                        that.selectItem(this.ulDom.find("li").eq(this.nowIdx),b)
                    }
                },
                onblur:function(){
                    if(this.nowIdx == -1){
                        this.nowIdx = 0
                    }
                    this.clickIdx(1)
                }
            });
            this.jq(".auto-complete").click(function(e){
                if(e.target.tagName == 'LI'){
                    autoCompany.needclickLock = true;
                    that.selectItem(e.target);
                    return false;
                }
            });
            this.jq('.checkbox-div .icon').click(function(){
                $(this).toggleClass('checkbox');
            });
            this.jq('#no').click(function(){
                if(that.jq('.checkbox-div i').hasClass('checkbox')){
                    Req.q('/account/setMyconpanyState.do',{},function(){that.close();});
                } else {
                    that.close();
                }
                return false;
            });
        }
    }));

    P.reg('RegBefore7',Util.create(P.getCls("Layer"),{
        view:'Box',
        contentHtml:'regBefore7',
        cs:"win-fixed regBefore7",
        appendTo:doc,
        onViewReady:function(){
            var that = this;
            this.jq("#ok").click(function(){
                if(that.sendmailLock) {
                    msgBox.alert("","邮件发送中...");
                    return false;
                }
                that.sendmailLock = true;
                if( that.email == "" ){
                    that.display(0);
                    that.setEmail();
                } else {
                    Req.q("/account/setEmail.do",{"email":that.email},function(r){
                        if(r.isOk()){
                            that.sendMail(that.email);
                            that.display(0);
                        } else {
                            var msg = r.getData().msg;
                            msgBox.alert("",msg,function(){
                                if(msg != "请求太频繁!"){
                                    that.display(0);
                                    that.setEmail();
                                }
                            });
                        }
                        that.sendmailLock = false;
                    });
                }
                return false;
            });
        },
        setEmail:function(){
            pin.use("SetEmail",{
                img:pin.getCfg('userImg'),
                gender:pin.getCfg('gender'),
                type:2
            }).display(1);
        },
        sendMail:function(email){
            pin.use("MailSend",{
                email:email,
                contentHtml:'sendmail2',
                type:2
            }).display(1);
        }
    }));

    P.reg("InviteBox",Util.create(P.getCls("Layer"),{
        view : 'Box',
        contentHtml:"invite-succ",
        cs:"win-fixed invite-succ",
        appendTo:doc,
        onViewReady:function(){
            var that = this;
            this.jq(".cancel").click(function(){
                that.display(0);
                return false;
            })
        }
    }));

    pin.reg('CompareArea', function(opt){
        var opt = opt || {};
        var box = pin.use('Layer',$.extend({
            view:$('.compare-area')[0],
            autoCenter:false,
            mask:false,
            hidden:true,
            context:true,
            onclose:function(){
                var el = this.jq();
                var that = this;
                that.display(0);
                //console.log('close')
            },
            onViewReady:function(){
                var el = this.jq();
                var that = this;
                el.hover(function(){
                    el.addClass('compare-area-hover');
                },function(){
                    if(that.hidden){
                        el.removeClass('compare-area-hover');
                    }
                });
                this.jq('.cur').click(function(){
                    that.display(1);
                    $('a.add-compare').triggerHandler('click');
                    return false;
                });
                this.nowLen = pin.getCfg('compareDataLen');
                this.initInput(this.jq('.input'));
                this.addOne();
                this.bntEvent();
            },
            nodeDisplay : function(b){
                this.jq('.compare-layer').cssDisplay(b);
                this.jq().checkClass('compare-area-hover',b);
            },
            modeCfg:{
                type:'company',
                name:'公司',
                keys:"inc_ids",
                search:{
                    "searchType":'inc',
                    "form":'inc',
                    "idKey":'inc_id',
                    "nameKey":'inc_name'
                }
            },
            bntEvent:function(){
                var that = this;
                this.jq('.bnt').click(function(){
                    console.log("compare")
                    var k = Object.keys(that.nowKey);
                    if( k.length >1 ){
                        var s = encodeURIComponent(k.join(','));
                        location.href = '/api/'+that.modeCfg.type+'/compare.do?'+that.modeCfg.keys+'='+s;
                    } else {
                        that.showError('对比'+that.modeCfg.name+'至少两个！');
                    }
                    return false;
                });
            },
            nowKey:{},
            nowLen:0,
            addOne:function(key_id,name){
                this.hideError();
                var that = this;
                if ( key_id && name){
                    if( that.nowKey[key_id] ){
                        //that.showError('该公司已经添加')
                    } else {
                        if(this.modeCfg.type != "school"){
                            var input = this.jq('input:not([key_id])').eq(0);
                            if( input.length ){
                                input.val(name).attr('key_id',key_id);
                                input.parent().addClass('input-succ');
                            } else {
                                that.showError('最多4个'+that.modeCfg.name+'，请删除一个再添加')
                            }
                        } else {
                            var input = this.jq('input:not([key_id])').eq(0);
                            var allInput = this.jq(".base-form .input");
                            if(allInput.length < 12){
                                if(input.length == 0){
                                    var insertInput = $('<div class="base-line input"><input type="text" placeholder="请输入学校"><ul class="auto-complete hidden"></ul><a href="#" class="del"></a></div>');
                                    this.jq(".base-form .base-line:last").before(insertInput);
                                    this.initInput(insertInput);
                                    input = insertInput.find('input')
                                }
                                input.val(name).attr('key_id',key_id);
                                input.parent().addClass('input-succ');
                            } else {
                                that.showError('最多12个'+that.modeCfg.name+'，请删除一个再添加');
                            }
                        }
                    }
                }
                this.nowKey = {};
                var allIncInput = this.jq('input[key_id]')
                allIncInput.each(function(){
                    that.nowKey[$(this).attr('key_id')] = $(this).val();
                });
                this.jq('.cur>span').html("("+allIncInput.length+")").cssDisplay(allIncInput.length);
                if(this.nowLen != allIncInput.length){
                    this.nowLen = allIncInput.length;
                    allIncInput.length&&this.sendData();
                }
            },
            sendData:function(){
                var k = Object.keys(this.nowKey);
                var val = []
                for(var i=0,len=k.length;i<len;i++){
                    val.push(this.nowKey[k[i]]);
                }
                Req.q('/api/'+this.modeCfg.type+'/compareData.do',{k:k,v:val},function(){});
            },
            showError:function(err){
                this.jq('.err-tips')
                    .cssDisplay(1)
                    .find('span').html(err);
            },
            hideError:function(){
                this.jq('.err-tips').cssDisplay(0)
            },
            initInput:function(inputEl){
                var that = this;
                var search = this.modeCfg.search;
                inputEl.each(function(){
                    var inputDiv = $(this);
                    var selectItem = function(el,fromBlur){
                        fromBlur || inputDiv.find('input').blur();
                        var key_id = $(el).attr('jd');
                        if( that.nowKey[key_id] ){
                            that.showError('该'+that.modeCfg.name+'已经添加')
                        } else {
                            that.nowKey[key_id] = $.trim($(el).text());
                            inputDiv.find('input').val(that.nowKey[key_id])
                                                  .attr('key_id',key_id);
                            inputDiv.addClass('input-succ');
                            inputDiv.find('ul').html('');
                            that.addOne();
                        }
                    }
                    inputDiv.find('input').keyup(function(){
                        if($(this).val() == '' && inputDiv.hasClass('input-succ')){
                            inputDiv.find('.del').click();
                        }
                    });
                    var autoCompany = pin.use("AutoComplete",{
                        inputor:inputDiv.find('input'),
                        tpl:'<% for(var i=0;i<data.'+search.form+'.length;i++){ %><li jd="<%=data.'+search.form+'[i].'+search.idKey+'%>"><%=data.'+search.form+'[i].'+search.nameKey+'%></li><%}%>',
                        ulDom:inputDiv.find("ul"),
                        reqFn:Util.bind(function(searchKey,fn){return this.q("/api/search/searchJson.do",{searchKey:searchKey,searchType:search.searchType,hasStat:search.hasStat},fn);},Req),
                        content:inputDiv,
                        needclick:true,
                        displayUl:function(b){
                            this.content.checkClass('input-hover',b);
                            this.ulDom.cssDisplay(this.ulDom.find('li').length)
                        },
                        inputorFcous:function(b){
                            this.content.checkClass('input-hover',b);
                            this.ulDom.cssDisplay(this.ulDom.find('li').length);
                            b && that.hideError();
                        },
                        clickIdx:function(b){
                            this.needclickLock=true;
                            if( this.nowIdx != -1 && this.ulDom.find("li").length){
                                selectItem( this.ulDom.find("li").eq(this.nowIdx),b)
                            }
                        },
                        onblur:function(){
                            if(this.nowIdx == -1){
                                this.nowIdx = 0
                            }
                            this.clickIdx(1)
                        }
                    });
                    inputDiv.find("ul").click(function(e){
                        if(e.target.tagName == 'LI'){
                            autoCompany.needclickLock = true;
                            selectItem(e.target);
                            return false;
                        }
                    });
                    inputDiv.find('.del').click(function(){
                        inputDiv.find('input').val('');
                        delete that.nowKey[inputDiv.find('input').attr('key_id')];
                        inputDiv.find('input').removeAttr('key_id')
                        inputDiv.removeClass('input-succ');
                        that.addOne();
                        return false;
                    });
                });
            }
        },opt));
        pin.reg('CompareArea',box,1);
        return box;
    });
    
    return ui;
});
