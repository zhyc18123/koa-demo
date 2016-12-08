'use strict'
const Qr = require("qr-image");
const Loc = load("provider/data/loc");
const Router = require('koa-router')();
const _ = require('lodash')


function noop(){}


module.exports = {
    simplelog:function *(txt,filepath){
        var fs= require('fs');
        filepath = filepath||'src/res/temp/test.log';

        return yield function (fn){ 
            fs.appendFile(filepath, '\r\n'+txt, function (err) {
                fn(err,'file is saved to '+filepath)
            });
        }
        
    },

    returnJsBody:function(data,code) {
        return{
            code:code||200,
            data:data||{}
        }
    },

    returnQRimg:function(aid,imgStr,type){
        var res = aid.ctx.res;
        type = type||'image/png';
        try {
            var img = Qr.image(imgStr);
            res.writeHead(200, {'Content-Type': type});
            img.pipe(res);
        } catch (e) {
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.end('<h1>二维码生成失败</h1>');
        }
        return false;
    },



    
    getUserIP:function(aid){
        var req = aid.ctx.req;
        var ip = req.headers['x-forwarded-for'] ||
        req.connection&&req.connection.remoteAddress ||
        req.socket&&req.socket.remoteAddress ||
        req.connection&&req.connection.socket&&req.connection.socket.remoteAddress||
        aid.ctx.ip;

        return ip;
    },


    getSession:function(aid,name,def){
        var val = aid.ctx.session[name];
        
        return val !== undefined ? val : def;
    },
    

    urlInit:function(urlMgr){
        urlMgr.jsView = urlMgr.jsView || noop;
        urlMgr.view = urlMgr.view || noop;
        urlMgr.subDir = urlMgr.subDir || noop;
        urlMgr.app = null;
        urlMgr.parent = "";
        urlMgr._route = function(method,args){
            args = [].slice.call(args,0);
            if(args[0].indexOf("/")==0){
                args[0] = this.parent + args[0];
            }else{
                args[1] = this.parent + args[1];
            }

            // if _fn is not GeneratorFunction
            if(typeof(args[args.length-1])!='GeneratorFunction'){
                var _fn = args[args.length-1];
                var fn = function*(){
                    yield _fn.apply(this, arguments);
                }
                args[args.length-1] = fn;
            }
             
            Router[method].apply(Router,args);
        }

        urlMgr.get = function(){this._route('get',arguments);}
        urlMgr.post = function(){this._route('post',arguments);}
        urlMgr.all = function(){this._route('all',arguments);}
        urlMgr.init = function(){
            this.view();
            this.jsView();
            this.subDir();
        }
        return function(parent,app){
            if( typeof parent != "string" ){
                app = parent;
                parent = "";
            }
            urlMgr.app = app;
            urlMgr.parent = parent;
            urlMgr.init();
            app.use(Router.routes())
        };
    },


    toArr:function (o){
        if (typeof o == 'object') {
            return o
        } else {
            if (!o)
                return []
            else
                return [o]
        }
    },

    rejectSearchKey: function(str, key) {
        var pattern = new RegExp('[?&]' + key +'=[^&]+', 'g')
        return str.replace(pattern, '')
    },

    addUrlPrefix: function (url) {
        const domainReg = /^(https?:\/\/)?(\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        const hasPrefixReg = /^(https?:\/\/)|^(\/\/)/
        if (domainReg.test(url) && !hasPrefixReg.test(url)) {
            url = 'http://' + url
        }
        return url
    },

    toFullPid:function (numOrStr){
        if (numOrStr.toString().length === 12)
            return numOrStr
        else if (numOrStr.toString().length === 2)
            return numOrStr + '0000000000'
    },



    /*用于将字符串转为html文档片段,需要注意的是,转化之后还是可能存在&nbsp;,
      因为&nbsp;可以存在于html文档中,需要再次转换才能彻底去掉这些特殊字符.
      当匹配到{amp':'&}就会出现这种情况.
      */
    escape2Html: function(str) {
        var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"','ldquo':'"','rdquo':'"'};
        return str.replace(/&(lt|gt|nbsp|amp|quot|ldquo|rdquo);/ig,function(all,t){return arrEntities[t];});
    },

    routerUrl: function (){
        const validSearchKeys = ['diploma', 'rankingType', 'year', 'province', 'page', 'ty',
             'searchKey', 'sort_by', 'major_category', 'major_second_category','province_filter',
             'major_second_category_filter','major_filter','batch','exam_id','filter_subject','grade',
             'filter_type','filter_prov']
        const keysLen = validSearchKeys.length
        let params = arguments[1]
        let searchStr  = ''
        if (typeof params == 'object') {
            searchStr = validSearchKeys.reduce((rv, key, i )=> {
                if (params[key]) {

                    // if diploma == 7 省略
                    if (!(key == 'diploma' && params[key] == '7')) {
                        rv  = rv + key + '=' + params[key] + '&'
                    }
                }
                return rv
            }, '')

            // 去掉最后的 &
            if (~searchStr.lastIndexOf('&')) searchStr = searchStr.slice(0, searchStr.length-1)

            // 如果不为空就加上 ?
            searchStr = searchStr ? ('?' + searchStr) : ''
        }

        return Router.url.apply(Router, arguments) + searchStr
    }
}
