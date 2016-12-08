var Dispenser = load("router/dispenser");

function escapeXML(markup){
    var _ENCODE_HTML_RULES = {
      '&': '&amp;'
    , '<': '&lt;'
    , '>': '&gt;'
    , '"': '&#34;'
    , "'": '&#39;'
    }
  , _MATCH_HTML = /[&<>\'"]/g;

    function encode_char(c) {
      return _ENCODE_HTML_RULES[c] || c;
    };


    return markup == undefined
        ? ''
        : String(markup)
            .replace(_MATCH_HTML, encode_char);

}

function *err500(next){
    try {
        yield next;
    } catch (err) {
        console.log("err500>>>",err);
        this.status = err.status || 500;

        if(this.state.vars._webConf_debug){
            var msg = err.stack || err.toString();
            var body = '<html><head><meta charset="UTF-8"></head><body><p>Error 500</p><p>'+escapeXML(msg).replace(/\n/g,"<br/>") +'</p></body>';
            this.type = 'html';
            this.body = body;
        } else {
            yield Dispenser.page500(this);
        }
        this.app.emit('error', err, this);
    }
}

function *err404(next){
    yield next;
    if (404 != this.status) return;
    console.log("err404>>>",this.request.url);
    if(this.state.vars._webConf_debug){
        var text = "404 页面未找到！";
        var body = '<html><head><meta charset="UTF-8"></head><body><p>'+text+'</p></body></html>';
        switch (this.accepts('html', 'json')) {
            case 'html':
                this.type = 'html';
                this.body = body;
            break;
                case 'json':
                this.body = {
                    message: text
                };
                break
            default:
                this.type = 'text';
                this.body = text;
        }
        
    } else {
        yield Dispenser.page404(this);
    }
}

function *yunwei(next){
    if(this.state.vars.yunwei){
        //let static file pass
        if(this.request.method!='GET'||(/\.(?:gif|jpe?g|png|css|js|woff\d|ttf|eot)(?:\?v?=?\w+)?$/i).test(this.request.url)==false){
            this.status = 403;
            if(!this.state.vars.yunweiEndTime){
                var date = new Date();
                var y = date .getFullYear();
                var m = date .getMonth();
                var d= date.getDate();
                var defaultH = 5;
                var timeZoom = date.getTimezoneOffset()/60;
                var diffTimeZoom = timeZoom + 8;
                var endTime = new Date(y,m,d+1,defaultH,0,0)*1+diffTimeZoom*60*60*1000;//以北京时间为准
                this.state.vars.yunweiEndTime = new Date(endTime).toLocaleString();
            }
            yield Dispenser.yunwei(this);
        }else{
            yield next;
        }
        
    }else{
        yield next;
    }
}

function *browserCheck(next){
    if(this.state.vars.ua.isIE&&this.state.vars.ua.version<8){
        //this.status = 403;
        yield Dispenser.browser(this);
    }else{
        yield next;
    }
}

function *mobileCheck(next){
    var mobileAgent = new Array("iphone", "ipod", "ipad", "android", "mobile", "blackberry", "webos", "incognito", "webmate", "bada", "nokia", "lg", "ucweb", "skyfire");
    var userAgent = this.request.headers['user-agent'];
    var browser = userAgent.toLowerCase();
    var isMobile = false;
    var mobileURL = 'http://m.wmzy.com';

    for (var i=0; i<mobileAgent.length; i++){
        if (browser.indexOf(mobileAgent[i])!=-1){
            isMobile = true;
            break;
        }
    }

    if(isMobile){
        this.redirect(mobileURL);
    }else{
        yield next;
    }
}



module.exports = {
    err404,
    err500,
    yunwei,
    browserCheck,
    mobileCheck
}