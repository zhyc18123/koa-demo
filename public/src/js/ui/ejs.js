define(function(){
    var Tpl = {}
    var regTpl = /\{(\.?[\w_$]+)(\.[\w_$]+)?(\.?[\w_$]+)?\}/g;
    var ifRegTpl = /\[\?(!?)(\.[\w_$]+)(\.?[\w_$]+)?(\.?[\w_$]+)?\?([\S\s]*?)\?\]/g;

    var uID = new Date()*1;
    function getUID(){
        return ++uID;
    }

    Tpl.tpls = {};
    Tpl.parse  =  function(tpl,map){
        var self = this;
        !map && ( map = {} );
        if(tpl.charAt(0) !== '<'){
            var t = self.tpls[tpl];
            t && (tpl = t);
        }
        tpl = tpl.replace(ifRegTpl,function(s,s0,s1,s2,s3,s4){
            var v = map[s1.substr(1)];
            if(s2){
                v = s2.charAt(0) =='.' ? v[s2.substr(1)] :v;
            }

            if(s3){
                v = s3.charAt(0) =='.' ? v[s3.substr(1)] :v;
            }
            if(s0 === '!'){
                return !v?s4:"";
            }
            return v?s4:'';
        });
        
        return tpl.replace(regTpl,function(s,s0,s1,s2){
            var v = s0.charAt(0) == '.' ? map[s0.substr(1)] : self.tpls[s0];
            if(v == void 0) return '';
            
            if(s1){
                v = s1.charAt(0) =='.' ? v[s1.substr(1)] :v;
            }

            if(s2){
                v = s2.charAt(0) =='.' ? v[s2.substr(1)] :v;
            }
            
            if(v && ( v.toString().charAt(0) === '<'  ||  v.toString().substr(0,2) == "[?") )
                return Tpl.parse(v, map);
            
            if(self.tpls[v])
                return Tpl.parse(self.tpls[v], map);
            
            v = v === void 0 ? '' : v;

            return v;
            
        });
    }
    
    Tpl.ejs = function( tpl,data,opts){
        opts = opts ||{};
        //opts.tid = tpl;
        var fn = Tpl.ejs.compile( Tpl.parse(tpl,data), opts );
        return fn( data );
    };

    Tpl.ejs.cache = {};

    Tpl.ejs.filters = {//用于添加各种过滤器
        contains: function (target, str, separator) {
            return separator ? (separator + target + separator).indexOf(separator + str + separator) > -1 : target.indexOf(str) > -1;
        },
        truncate: function (target, length, truncation) {
            length = length || 30;
            truncation = truncation === void 0 ? "..." : truncation;
            return target.length > length ? target.slice(0, length - truncation.length) + truncation : String(target);
        },
        camelize: function (target) {
            if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
                return target;
            }
            return target.replace(/[-_][^-_]/g, function (match) {return match.charAt(1).toUpperCase();});
        },
        escape: function (target) {
            return target.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        },
        unescape: function (target) {
            return target.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#([\d]+);/g, function ($0, $1) {return String.fromCharCode(parseInt($1, 10));});
        },
        floor:function(target){
            var target = Math.floor(target);
            return isNaN(target) ? 0 : target;
        }

    };


    Tpl.ejs.compile = function( source, opts){
        opts = opts || {};
        var tid = opts.tid;
        if(typeof tid === "string" && typeof Tpl.ejs.cache[tid] == "function"){
            return Tpl.ejs.cache[tid];
        }
        var open  = !opts.open  ? "<%" : "<&";
        var close = !opts.close ? "%>" : "&>";
        var helperNames = [], helpers = [];
        for(var name in opts){
            if(opts.hasOwnProperty(name) && typeof opts[name] == "function"){
                helperNames.push(name);
                helpers.push( opts[name] );//收集所有helper!
            }
        }
        if(opts.userFn){
            helperNames.push("userFn");
             helpers.push( opts.userFn );
        }
        var flag = true;//判定是否位于前定界符的左边
        var codes = []; //用于放置源码模板中普通文本片断
        var tid = getUID();// 时间截,用于构建codes数组的引用变量
        var prefix = " ;r += txt"+ tid +"["; //渲染函数输出部分的前面
        var postfix = "];";//渲染函数输出部分的后面
        var t = "return function (data){ try{var r = '',line"+tid+" = 0;";//渲染函数的最开始部分
        var rAt = /(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g;
        var rstr = /(['"])(?:\\[\s\S]|[^\ \\r\n])*?\1/g ;
        var rtrim = /(^-|-$)/g;
        var rmass = /mass/;
        var js = [];
        var pre = 0, cur, code, trim;
        for(var i = 0, n = source.length; i < n; ){
            cur = source.indexOf( flag ? open : close, i);
            if( cur < pre){
                if( flag ){//取得最末尾的HTML片断
                    t += prefix + codes.length + postfix;
                     if(cur == -1 && i == 0){
                        code = source;
                    }else{
                        code = source.slice( pre+ close.length );
                    }
                  //  code = source.slice( pre+ close.length );
                    if(trim){
                        code = code.trim();
                        trim = false;
                    }
                    codes.push( code );
                }else{
                    console.log("发生错误了");
                }
                break;
            }
            code = source.slice(i, cur );//截取前后定界符之间的片断
            pre = cur;
            if( flag ){//取得HTML片断
                t += prefix + codes.length + postfix;
                if(trim){
                    code = code.trim();
                    trim = false;
                }
                codes.push( code );
                i = cur + open.length;
            }else{//取得javascript罗辑
                js.push(code);
                t += "line"+tid+"=" +js.length+";";
                switch(code.charAt(0)){
                    case "="://直接输出
                        code = code.replace(rtrim,function(){
                            trim = true;
                            return "";
                        });
                        code = code.replace(rAt,"$1data.");
                        if( code.indexOf("|") > 1 ){//使用过滤器
                            var arr = [];
                            var str = code.replace(rstr, function(str){
                                arr.push(str);//先收拾所有字符串字面量
                                return 'mass'
                            }).replace(/\|\|/g,"@");//再收拾所有短路或
                            if(str.indexOf("|") > 1){
                                var segments = str.split("|");
                                var filtered = segments.shift().replace(/\@/g,"||").replace(rmass, function(){
                                    return arr.shift();
                                });
                                for( var filter;filter = arr.shift();){
                                    segments = filter.split(":");
                                    name = segments[0];
                                    args = "";
                                    if(segments[1]){
                                        args = ', ' + segments[1].replace(rmass, function(){
                                            return arr.shift();//还原
                                        })
                                    }
                                    filtered = "Tpl.ejs.filters."+ name +"(" +filtered + args+")";
                                }
                                code = filtered;
                            }
                        }
                        t += "r +" +code +";";
                        break;
                    case "#"://注释,不输出
                        break;
                    case "-":
                    default://普通逻辑,不输出
                        code = code.replace(rtrim,function(){
                            trim = true;
                            return ""
                        });
                        t += code.replace(rAt,"$1data.");
                        break;
                }
                i = cur + close.length;
            }
            flag = !flag;
        }
        t += " return r; }catch(e){ console.log(e);\nconsole.log(js"+tid+"[line"+tid+"-1]) }}";
        var body = ["txt"+tid,"js"+tid, "filters"];
        var fn = Function.apply(Function, body.concat(helperNames,t) );
        var args = [codes, js, Tpl.ejs.filters];
        var compiled = fn.apply(this, args.concat(helpers) );
        if(typeof tid === "string"){
            return  Tpl.ejs.cache[tid] = compiled;
        }
        return compiled;
    }

    return Tpl;

});