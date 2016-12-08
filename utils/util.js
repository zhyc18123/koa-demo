var util = require("util");
var userAgent = require("./userAgent");
var log4js = require("log4js");
var ONE_DAY_MS = 86400000;

function cookieExpires(ms){
    return new Date(Date.now() + ms);
}

function log(){
    console.log.apply(console,arguments)
}

function extend(){
    return util._extend.apply(util,arguments);
}

function fileLog(msg){
    var detailLogger = log4js.getLogger('detail');
    detailLogger.info(msg);
}

function parseUserAgent(source){
    return userAgent.parse(source);
}

function dateFormat(date,formatStr,frag){
    if(typeof(date)=='string'){
        date = date.replace(/\-/g,'/');
    }else{
        date = date*1;
    }
    var oDate = new Date(date);
    if(!oDate){
        return oDate+'';
    }

    var parseInfo = {
        y:oDate.getFullYear(),
        m:oDate.getMonth(),
        d:oDate.getDate(),
        w:oDate.getDay(),
        h:oDate.getHours(),
        i:oDate.getMinutes(),
        s:oDate.getSeconds(),
        c:oDate.getMilliseconds(),
        z:oDate.getTimezoneOffset()/60,
    }
    
    formatStr = formatStr||'%y/%m/%d %h:%i:%s';
    frag = !!frag||true;//默认两位数日期数字

    return formatStr.replace(/%([ymdwhiscz])/gi,function(m,c){
        var n = parseInfo[c];
        if(c=='m'){
            n = n+1;
        }
        if(frag&&n<10&&('mdhis').indexOf(c)>-1){
            n = '0'+n;
        }else if(c=='w'){
            n = '星期'+('日一二三四五六').charAt(n);
        }
        
        return n;
    });
}

function fixedTimezone(timestampe,timezone){
    timezone = timezone||8;
    var oDate = new Date(timestampe);
    var curTimeZone = oDate.getTimezoneOffset()/60;
    var diffTimeZone = curTimeZone + timezone;
    return oDate*1+diffTimeZone*60*60*1000;//过期时间以北京时间为准
}

var outKey= {
    cookieExpires:cookieExpires,
    ONE_DAY_MS:ONE_DAY_MS,
    log:log,
    extend:extend,
    fileLog:fileLog,
    parseUserAgent:parseUserAgent,
    fixedTimezone:fixedTimezone,
    dateFormat:dateFormat
}

Object.keys(util).forEach(function(k){
    if( k.startsWith("is")){
        outKey[k] = function(){
            return util[k].apply(util,arguments)
        }
    }
})

module.exports = outKey;