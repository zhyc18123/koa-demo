define(["jquery","pin","avalonGetModel"], function($,pin,avalon) {

    var Req = pin.request;

    var widget = avalon.ui["vjob"] = function(element, data, vmodels){

        var chooseHtml = ['<div ms-if="showType==\'choose\'" class="pbd-con pbd-con-choose">',
                        '    <div class="title">',
                        '        <h3>请选择想从事的职业</h3> ',
                        '    </div>',
                        '    <div class="con">',
                        '        <ul>',
                        '              <li ms-repeat-el="zhinengType" ms-click="showList(\'type\',el,$event)">{{el}}</li>',
                        '        </ul>',
                        '    </div>',
                        '    <div class="title">',
                        '        <h3>看看有哪些热门职业</h3> ',
                        '    </div>',
                        '    <div class="con">',
                        '        <ul>',
                        '            <li ms-repeat-el="zhinengRank" ms-click="showList(\'rank\',el.rank_list_id,$event)">{{el.rank_list_name}}</li>',
                        '        </ul>',
                        '    </div>',
                        '</div>'].join('')

        var listHtml = ['<div ms-if="showType==\'list\'" class="pbd-con pbd-con-list">',
                        '    <div class="title">',
                        '        <span class="back" ms-click="back">《 返回</span> ',
                        /*'        <div class="search">',
                        '            <div class="input">',
                        '                <input type="text" name="key" value="" placeholder="关键词搜索职业" />',
                        '            </div>',
                        '            <div class="btn">',
                        '                <span>搜索</span> ',
                        '            </div>',
                        '        </div>',*/
                        '    </div>',
                        '    <div class="con">',
                        '        <div class="con-nav">',
                        '            <ul ms-if="listType == \'rank\'">',
                        '                <li ms-repeat-el="zhinengRank" ms-class="active:el.rank_list_id==listKey" ms-click="showList(\'rank\',el.rank_list_id,$event)">{{el.rank_list_name}}</li>',
                        '            </ul>',
                        '            <ul ms-if="listType == \'type\'">',
                        '                <li ms-repeat-el="zhinengType" ms-class="active:el==listKey" ms-click="showList(\'type\',el,$event)">{{el}}</li>',
                        '            </ul>',
                        '        </div>',
                        '        <div class="con-list">',
                        '            <div class="item" ms-repeat-el="listData">',
                        '                <div class="il">',
                        '                    <div class="ico">',
                        '                        <p>职业热度</p>',
                        '                        <div class="txt">',
                        '                            <span>{{numC(el.hot)|html}}<em>C</em></span> ',
                        '                        </div>',
                        '                        <span class="bg" ms-css-height="el.hot*100+\'%\'"></span> ',
                        '                    </div>',
                        '                </div>',
                        '                <div class="ic">',
                        '                    <div class="ti">',
                        '                        <h5>{{el.job_second_cate}}</h5> ',
                        '                        <span>毕业5年薪酬：{{el.salary}}元/月<em ms-class="{{\'ico_\'+(el.salary>6800?1:3)}}"></em>',
                        '                        </span> ',
                        '                        <span>女生占：{{el.female_count/(el.female_count+el.male_count)*100|number(0)}}%</span> ',
                        '                    </div>',
                        '                    <div class="txt">',
                        '                        <div class="txt-i">',
                        '                            <span>相关专业：</span> ',
                        '                            <p><a ms-repeat-item="el.duikou_major_list" target="_blank" ms-href="/api/major-cat/{{item.major_second_cate}}.html">{{item.major_second_cate}}{{!$last?"、":""}}</a></p>',
                        '                        </div>',
                        '                        <div class="txt-i">',
                        '                            <span>具体职业：</span> ',
                        '                            <p><a ms-repeat-item="el.position_list" target="_blank" ms-href="">{{item}}{{!$last?"、":""}}</a></p>',
                        '                        </div>',
                        '                    </div>',
                        '                </div>',
                        '                <div class="ir">',
                        '                    <div class="btn">',
                        '                        <span ms-click="add(el,$event)" ms-class="{{txtList.indexOf(el.job_second_cate)!=-1?\'btn-had-common\':\'btn-common\'}}">{{txtList.indexOf(el.sub_job_cate)!=-1?\'已添加\':\'添加\'}}</span> ',
                        '                    </div>',
                        '                </div>',
                        '            </div>',
                        //'           <div class="mod-page" ms-widget=\'page,$,$pageCfg\' ms-maxpage="maxPage" ms-onchange="page"></div>',
                        '        </div>',
                        '    </div>',
                        '</div>'].join('');

        var el = $("<div>" + chooseHtml + listHtml + "</div>");
        $(element).after(el);
        el.attr("avalonctrl",data.vjobId)
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

        var vmodel = avalon.define(data.vjobId, function(vm) {
            avalon.mix(true,vm, data.vjobOptions);
            vm.$orgData = null;
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
            function majorSlice(data) {
                data.forEach(function(item){
                    item.duikou_major_list = item.duikou_major_list.slice(0,3);
                    item.position_list = item.position_list.slice(0,5);
                });
                return data;
            }
            vm._getListData = function(){
                if(vm.listType == "rank"){
                    vm.listData.clear();
                    Req.rank_list("gaokao_sel_job",vm.listKey,function(r){
                        var data = r.getData().item_list;
                        /*vm.$listData = data;
                        vm.maxPage = Math.ceil(data.length/3);
                        vm.listData.pushArray(vm.$listData.slice(0,3));*/
                        vm.listData.pushArray(majorSlice(data));
                        avalon.nextTick(function(){vdVm.fixMt();});
                    });
                } else {
                    vm.listData.clear();
                    Req.detail_jobcate(vm.listKey,function(r){
                        var data = r.getData().item_list;
                        vm.listData.pushArray(majorSlice(data));
                        avalon.nextTick(function(){vdVm.fixMt();});
                    });
                }
            }
            vm.add = function(el,e){
                var text = el.job_second_cate;
                if(!vmodel.txtList.contains(text)){
                    vdVm.$hasChange=true;
                    var major_cate = [];
                    el.duikou_major_list.slice(0,3).forEach(function(item){
                        major_cate.push(item.major_second_cate)
                    });
                    vdVm.digValue.ensure({value:major_cate.join("、"),text:text});
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

        Req.zhineng_group(function(r){
            if(r.isOk()){
                var data = r.getData().rank_group_items;
                vmodel.zhinengRank.clear();
                vmodel.zhinengRank.pushArray(data);
                avalon.nextTick(function(){vdVm.fixMt();});
            }
        });
        Req.jobcate_group(function(r){
            if(r.isOk()){
                var data = r.getData().job_cate_list;
                vmodel.zhinengType.clear();
                vmodel.zhinengType.pushArray(data);
                avalon.nextTick(function(){vdVm.fixMt();});
            }
        });
        
        return vmodel
    
    };

    widget.defaults = {
        txtList:[],
        listType:"",
        listKey:"",
        zhinengType:[],
        zhinengRank:[],
        listData:[],
        showType:"choose"
    }

    widget.outHtml='<div class="pbd-con" ms-widget="vjob,$"></div>';

    return widget;
});
