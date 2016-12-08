var log4js = require("log4js");
var levels = require("log4js/lib/levels");
var fs = require("fs");
var path = require("path");
var Lodash = require('lodash');
var Counter = require('passthrough-counter');
/*var DEFAULT_FORMAT = '[:sessionid][:uid] :remote-addr - -' +
  ' ":method :url HTTP/:http-version"' +
  ' :status :content-length ":referrer"' +
  ' ":user-agent"';*/
var DEFAULT_FORMAT = '[date::date,uid::uid,vip_flag::vip_flag,vip_expire::vip_expire,sid::sessionid,ip::remote-addr,url::method :url HTTP/:http-version,resquest_time::response-time,refferer::referrer,agent::user-agent,req-content-type::content-type,res-content-type::content-type,size::content-length,status::status]'

log4js.configure({
    appenders: [
        {
            type: "file",
            filename: 'logs/log.log',
            maxLogSize:1024*1024*1024*100,
            backups: 1,
            category: 'url',
            layout:{
              type:"pattern",
              pattern:"%d %m"
            }
        },
        {
            type: "file",
            filename: 'logs/detail.log',
            maxLogSize:1024*1024*1024*100,
            backups: 1,
            category: 'detail',
            layout:{
              type:"pattern",
              pattern:"%d %m"
            }
        },
        {
            type: "file",
            filename: 'logs/err.log',
            maxLogSize:1024*1024*1024*100,
            backups: 1,
            category: 'err',
            layout:{
              type:"pattern",
              pattern:"%d %m"
            }
        }
    ],
    levels:{
        url: 'debug'
    }
});

function checkAndCreateDir(dir){  
    if(!fs.existsSync(dir)){  
        fs.mkdirSync(dir);  
    }  
} 
checkAndCreateDir(path.dirname('logs/log.log'));

var urlLogger = log4js.getLogger('url');
var errLogger = log4js.getLogger('err');


function log(){
    console.log.apply(console,arguments)
}

function _log(debug,level,msg,errMsg){
    if(debug){
        log(' \x1B[90m %s\x1B[0m',msg);
    } else {
        if(errMsg){
            errLogger.log(level,msg+errMsg);
        } else {
            urlLogger.log(level,msg);
        }
    }
}

function getLogger(debug,options) {
    if ('object' == typeof options) {
        options = options || {};
    } else if (options) {
        options = { format: options };
    } else {
        options = {};
    }
    if(debug){
        DEFAULT_FORMAT = ":method :url :status :response-timems";
    }
    var thislogger = urlLogger;
    
    var level = levels.toLevel(options.level, levels.INFO)
        , fmt = options.format || DEFAULT_FORMAT
        , nolog = options.nolog ? createNoLogCondition(options.nolog) : null
        , sessionUidKey = options.sessionUidKey || "";

    function log(ctx, start, len, err, event){
        var status = err? (err.status || 500): (ctx.status || 404);
        var length;
        var errMsg = "";
        if (~[204, 205, 304].indexOf(status)) {
            length = 0;
        } else if (null == len) {
            length = '-';
        } else {
          length = len;
        }
        if(err){
          errMsg = err.stack || err.toString();
        }
        if(debug && status == 304)return;
        if(options.level === 'auto'){
            level = levels.INFO;
            if(status >= 300) level = levels.WARN;
            if(status >= 400) level = levels.ERROR;
        }
        if (thislogger.isLevelEnabled(level)) {
            var combined_tokens = assemble_tokens(ctx,length,start,status,sessionUidKey,options.tokens || []);
            if (typeof fmt === 'function') {
                var logmsg = fmt(req, res, function(str){ return format(str, combined_tokens); });
                if (logmsg){
                    _log(debug,level,logmsg,errMsg);
                }
            } else {
                _log(debug,level,format(fmt, combined_tokens),errMsg);
            }
        }
    }

  return function *(next) {
    // mount safety
    var ctx = this;
    if (ctx._logging) return  yield next;
        if (nolog && nolog.test(ctx.href)) return yield next;
        if (thislogger.isLevelEnabled(level) || options.level === 'auto') {
            ctx._logging = true;
            var start = new Date;
            try {
                yield next;
            } catch (err) {
                log(ctx, start, null, err);
                throw err;
            }
            var length = this.length;
            var body = this.body;
            var counter;
            if (null == length && body && body.readable) {
                this.body = body
                    .pipe(counter = Counter())
                    .on('error', this.onerror);
            }
            var res = this.res;
            var onfinish = done.bind(null, 'finish');
            res.once('finish', onfinish);
            function done(event){
                res.removeListener('finish', onfinish);
                log(ctx, start, counter ? counter.length : length , null);
            }
        }
    };
}


function assemble_tokens(ctx,length,start,status,sessionUidKey,custom_tokens) {
  var array_unique_tokens = function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i].token == a[j].token) { // not === because token can be regexp object
          a.splice(j--, 1);
        }
      }
    }
    return a;
  };
  var uid = '';
  if(ctx.session && sessionUidKey){
    var keyArr = sessionUidKey.split('.');
    var obj = ctx.session;
    try{
        keyArr.forEach(function(k){ obj = obj[k] });
        uid = obj
    }catch(e){
        uid = '-err-'
    }
  }
  var default_tokens = [];
  default_tokens.push({ token: ':uid', replacement: uid });
  default_tokens.push({ token: ':sessionid', replacement: ctx.sessionId||"-null-" });
  default_tokens.push({ token: ':url', replacement: ctx.url });
  default_tokens.push({ token: ':protocol', replacement: ctx.protocol });
  default_tokens.push({ token: ':hostname', replacement: ctx.hostname });
  default_tokens.push({ token: ':method', replacement: ctx.method });
  default_tokens.push({ token: ':status', replacement: status });
  default_tokens.push({ token: ':response-time', replacement: new Date - start });
  default_tokens.push({ token: ':date', replacement: new Date().toUTCString() });
  default_tokens.push({ token: ':referrer', replacement:  ctx.get('referer') });
  default_tokens.push({ token: ':http-version', replacement: ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor });
  default_tokens.push({ token: ':remote-addr', replacement: ctx.req.headers['x-forwarded-for'] || ctx.req.ip || ctx.req._remoteAddress ||
    (ctx.req.socket && (ctx.req.socket.remoteAddress || (ctx.req.socket.socket && ctx.req.socket.socket.remoteAddress))) });
  default_tokens.push({ token: ':user-agent', replacement: ctx.req.headers['user-agent'] });
  default_tokens.push({ token: ':content-length', replacement: length});
  default_tokens.push({ token: /:req\[([^\]]+)\]/g, replacement: function(_, field) {
    return ctx.req.headers[field.toLowerCase()];
  } });
  default_tokens.push({ token: /:res\[([^\]]+)\]/g, replacement: function(_, field) {
    return ctx.res._headers ?
      (ctx.res._headers[field.toLowerCase()] || ctx.res.__headers[field])
      : (ctx.res.__headers && ctx.res.__headers[field]);
  } });

  return array_unique_tokens(custom_tokens.concat(default_tokens));
};


function format(str, tokens) {
  return Lodash.reduce(tokens, function(current_string, token) {
    return current_string.replace(token.token, token.replacement);
  }, str);
}

function createNoLogCondition(nolog) {
  var regexp = null;

    if (nolog) {
    if (nolog instanceof RegExp) {
      regexp = nolog;
    }

    if (typeof nolog === 'string') {
      regexp = new RegExp(nolog);
    }

    if (Array.isArray(nolog)) {
      var regexpsAsStrings = nolog.map(
        function convertToStrings(o) {
          return o.source ? o.source : o;
        }
      );
      regexp = new RegExp(regexpsAsStrings.join('|'));
    }
  }

  return regexp;
}


module.exports = getLogger;
