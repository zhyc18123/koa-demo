/*
author:ecalf
blog:http://www.cnblogs.com/ecalf/archive/2012/11/24/2786592.html
*/
function baseCode(skip){
    skip = Math.abs(parseInt(skip))%10; // 0-9
    var base64Code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*-";
    if(!skip){
        return base64Code;
    }

    var code1 = base64Code.slice(0,-2).split('');
    var code2 = [];
    var index = 0;
    while(code1.length){
        code2.push(code1.splice(index,1));
        index = (index+skip)%code1.length;
    }

    return code2.join('')+'+/';

}

var Base64 = {
    encode:function (str){//base64编码
        var skip = parseInt(Math.random()*10)||1; //1-9,如果使用原始 base64，skip 设为 0
        var base64Code = baseCode(skip);
        var bitArr = str.split('').map(function(v){ return (Array(8).join(0)+v.charCodeAt(0).toString(2)).slice(-8) });
        var tailCount = (3-bitArr.length%3)%3;
        var encodeStr = bitArr.concat(Array(tailCount+1).join('00000000').match(/\d{8}/g)).join('').match(/\d{6}/g).map(function(v){ return base64Code[parseInt(v,2)]; }).join('').replace(new RegExp('\\w{'+tailCount+'}\$'),Array(tailCount+1).join('='));
        return String.fromCharCode(('a').charCodeAt(0)+skip)[['toLowerCase','toUpperCase'][skip%2]]()+encodeStr;
    },
    decode:function(base64Str){//base64解码    
        var skip = base64Str.charAt(0).toLowerCase().charCodeAt(0)-('a').charCodeAt(0);
        base64Str = base64Str.slice(1);
        var base64Code = baseCode(skip);
        var tailCount = (base64Str.match(/\=+$/)||[''])[0].length;
        return base64Str.replace(/\=/g,base64Code[0]).split('').map(function(v){
            return (Array(6).join(0)+base64Code.indexOf(v).toString(2)).slice(-6)
        }).slice(0,base64Str.length-tailCount ).join('').match(/\d{8}/g)
            .map(function(v){
                return String.fromCharCode(parseInt(v,2));
        }).join('');
    }
};

module.exports = {
	encode:Base64.encode,
	decode:Base64.decode
}

/*// test
var str = 'http://www.stonline.com/elearning/my#';
var encodeStr = Base64.encode(str);
var decodeStr = Base64.decode(encodeStr);

console.log('str>>>',str);
console.log('encodeStr>>>',encodeStr);
console.log('decodeStr>>>',decodeStr);
console.log('str==decodeStr>>>',str==decodeStr);*/
