define(["jquery","pin","avalonGetModel"], function($,pin,avalon) {

    var Req = pin.request;

    var widget = avalon.ui["vmajor"] = function(element, data, vmodels){

        var chooseHtml = ['<div ms-if="showType==\'choose\'" class="pbd-con pbd-con-choose">',
                        '    <div class="title">',
                        '        <h3>请选择想从事的专业</h3> ',
                        '    </div>',
                        '    <div class="con">',
                        '        <ul>',
                        '              <li ms-repeat-el="majorCate" ms-click="showList(\'type\',el,$event)">{{el}}</li>',
                        '        </ul>',
                        '    </div>',
                        '    <div class="title">',
                        '        <h3>看看有哪些热门专业</h3> ',
                        '    </div>',
                        '    <div class="con">',
                        '        <ul>',
                        '            <li ms-repeat-el="majorRank" ms-click="showList(\'rank\',el.rank_list_id,$event)">{{el.rank_list_name}}</li>',
                        '        </ul>',
                        '    </div>',
                        '</div>'].join('')

        var listHtml = ['<div ms-if="showType==\'list\'" ms-class="hidden:showType!=\'list\'" class="pbd-con pbd-con-list pbd-con-list2">',
                        '    <div class="title">',
                        '        <span class="back" ms-click="back">《 返回</span> ',
                        '    </div>',
                        '    <div class="con">',
                        '        <div class="con-nav">',
                        '            <ul ms-if="listType == \'rank\'">',
                        '                <li ms-repeat-el="majorRank" ms-class="active:el.rank_list_id==listKey" ms-click="showList(\'rank\',el.rank_list_id,$event)">{{el.rank_list_name}}</li>',
                        '            </ul>',
                        '            <ul ms-if="listType == \'type\'">',
                        '                <li ms-repeat-el="majorCate" ms-class="active:el==listKey" ms-click="showList(\'type\',el,$event)">{{el}}</li>',
                        '            </ul>',
                        '        </div>',
                        '        <div class="con-list">',
                        '            <div class="item" ms-repeat-el="listData">',
                        '                <div class="il">',
                        '                    <div class="ico">',
                        '                        <div class="txt">',
                        '                            <span>{{numC(el.duikou_ratio)|html}}<em>%</em></span> ',
                        '                        </div>',
                        '                        <p>就业对口率</p>',
                        '                    </div>',
                        '                </div>',
                        '                <div class="ic">',
                        '                    <div class="ti">',
                        '                        <h5>{{el.major_second_cate}}</h5> ',
                        '                        <span>毕业5年薪酬：{{el.salary}}元/月<em class="ico_1"></em>',
                        '                        </span> ',
                        '                        <span>女生占：{{el.female_count/(el.female_count+el.male_count)*100|number(0)}}%</span> ',
                        '                    </div>',
                        '                    <div class="txt">',
                        '                        <div class="txt-i">',
                        '                            <span>对口职业：</span> ',
                        '                            <p><a target="_blank" ms-repeat-item="el.dest_list" href="javascript:;">{{item.job_second_cate}}{{!$last?"、":""}}</a></p>',
                        '                        </div>',
                        '                        <div class="txt-i">',
                        '                            <span>具体专业：</span> ',
                        '                            <p><a target="_blank" ms-href="/api/major-cat/{{majitem.major_id}}.html" ms-repeat-majitem="el.major_list">{{majitem.major_name}}{{$last?"":"、"}}</a></p>',
                        '                        </div>',
                        '                    </div>',
                        '                </div>',
                        '                <div class="ir">',
                        '                    <div class="btn">',
                        '                        <span ms-click="add(el.major_second_cate,$event)" ms-class="{{txtList.indexOf(el.major_second_cate)!=-1?\'btn-had-common\':\'btn-common\'}}">{{txtList.indexOf(el.sub_job_cate)!=-1?\'已添加\':\'添加\'}}</span> ',
                        '                    </div>',
                        '                    <p>',
                        '                        <a target="_blank" ms-href="/api/major-cat/{{el.major_second_cate}}.html">更多介绍</a> ',
                        '                    </p>',
                        '                </div>',
                        '            </div>',
                        //'           <div class="mod-page" ms-widget=\'page,$,$pageCfg\' ms-maxpage="maxPage" ms-onchange="page"></div>',
                        '        </div>',
                        '    </div>',
                        '</div>'].join('');

        var el = $("<div>" + chooseHtml + listHtml + "</div>");
        $(element).after(el);
        el.attr("avalonctrl",data.vmajorId)
        $(element).remove();
        element = el[0];
        data.element = element;

        function getVmFormId(id){
            if(avalon.vmodels[id]){
                return avalon.vmodels[id]
            } else {
                if(id!="root"){
                    throw Error("not Found vm["+id+"]")
                }
            }
        }



        var watchHandler;
        var vdVm = getVmFormId("vd");

        var vmodel = avalon.define(data.vmajorId, function(vm) {
            avalon.mix(true,vm, data.vmajorOptions);
            vm.$orgData = null;
            vm.showType = "choose";
            vm.$remove = function(){
                if(watchHandler){
                    vdVm.digValue.$unwatch("length",watchHandler);
                }
            }
            vm.showList = function(listType,listKey,e){
                vm.showType = "list";
                if(vm.listType != listType || vm.listKey != listKey){
                    vm.listType = listType;
                    vm.listKey = listKey;
                    vm._getListData();
                }
                pin.cancelAll(e);
            }
            vm.numC = function(val){
                val = Math.floor(val*100);
                if(val<10){
                    return '&nbsp;'+val
                } else{
                    return Math.min(99,val)+"";
                }
            }
            vm.back = function(e){
                vm.showType = "choose";
                pin.cancelAll(e);
            }

            /*vm.$listData = [];
            vm.maxPage = 0;
            vm.$pageCfg={
                page:0,
                maxPage:0
            };
            vm.page=function(page){
                vm.listData.clear();
                vm.listData.pushArray(vm.$listData.slice(3*(page-1),3*page));
            }*/
            function destSlice(data) {
                data.forEach(function(item){
                    item.dest_list = item.dest_list.slice(0,3);
                    /*var major_str = [];
                    item.major_list.forEach(function (item) {
                        major_str.push(item.major_name);
                    });
                    delete item.major_list;
                    item.major_str = major_str.slice(0,7).join('、');*/
                    item.major_list = item.major_list.slice(0,7);
                });
                return data;
            }
            vm._getListData = function(){
                if(vm.listType == "rank"){
                    vm.listData.clear();
                    Req.rank_list("gaokao_sel_major",vm.listKey,function(r){
                        var data = r.getData().item_list;
                        /*vm.$listData = data;
                        vm.maxPage = Math.ceil(data.length/3);
                        vm.listData.pushArray(vm.$listData.slice(0,3));*/
                        vm.listData.pushArray(destSlice(data));
                        avalon.nextTick(function(){vdVm.fixMt();});
                    });
                } else {
                    vm.listData.clear();
                    Req.detail_majorcate(vm.listKey,function(r){
                        var data = r.getData().item_list;
                        vm.listData.pushArray(destSlice(data));
                        avalon.nextTick(function(){vdVm.fixMt();});
                    });
                }
            }
            vm.add = function(text,e){
                if(!vmodel.txtList.contains(text)){
                    vdVm.$hasChange=true;
                    vdVm.digValue.ensure({value:text,text:text});
                }
                e && pin.cancelAll(e);
            } 
        });
        watchHandler = function(n){
            vmodel.txtList.clear();
            if(n){
                var txt = [];
                vdVm.$hasChange=true;
                vdVm.digValue.$model.forEach(function(item){
                    txt.push(item.text);
                });
                vmodel.txtList.pushArray(txt);
            }
        }
        vdVm.digValue.$watch("length",watchHandler);
        watchHandler(vdVm.digValue.length);
        vdVm.$hasChange = false;
        
        vmodel.$orgData = data;
        vdVm.$loadVm = vmodel;
        
        avalon.nextTick(function() {
            avalon.scan(element, [vmodel].concat(vmodels))
        });

        Req.major_group(function(r){
            if(r.isOk()){
                var data = r.getData().rank_group_items;
                vmodel.majorRank.clear();
                vmodel.majorRank.pushArray(data);
                avalon.nextTick(function(){vdVm.fixMt();});
            }
        });
        Req.major_list_cate(function(r){
            if(r.isOk()){
                var data = r.getData().major_cate_list;
                var majorCateList = [];
                data.forEach(function(item) {
                    majorCateList.push(item.major_cate)
                })
                vmodel.majorCate.clear();
                vmodel.majorCate.pushArray(majorCateList);
                avalon.nextTick(function(){vdVm.fixMt();});
            }
        });
        
        return vmodel
    
    };

    widget.defaults = {
        txtList:[],
        listType:"",
        listKey:"",
        majorCate:[],
        majorRank:[],
        listData:[],
        showType:"choose"
    }

    widget.outHtml='<div class="pbd-con" ms-widget="vmajor,$"></div>';

    return widget;
});
