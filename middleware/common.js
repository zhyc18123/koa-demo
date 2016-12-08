var Qqwry = require("node-qqwry");
var Loc = load("provider/data/loc");
        
function* location(next){
    var provId = "44",provName="广东",cityId = "440300000000",cityName="深圳";
    var ip = utilFn.getUserIP({ctx:this})||this.ip;

    try{
        var rv = eval( Qqwry.getArea( ip ) );
        var prov = Loc.getProv(rv.area[0].slice(0,-1));
        if(prov){
            provId = prov.pid;
            provName = prov.name;
            cityName = "";
            cityId="";

        }
        var city = Loc.getCityInfoByName(rv.area[1].slice(0,-1));
        if(city){
            cityName = city.loc_namecn;
            cityId = city.loc_id;
        }

    }catch(e){}

    var location = {
        ip:ip,
        provId:provId,
        provName:provName,
        cityId:cityId,
        cityName:cityName
    }
   

    this.state.vars=Util.extend(this.state.vars||{},{location:location});
    yield next;
}

function* oem(next){
    var host = this.request.header.host;
    var oemName = 'official';//guanfang

    if(host=='eol.wmzy.com'){
        oemName = 'eol';
    }else if(host=='xdf.wmzy.com'){
        oemName = 'xdf';
    }else if(host=='shenzhong.wmzy.com'){
        oemName = 'shenzhong';
    }else if(host.indexOf('gkhrtech')>-1||(/^183\.56\.160[\d.]+$/).test(host)){//ip
        oemName = 'gkhr';
    }else{
        oemName = 'official';
    }

    var oem = {
        name:oemName
    }

    this.state.vars=Util.extend(this.state.vars||{},{oem:oem});
    yield next;
}

function chkLogin(isAjax){
    return function* (next){
        if(this.state.vars.authorization.isLogin){
            yield next;
        }else{
            var msg = "please login";
            var referrer = this.request.url;
            this.status = 401;
            this.body = isAjax=='ajax'?{code:401,msg:msg,referrer:referrer}:msg
        }
    }
}

function chkVip(isAjax){
    return function* (next){
        if(this.state.vars.authorization.isVip){
            yield next;
        }else{
            var msg = "vip user only";
            var referrer = this.request.url;
            this.status = 401;
            this.body = isAjax=='ajax'?{code:401,msg:msg,referrer:referrer}:msg
        }
    }
}



module.exports = {
	location,
	chkLogin,
	chkVip,
    oem
}