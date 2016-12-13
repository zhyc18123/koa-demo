global.load = function(moduleName) {
    return require("./" + moduleName)
}
var RenderEngine = require('koa-ejs');
var WebAid = require("web-aid");
var ModelProxy = require('modelproxy');
var GetLogger = load("utils/log");
var Util = load('utils/util');
var UtilFn = load("utils/utilFn");

global.WebAid = WebAid;
global.ModelProxy = ModelProxy;
global.utilFn = UtilFn;
global.Util = Util;
global.pin = {
    util : Util,
    fileLog: Util.fileLog
};
global.vipRedirect = webConf.vipRedirect;
global.yunwei = webConf.yunwei; 


module.exports = {
    init: function() {
        var app = require('koa')();
        app.experimental = true; //allow ECMAScript 2016 (ES7)
        app.proxy = true;//allow X-Forwarded-Host X-Forwarded-For X-Forwarded-Proto HTTP proxy header

        //初始化
        this.initDataInterface();
        this.initRender(app);
        this.loadGzip(app);
        this.loadStatic(app);

        //加载过滤器
        //this.loadSession(app);
        //this.loadRedisCache(app);
        this.loadDebug(app);
        this.loadLog(app);
        this.loadUserAgent(app);
        this.loadPageVars(app);
        
        this.loadErr(app);
        this.loadUrlParam(app);
        this.loadUrl(app);
        this.cache(app);

        app.listen(webConf.port, webConf.hosts);
        console.log("服务启动：%s:%s", webConf.hosts, webConf.port);
    },
    initDataInterface:function(){
        ModelProxy.init(webConf.interfaceFile,webConf.interfaceStatus);
    },
    initRender: function(app) {
        RenderEngine(app, {
            root: __dirname +"/views",
            viewExt: 'ejs',
            debug: webConf.debug,
            _with:false,//不使用 with 语法，模板引擎速度更快
            layout: false,
            cache: false,
            writeResp:false, //app.render(tpl,data) will return htmlStr
            filters: load("./utils/ejs-filters")
        });
    },
    loadPageVars:function(app){
        //static url do not need to use this middleware
        app.use(function*(next){
            var userInfo = {uid:0}; //this.session['userInfo']||{uid:0};
            var vars = {
                _resource_version: webConf._resource_version,
                _webConf_debug:webConf.debug,
                yunwei:webConf.yunwei,
                yunweiEndTime:webConf.yunweiEndTime,
                vipRedirect:webConf.vipRedirect,
                vipHost:webConf.vipHost,
                serverName:webConf.serverName,
                host:this.request.header.host,
                urlInfo:this.req._parsedUrl,
                authorization:{
                    userInfo:userInfo,
                    isLogin:!!userInfo.uid
                }
            }
            
            this.state.vars=Util.extend(this.state.vars||{},vars);
            yield next;
        });
        
        var CommonMiddleware = load("middleware/common");
        app.use(CommonMiddleware.location);
    },
    loadUrlParam:function(app){
        var requestParams = require("request-params");
        app.use(requestParams);
    },
    loadStatic:function(app){
        var staticCache = require('koa-static-cache');
        console.log("loadStatic path>>>",__dirname+ '/public/'+(webConf.debug?"src":"src"));
        app.use(staticCache(__dirname + '/public',{gzip:true,maxAge:Util.ONE_DAY_MS * 7}));
        app.use(staticCache(__dirname + '/public/'+(webConf.debug?"src":"src"),{gzip:true,maxAge:Util.ONE_DAY_MS * 7}));
        app.use(staticCache(__dirname + '/seo/',{gzip:true,maxAge:Util.ONE_DAY_MS * 30}));
    },
    loadGzip:function(app){
        app.use(require('koa-gzip')());
    },
    loadDebug:function(app){
        webConf.debug && app.use(function*(next){
            this.debugId = parseInt(Math.random() * 1000000);
            yield next;
        })
    },
    loadErr:function(app){
        var ErrorMiddleware = load("middleware/error");
        app.use(ErrorMiddleware.yunwei);
        //app.use(ErrorMiddleware.mobileCheck);
        //app.use(ErrorMiddleware.browserCheck);
        app.use(ErrorMiddleware.err500);
        app.use(ErrorMiddleware.err404);
    },
    loadLog:function(app){
        // nolog
        // format
        // level
        //sessionUidKey
        app.use(GetLogger(webConf.debug,{sessionUidKey:"userInfo.uid"}));
    },
    loadUserAgent:function(app){
        app.use(function*(next){
            this.__defineGetter__('ua', function () {
                return Util.parseUserAgent(this.get("user-agent"));
            });
            this.state.vars=Util.extend(this.state.vars||{},{ua:this.ua});
            yield next;
        });
    },
    loadSession:function(app){
        var session = require('session-redis');
        app.use(session({
            store: webConf.redisOpt,
            key:"sessionid",
            cookie:{
                httpOnly:false,
                maxage:Util.ONE_DAY_MS * 7
            },
            secret:webConf.sessionSecret
          }
        ));
    },
    loadRedisCache:function(app){
        var RedisCacheData = load('provider/redisCacheData');
        global.RedisCacheData = RedisCacheData(webConf.redisOpt,webConf.cacheOption);  
    },
    cache:function(app){
        app.use(function*(next){
            this.set('Cache-Control','max-age=60');//cache x seconds
            yield next;
        })
    },
    loadUrl: function(app) {
        load("router/url")(app);
    }
}