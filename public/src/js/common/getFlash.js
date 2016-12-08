define(function(){

    var ept = {
        keys: function(obj){
            var hasOwn = ({}).hasOwnProperty;
            var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(",")
            var result = [];
            for(var key in obj ) if(hasOwn.call(obj,key)){
                result.push(key)
            }
            if(DONT_ENUM && obj){
                for(var i = 0 ;key =DONT_ENUM[i++]; ){
                    if(hasOwn.call(obj,key)){
                        result.push(key);
                    }
                }
            }
            return result;
        },
    	
        queryString:function(obj,_key,simForm){
            simForm = simForm == undefined ? true: simForm
            var str=[],isarray = simForm && Object.prototype.toString.call(obj) == '[object Array]';
            if (isarray && obj.length == 0) return ""
            if(typeof obj == "object"){
                var keys = [];
                if( isarray ){
                    for(var i=0,len=obj.length;i<len;i++){
                        keys.push(i);
                    }
                } else {
                    keys = this.keys(obj);
                }
                for(var i=0,len=keys.length;i<len;i++){
                    var key = keys[i];
                    var value = obj[key]
                        ,type = typeof value;
                    if(type == "object"){
                        str.push(this.queryString(obj[key],key,simForm));
                    } else {
                        if(type == "function" && type != 'object')  value = "";
                        if((undefined === value)||(null === value) || (isarray && obj.length == 0)){
                            continue;
                        }
                        if(type == "string") value = encodeURIComponent(value);
                        if(_key){
                            if(!isarray){
                                str.push(_key+'['+key+']=' + value);
                            } else {
                                str.push(_key+ '=' + value);
                            }
                        } else {
                            str.push(key+'=' + value);
                        }
                    }
                }
            }
            if(_key && str.length == 0){
                return _key + "=";
            } else {
                return str.join('&');
            }
        },

    	getFlash:function ($container, info, flashvars, params) {
            if(typeof flashvars == "object"){
                flashvars = this.queryString(flashvars);
            } else {
                flashvars = flashvars && flashvars.replace(/"/g, '&quot;');
            } 
            params = params || {};
            var pArrkeys = Object.keys(params);

            var getFlashStr = '<a href="http://www.adobe.com/go/getflash"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="获得 Adobe Flash Player" /></a>';
            var html,phtml = "";
            info.id = info.id || 'iPIN_flash' + ( Math.random() * 1000000 | 0);
            info.width = info.width || 1;
            info.height = info.height || 1;
            if ('classid' in document.createElement('object')) {//ie only
                for(var i=0,len=pArrkeys.length;i<len;i++) phtml += '<param name="'+pArrkeys[i]+'" value="'+params[pArrkeys[i]]+'" />';

                html = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" name="' + info.id+ '" ' +
                (info.id ? 'id="' + info.id + '" ' : '') +
                'width="' + info.width + '" height="' + info.height + '">' +
                '<param name="allowScriptAccess" value="'+(info.allowScriptAccess?info.allowScriptAccess:"always")+'" />' +
                '<param name="quality" value="high" />' +
                '<param name="wmode" value="'+(info.wmode?info.wmode:"window")+'" />' +
                '<param name="movie" value="' + info.src + '" />' +
                (flashvars ? '<param name="flashvars" value="' + flashvars + '" />' : '') + phtml + getFlashStr
                '</object>';

            } else {
                //style="width:1px;height:1px" 是为了保证firefox下正常工作.
                for(var i=0,len=pArrkeys.length;i<len;i++) phtml += ' '+pArrkeys[i]+'="'+params[pArrkeys[i]]+'"';
                html = '<embed style="width:' + info.width +'px;height:' + info.height + 'px;" wmode="'+(info.wmode?info.wmode:"window")+'" src="' + info.src + '" quality="high" name="' + info.id + '" ' +
                (info.id ? 'id="' + info.id + '" ' : '') +
                (flashvars ? 'flashVars="' + flashvars + '" ' : '') +
                'width="' + info.width + '" height="' + info.height +
                '" allowScriptAccess="'+(info.allowScriptAccess?info.allowScriptAccess:"always")+'" ' + phtml +
                'type="application/x-shockwave-flash"/>';
            }
            if(typeof $container.html === "function" && typeof $container.children === "function"){
                $container.html(html);
                return $container.children();
            }
            else{
                $container.innerHTML = html;
                return $container.firstChild;
            }
        }
    }

    return function(){
        ept.getFlash.apply(ept,arguments);
    };

});