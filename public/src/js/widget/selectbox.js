define(["jquery","pin","avalonGetModel","plugins/jscrollpane"], function($,pin,avalon) {

        var widget =  avalon.ui["selectbox"] =  function(element, data, vmodels){
        var innerHTML = ['<li class="select_title" ms-mouseenter="show" ms-class-1="hasset:selectvalue.size()" ms-mouseleave="hide" ms-class="active:display">',
                            '    <a href="#"><i class="more_sj"></i><span class="txt_value">{{selectvalue.size()?text:$defaultText}}</span></a>',
                            '    <span class="icon delete_icon" ms-visible="selectvalue.size()!=0" ms-click="clearAll"></span>',
                            '    <div class="r_cbox_wrap">',
                            '        <div class="r_cbox_insbox">',
                            '            <div class="unlimited_box">',
                            '                <div class="a_cbox_wrap">',
                            '                    <div class="a_cbox" ms-click="clearAll"><i class="cbox_icon" ms-class="cbox_icon_ck:selectvalue.size()==0"></i><span class="cbox_txt">不限</span></div>',
                            '                </div>',
                            '            </div>',
                            '            <div class="scroll_box card-area-plug">',
                            '                <div class="a_type clearfix" ms-repeat-t="data">',
                            '                    <div class="classes_box">',
                            '                        <div class="a_cbox_wrap" ms-click="checkTopType(this,t)">',
                            '                            <div class="a_cbox"><i class="cbox_icon"></i><span class="cbox_txt">{{t[0]}}：</span></div>',
                            '                        </div>',
                            '                    </div>',
                            '                    <div class="details_box clearfix">',
                            '                        <div class="a_cbox_wrap" ms-click="checkSubType(this,el,$event)" ms-repeat-el="t[1]">',
                            '                            <div class="a_cbox"><i class="cbox_icon" ms-class="cbox_icon_ck:map.contains(el.value)"></i><span class="cbox_txt">{{el.name}}</span></div>',
                            '                        </div>',
                            '                    </div>',
                            '                </div>',
                            '            </div>',
                            '        </div>',
                            '        <i class="left_line"></i>',
                            '    </div>',
                            '</li>'].join('');

        var el = $(innerHTML);
        $(element).after(el);
        $(element).remove();
        element = el[0];
        var rootNode = $(element);
        data.element = element;
        var timeId = 0

        var vmodel = avalon.define(data.selectboxId, function(vm) {
            avalon.mix(vm, data.selectboxOptions);
            vm.display = false;
            vm.selectvalue = [];
            vm.text = "";
            vm.map = [];
            vm.$sobj = null;
            vm.show = function(){
                clearTimeout(timeId);
                if(vm.$sobj){
                    avalon.nextTick(function() {
                        vm.$sobj.reinitialise();
                    });
                }
                vm.display = true;
                //vm._autoPosition();
            };
            vm._autoPosition = function(){
                    var el = $(element).find('.r_cbox_wrap');
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
            vm.hide = function(){
                timeId = setTimeout(function() {
                    vm.display = false;
                }, 100);
            }
            vm.clearAll = function(){
                vm.selectvalue.clear();
                vm.map.clear();
                vm.text = "";
                $(element).find(".scroll_box i.cbox_icon").attr('class','cbox_icon');
                vm._onchange();
            }
            vm._updateTopStats = function(aType){
                var allSubBox = aType.find(".details_box .a_cbox_wrap");
                var c = 0;
                var allCount = 0;
                allSubBox.each(function(){
                    var icon = $(this).find('.cbox_icon:eq(0)');
                    if(  $.trim(icon.attr('class')) != "cbox_icon" ){
                        c++;
                    }
                });
                vm._setClass(aType.find(".cbox_icon:eq(0)"),allCount||c,allSubBox.length);
            }
            vm._setClass = function(icon,c,all){
                if(c == all){
                    icon.attr('class','cbox_icon cbox_icon_ck')
                } else if(c > 0) {
                    icon.attr('class','cbox_icon cbox_icon_hide')
                } else {
                    icon.attr('class','cbox_icon');
                }
            }
            vm._removeItem = function(value){
                for( var i=0,len=vm.selectvalue.length;i<len;i++ ){
                    if(vm.selectvalue[i].value == value){
                        vm.selectvalue.removeAt(i);
                        break;
                    }
                }
                vm.map.remove(value);
            }
            vm.checkTopType = function(el,tmpArr){
                var nowEl = $(el);
                var icon = nowEl.find(".cbox_icon");
                var allSubBox = nowEl.closest('.a_type').find(".details_box .a_cbox_wrap");
                if(icon.hasClass('cbox_icon_ck')){
                    //remove
                    for(var i=0,len=tmpArr[1].length;i<len;i++){
                        vm._removeItem(tmpArr[1][i].value);
                    }
                    icon.attr('class','cbox_icon');
                    allSubBox.find('.cbox_icon').attr('class','cbox_icon');
                } else{
                    //add
                    var arr = [];
                    for(var i=0,len=tmpArr[1].length;i<len;i++){
                        if(!vm.map.contains(tmpArr[1][i].value)){
                            arr.push({name:tmpArr[1][i].name,value:tmpArr[1][i].value});
                            vm.map.ensure(tmpArr[1][i].value);
                        }
                    }
                    vm.selectvalue.pushArray(arr);
                    icon.attr('class','cbox_icon cbox_icon_ck');
                    allSubBox.find('.cbox_icon').attr('class','cbox_icon cbox_icon_ck');
                }
                vm._onchange();
            }
            vm.checkSubType = function(el,data,e){
                var nowEl = $(el);
                var aType = nowEl.closest(".a_type");
                var icon = nowEl.find(".cbox_icon");
                if(icon.hasClass('cbox_icon_ck')){
                    //remove
                    vm._removeItem(data.value);
                } else {
                    //add
                    if(!vm.map.contains(data.value)){
                        vm.selectvalue.push({name:data.name,value:data.value});
                        vm.map.ensure(data.value);
                        console.log(data.value);
                    }
                }
                vm._updateTopStats(aType);
                vm._onchange();
                pin.cancelAll(e);
            }
            vm._onchange = function(){
                vm.onChange(vm.selectvalue.$model)
            }
            vm.$init = function(){
                avalon.nextTick(function() {
                    $(element).find(".card-area-plug").jScrollPane();
                    vm.$sobj = $(element).find(".card-area-plug").data("jsp");
                });
                vm.selectvalue.pushArray(vm.$initValue);
                var arr = [];
                var txt = [];
                vm.$initValue.forEach(function(i){
                    arr.push(i.value);
                    txt.unshift(i.name);
                })
                vm.map.pushArray(arr);
                vm.text = txt.join("、");
            }
            vm._refresh = function() {
                vm.data.clear();
                vm.data.pushArray(vm.$source.$model);
                var node = rootNode.find(".card-area-plug");
                node.find('.jspContainer').remove();
                node.removeData('jsp');
                avalon.nextTick(function() {
                    $(element).find(".card-area-plug").jScrollPane();
                    vm.$sobj = $(element).find(".card-area-plug").data("jsp");
                });
            }
        });
        vmodel.selectvalue.$watch("length",function(){
            var t = [];
            vmodel.selectvalue.$model.forEach(function(i){
                t.unshift(i.name);
            });
            vmodel.text = t.join("、");
        });
        if(vmodel.$source){
            var sourceModel = avalon.getModel(vmodel.$source, vmodels);
            sourceModel && ( vmodel.$source = sourceModel[1][sourceModel[0]] );
            vmodel.$source && vmodel.$source.$watch && vmodel.$source.$watch('length', function(n) {
                console.log('change')
                if(n > 0){
                    vmodel._refresh(n);
                }
            });
        }
        avalon.nextTick(function() {
            avalon.scan(element, [vmodel].concat(vmodels));
        });
        return vmodel
    };
    widget.defaults = {
        data:[],
        $initValue : [],
        $defaultText:"设置学校",
        onChange:function(){}
    };
    widget.getSelectData = function(data){
        var t = [];
        data.forEach(function(item){
            if(!item){
                debugger;
            }
            if(!avalon.isPlainObject(item)){
                t.push({name:item,value:item});
            } else {
                t.push({name:item.name,value:item.value});
            }
        });
        return t;
    }

    return widget;
});


