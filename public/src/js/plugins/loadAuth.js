define(function(){
    var ipinAuth = {
        setIframeWh:function(w,h){
            if(ipinAuth.divEl){
                $(ipinAuth.divEl).remove();
            }
            ipinAuth.iframeEl.style.visibility="visible"; 
            ipinAuth.iframeEl.width=+w; 
            ipinAuth.iframeEl.height=+h;
            ipinAuth.iframeEl.style.zIndex=10001;//太高会遮挡 ui.message.alert 控件
        },
        callback:function(){},
        changeStats:function(methodStr){
            console.log("methodStr>>>",methodStr)
            var arr = methodStr.split(":");
            var method = arr[0];
            var opt = [];
            if(arr.length > 1){
                opt = arr[1].split("|");
            }
            switch(method){
                case 'close':
                    $(this.iframeEl).remove();
                    this.maskEl.remove();
                    break;
                case 'reset':
                    this.setIframeWh(opt[0],opt[1]);
                    ipinAuth.center();
                    break;
                case 'reload':
                    location.reload(1);
                    break;
                case 'login':
                    location.href=decodeURIComponent(opt[0]);
                    break;
            }
            this.callback(method);
        },
        existShow:function(){
            if(this.iframeEl){
                if(!$("#ipin-login-sheet-iframe").length){
                    $("body").append(this.maskEl);
                    $("body").append(this.iframeEl);
                }
                $(this.maskEl).css("display","block");
                $(this.iframeEl).css("display","block");
                return true;
            }else{
                return false;
            }
        },
        loginBox:function(url,clientOption){
            //if(!this.existShow()){FIREFOX 初始化可能报错，或者隐藏元素的尺寸获取不到导致预加载的窗口尺寸为0,关闭预加载
                var url = url || location.href;
                var subCallback = "http://"+location.host+"/proxy.do?callback="+encodeURIComponent(url);
                var iframeCfg = {
                    height:465,
                    width:500,
                    src:"http://www.ipin.com/account/auth?callback="+encodeURIComponent(subCallback)
                };
                this.loadIframe(iframeCfg,clientOption);
            //}
            
        },
        regBox:function(url,clientOption){
            //if(!this.existShow()){
                var url = url || location.href;
                if(url.indexOf('?')>-1){
                    url+='&registered';
                }else{
                    url+='?registered';
                }

                var subCallback = "http://"+location.host+"/proxy.do?callback="+encodeURIComponent(url);
                var iframeCfg = {
                    height:465,
                    width:500,
                    src:"http://www.ipin.com/account/auth?regbox=1&callback="+encodeURIComponent(subCallback)
                };
                this.loadIframe(iframeCfg,clientOption);
            //}
        },
        setRole:function(clientOption){
            var iframeCfg = {
                height:409,
                width:500,
                src:"http://www.ipin.com/account/auth?setRole=1&domain="+encodeURIComponent("http://"+location.host+"/")
            };
            this.loadIframe(iframeCfg,clientOption);
        },
        pwdBox:function(url,clientOption){
            //if(!this.existShow()){
                var url = url || location.href;
                var subCallback = "http://"+location.host+"/proxy.do?callback="+encodeURIComponent(url);
                var iframeCfg = {
                    height:465,
                    width:500,
                    src:"http://www.ipin.com/account/auth?boxtype=changePwd&callback="+encodeURIComponent(subCallback)
                };
                this.loadIframe(iframeCfg,clientOption);
            //}
        },
        loadIframe:function(cfg,clientOption){
            var iframe = document.createElement("iframe");
            iframe.src=cfg.src;
            $(iframe).attr("frameborder",0);
            iframe.scrolling="no"
            iframe.height = cfg.height||409;
            iframe.width= cfg.width||500;
            iframe.style.visibility="hidden";
            iframe.style.position="absolute";
            iframe.id="ipin-login-sheet-iframe";
            var div = document.createElement("div");
            $(div).css({
                height:409,
                width:500,
                background:"#fff",
                zIndex:10000
            }).html(" <img style='margin-left:230px;margin-top:184.5px' src='http://www.ipin.com/images/loadding-2.gif'> ");
            this.divEl = div;
            this.maskEl = $("<div class='mask' id='ipin-login-sheet-mask'></div>");
            this.maskEl.appendTo('body');

            if(clientOption&&clientOption.hide){
                $(this.divEl).css("display","none");
                $(this.maskEl).css("display","none");
                $(iframe).css("display","none");
            }


            $(div).appendTo('body');
            
            
            this.center(null,div);
            if (window.addEventListener) 
                window.addEventListener("resize", ipinAuth.center, false); 
            else if (window.attachEvent) 
                window.attachEvent("resize", ipinAuth.center); 
            $(iframe).appendTo('body');
            this.iframeEl = iframe;
        },
        center : function(e,el){
            var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            el = el || ipinAuth.iframeEl;
            el.style.position = 'absolute';
            el.style.left = (scrollLeft  + (clientWidth - $(el).outerWidth())*.5)+"px";
            el.style.top = (scrollTop +(clientHeight - $(el).outerHeight())*.5)+"px";
            ipinAuth.maskEl.height($(window).height());
        },
        init:function(){
            var idx = location.host.lastIndexOf("ipin.com")
            if(location.host.substr(idx) == "ipin.com"){
                document.domain="ipin.com";
            }
        }
    }

    var addEvent = function(eventType,node,fn){
        if(window.addEventListener){
            node.addEventListener(eventType,fn,false);
        }else{
            node.attachEvent("on"+eventType,fn);
        }
    }

    if('postMessage' in window){//主要用于跨域登录组件的消息通知 by linhuabiao,date:2016.5.25
        addEvent("message",window, function( e ) { 
           var data = e.data;
           if(data.slice(0,7)=='reload:'){
                window.location.href = data.slice(7);
           }
           
        }); 
    }

    window.ipinAuth = ipinAuth;
    ipinAuth.init();
});
