define(["jquery","pin","avalonGetModel",], function($,pin,avalon) {

    var widget = avalon.ui["select"] = function(element, data, vmodels){
        var innerHTML = ['<div class="dropdown" ms-class="active:active">',
                        '<a href="#" class="menu-hd" ms-click="show">{{text}}</a>', 
                        '<ul class="menu-bd">',
                        '    <li ms-repeat-el="data"><a href="#" ms-click="selectItem(el,$event)">{{el.text}}</a></li>',
                        '</ul></div>'].join('');
        var zhiyuan = ['<li ms-class="active:active" ms-visible="hideZhuanke" ms-class-1="{{hasset}}" ms-mouseleave="hide">',
                        '    <a href="#" ms-mouseenter="show"><i class="more_sj"></i>{{text}}</a>',
                        '    <i class="icon" ms-class="{{lock}}" ms-if="lock"></i>',
                        '    <div class="menu-bd-box" ms-class="{{otherCss}}">',
                        '        <i class="left_line"></i>',
                        '        <ul class="menu-bd">',
                        '            <li ms-repeat-el="data"><a href="#" ms-click="selectItem(el,$event)">{{el.text}}</a></li>',
                        '        </ul>',
                        '    </div>',
                        '</li>'].join('');



        var blurHandler,vmodel;
        var duplexName = (element.msData["ms-duplex"] || "").trim();
        var hideSelect = (element.msData["ms-hideselect"] || "").trim();
        if(data.selectOptions.$type == "zhiyuan"){
            innerHTML = zhiyuan;
            data.selectOptions.otherCss=data.selectOptions.otherCss||"";
        }
        var el = $(innerHTML);
        $(element).after(el);
        $(element).remove();
        element = el[0];
        data.element = element;
        
        if(!data.selectOptions.text){
            data.selectOptions.text=data.selectOptions.value;
        }
        if(data.selectOptions.$css){
            el.addClass(data.selectOptions.$css);
        }
        var opt = avalon.mix(true,{}, data.selectOptions);
        opt.data = widget.getSelectData(opt.data);

        vmodel = avalon.define(data.selectId, function(vm) {
            avalon.mix(true,vm, opt);
            vm.active=false;
            vm.value="";
            vm.show=function(e){
                vm.active=!vm.active;
                //vm.$autoPosition && vm._autoPosition();
                pin.cancelDefault(e);
            }
            if(!opt._autoPosition){
                vm._autoPosition = function(){
                    //left right
                    var jQEl = el;
                    var ulDom = jQEl.find("ul");
                    var cw = document.documentElement.clientWidth || document.body.clientWidth;
                    var left = jQEl.left - $(window).scrollLeft();
                    var ulWidth = ulDom.width();
                    var d='';

                    if(left + ulWidth > cw  && left > cw/2 ){
                        d = 'r';
                    } else {
                        d = 'l';
                    }
                    if(this.lockPosition){
                        if(['r','l'].indexOf(this.lockPosition)!=-1){
                            d = this.lockPosition;
                        }
                    }
                    switch(d){
                        case 'r':
                            ulDom.css({
                                left:'auto',
                                right:ulDomm.css('marginLeft')
                            });
                            break;
                        case 'l':
                            ulDom.css({
                                left:'',
                                right:''
                            });
                            break;
                    }

                    var ch = document.documentElement.clientHeight || document.body.clientHeight;
                    var top = jQEl.offset().top - $(window).scrollTop();
                    var ulHeight = ulDom.height();
                    if(top + ulHeight > ch  && top > ch/2 ){
                        d = 't'
                    } else {
                        d = 'b'
                    }
                    if(this.lockPosition){
                        if(['t','b'].indexOf(this.lockPosition)!=-1){
                            d = this.lockPosition;
                        }
                    }
                    switch(d){
                        case 't':
                            ulDom.css({top:-ulHeight})
                            break;
                        case 'b':
                            ulDom.css({top:''})
                            break;
                    }
                }
            }
            vm.selectItem = function(el,e){
                var val = el.value === void 0 ?  el.text : el.value;
                if(vm.onChange(val) !== false){
                    vm.text = el.text;
                    vm.value = val;
                }
                vm.active=false;
                pin.cancelDefault(e);
            }
            blurHandler = avalon.bind(document.body, "click", function(e) {
                if(element.contains(e.target)) {
                    return
                } else {
                    vm.active = false;    
                }
            });
            vm.$remove = function() {
                if(blurHandler) {
                    avalon.unbind(window, "click", blurHandler)
                }
            }
            vm._refresh = function(len){
                vmodel.data.clear();
                if (len > 0) {
                    vmodel.data.pushArray(widget.getSelectData(vmodel.$source.$model || vmodel.$source));
                    var item = vm._getItem(vm.value);
                    if(!item){
                        vm._setFirst();
                    }
                }
            }
            vm._setItem = function(val){
                var item = vm._getItem(val);
                if(item){
                    vm.text = item.text;
                    vm.value =  item.value === void 0 ?  item.text : item.value;
                } else {
                    if(vm.$mustHaveValue){
                        vm._setFirst();
                    } else {
                        vm._setDef();
                    }
                }
            }
            vm._setDef = function(){
                vm.text = vm.$defaultText;
                vm.value = '';
            }
            vm._setFirst = function(){
                var item = vmodel.data[0];
                if(item){
                    item = item.$model;
                    vm.text = item.text;
                    vm.value =  item.value === void 0 ?  item.text : item.value;
                } else {
                    vm._setDef();
                }
            }
            vm._getItem = function(val){
                var item;
                (vm.data.$model||vm.data).forEach(function(i){
                    if(i.value === val || ( i.value === void 0 && i.text === val)){
                        item = i;
                        return false;
                    }
                });
                return item;
            }
            if(vm.$type == "zhiyuan"){
                vm.lock = data.selectOptions.lock||false;
                vm.hideZhuanke = true;
                vm.show=function(e){
                    vm.active=true;
                    //vm.$autoPosition && vm._autoPosition();
                    pin.cancelDefault(e);
                    vm.$fire("all!showSelect",{id:vm.$id});
                };
                vm.hide=function(){
                    vm.active=false;
                };
                vm._autoPosition=function(){
                    var el = $(element).find('.menu-bd-box');
                    var ch = document.documentElement.clientHeight || document.body.clientHeight;
                    ch -= 54;
                    el.css("top",-1)
                    var forTop = el.offset().top - $(window).scrollTop();
                    var thisHeight = el.outerHeight(1);
                    if(ch - forTop < thisHeight ){
                        var toHight =  thisHeight - ch + forTop ;
                        el.css("top",-1 * ( toHight + 1 ))
                        el.find('.left_line').css('top',toHight)
                    } else {
                        el.css("top",-1)
                        el.find('.left_line').css('top',0)
                    }
                }
                if("filter.pici" == duplexName){
                    vm.hasset = "hasset";
                } else {
                    vm.hasset = vm.text != vm.$defaultText && vm.text != vm.data[0].text ? "hasset" : ''
                }
            }
        });

        if(vmodel.$source) {
            if(avalon.type(vmodel.$source) === "string") {
                var sourceModel = avalon.getModel(vmodel.$source, vmodels);
                sourceModel && ( vmodel.$source = sourceModel[1][sourceModel[0]] );
            } else if(!vmodel.$source.$id) {
                vmodel.$source = null
            } else if(vmodel.$source.length > 0) {
                vmodel._refresh(vmodel.$source.length);
            }
            vmodel.$source && vmodel.$source.$watch && vmodel.$source.$watch('length', function(n) {
                vmodel._refresh(n)
            });
        }
        var duplexModel
        if (duplexName && (duplexModel = avalon.getModel(duplexName, vmodels))) {
            duplexModel[1].$watch(duplexModel[0], function(n) {
                vmodel.value = n;
                vmodel._setItem(vmodel.value);
            });
            vmodel.$watch("value", function(n) {
                duplexModel[1][duplexModel[0]] = n;
            });
        }
         if(data.selectOptions.$type == "zhiyuan"){
            vmodel.$watch("showSelect",function(e){
                if(e.id != vmodel.$id){vmodel.active=false;}
            });
            if("filter.pici" != duplexName){
                vmodel.$watch("text",function(text){
                    vmodel.hasset = text != vmodel.$defaultText && vmodel.text != vmodel.data[0].text ? "hasset" : '';
                });
            }
            var selectModel;
            if(hideSelect && (selectModel = avalon.getModel(hideSelect, vmodels))){
                selectModel[1].$watch(selectModel[0], function(n) {
                    vmodel.hideZhuanke = !n;
                });
                vmodel.hideZhuanke = !selectModel[1][hideSelect]
            }
        }
        avalon.nextTick(function() {
            avalon.scan(element, [vmodel].concat(vmodels));
        });
        vmodel._setItem(data.selectOptions.value);
        
        return vmodel
    }
    widget.defaults = {
        data: [],
        value: "",
        text: "",
        $defaultText:"NULL",
        $autoPosition:true,
        $mustHaveValue:false,
        onChange:avalon.noop
    }
    widget.getSelectData = function(data){
        var t = [];
        data.forEach(function(item){
            if(!item){
                debugger;
            }
            if(!avalon.isPlainObject(item)){
                t.push({text:item});
            } else {
                t.push(item)
            }
        });
        return t;
    }

    //return avalon
    return widget;
});