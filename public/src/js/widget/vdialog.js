define(["jquery","pin","avalonGetModel"], function($,pin,avalon) {
    var widget = avalon.ui["vdialog"] = function(element, data, vmodels){

        var vdReady=false;
        var blurHandler,innerHtml = ['<div class="pop-dialog" ms-visible="display" style="display:none;">',
                        '<div class="mod-pop" ms-class="{{cs}}">',
                        '    <div class="mod-phd">',
                        '        <h2>{{digTitle}}</h2> ',
                        '        <div class="phd-r">',
                        '            <span class="btn-common" ms-click="_callback">完成</span> ',
                        '        </div>',
                        '    </div>',
                        '    <div class="mod-pbd">',
                        '        <div class="pbd-bar">',
                        '            <span class="ti"><em ms-click="removeAll">×</em>&nbsp;你的添加：</span> ',
                        '            <div class="tags" ms-if="digValue.size()>0">',
                        '                <span class="tag" ms-repeat-el="digValue">{{el.text}}<em ms-click="$remove">删除</em></span> ',
                        '            </div>',
                        '           <span class="tips" ms-if="digValue.size()==0">{{digTips}}</span>',
                        '        </div>',
                        '        <div class="pbd-con"></div>',
                        '    </div>',
                        '</div>',
                        '</div>'].join('');

        var el = $(innerHtml);
        $(element).after(el);
        el.attr("avalonctrl",data.vdialogId);
        $(element).remove();
        element = el[0];
        data.element = element;

        var vmodel = avalon.define(data.vdialogId, function(vm) {
            avalon.mix(vm, data.vdialogOptions);
            vm.$loadVm = null;
            vm.reset = function(cfg){
                vm._removeWidget();
                Object.keys(cfg).forEach(function(k){
                    if( avalon.type(cfg[k]) == "array" ){
                        vm[k].clear();
                        vm._setValue(cfg[k]);
                    } else {
                        vm[k] = cfg[k];
                    }
                });
                var outHtml = avalon.ui[vm.$loadWidget].outHtml;
                if(outHtml){
                    $(element).find(".pbd-bar").next("div").remove();
                    $(element).find(".pbd-bar").after(outHtml);
                    avalon.removeSubscribers();
                    function fn(){
                        avalon.scan($(element).find(".pbd-bar").next("div")[0], [vmodel].concat(vmodels));
                    }
                    if(vdReady){
                        avalon.nextTick(function(){fn();});
                    } else {
                        avalon.nextTick(function(){avalon.nextTick(function() {
                            fn();
                        });});
                    }
                }       
            };
            vm.fixMt = function(){
                var height = $(element).height();
                $(element).css("marginTop",-height/2);
            }
            vm._removeWidget = function(){
                if(vm.$loadVm){
                    vm.$loadVm.$orgData.rollback();
                }
                vm.callback = $.noop;
            }
            vm._setValue = function(v){
                if ( !avalon.type(v) == "array" ){
                    v = [v];
                }
                var tmp = [];
                v.forEach(function(item){
                    if(avalon.isPlainObject(item)){
                        tmp.push(item)
                    } else {
                        tmp.push({text:item,value:item});
                    }
                });
                vm.digValue.pushArray(tmp);
            }
            vm._callback=function(e){
                if(vm.display){
                    var rv = vm.callback && vm.callback(vm.digValue.$model,vm.$hasChange);
                    if(rv == true){
                        vm.display = false;
                    }
                }
                e && pin.cancelAll(e);
            }
            vm.removeAll = function(){
                if(vm.digValue.length!=0){
                    vm.$hasChange = true;
                }
                vm.digValue.clear();
            }
            blurHandler = avalon.bind(document.body, "click", function(e) {
                if(document.body.contains(e.target) && !element.contains(e.target)){
                    vm.display = false; 
                }
            });
            vm.$remove = function() {blurHandler && avalon.unbind(window, "click", blurHandler);}
        });

        
        
        avalon.nextTick(function() {
            avalon.scan(element, [vmodel].concat(vmodels));
            vdReady = true;
        });

        vmodel.$watch("display",function(v){
            $("#pop_overlay").css({"display":v?"block":"none"});
            if(!v){
                vmodel._callback();
                vmodel._removeWidget();
            }
        });
        
        return vmodel
    
    }
    widget.defaults = {
        digTitle:"[null]",
        digTips:'[null]',
        cs:"",
        digValue:[],
        display:false,
        callback:$.noop,
        $hasChange:false,
        $loadWidget:""
    }
    return widget;
});