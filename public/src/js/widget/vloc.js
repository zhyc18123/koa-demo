define(["jquery","pin","avalonGetModel","common/pinData","raphael","cityLow"], function($,pin,avalon,pinData) {
    var widget = avalon.ui["vloc"] = function(element, data, vmodels){

        var innerHtml = ['<div class="pbd-con pbd-con-area">',
                        '    <div class="pca-map"></div>',
                        '    <div class="pca-main">',
                        '        <div class="pca-top">',
                        '            <ul>',
                        '                <li ms-class="active:showType==\'area\'" ms-click="changeType(\'area\',$event)">选择地区</li>',
                        '                <li ms-class="active:showType==\'prov\'" ms-click="changeType(\'prov\',$event)">全部省份</li>',
                        '            </ul>',
                        '        </div>',
                        '        <div class="pca-bd">',
                        '            <div class="pca-con pca-choose-area" ms-visible="showType==\'area\'">',
                        '                <div class="item" ms-repeat-item="recommend">',
                        '                    <span class="ti">{{item.title}}：</span> ',
                        '                    <ul>',
                        '                        <li ms-repeat-el="item.provL" ms-click="add(el,$event)" ms-class="active:pidList.indexOf(el.pid)!=-1">',
                        '                            <span>{{el.name}}</span> ',
                        '                        </li>',
                        '                    </ul>',
                        '                </div>',
                        '            </div>',
                        '            <div class="pca-con pca-all-area" ms-visible="showType==\'prov\'">',
                        '                <div class="item">',
                        '                    <ul>',
                        '                        <li ms-repeat-el="provList" ms-click="add(el,$event)" ms-class="active:pidList.indexOf(el.pid)!=-1">',
                        '                            <span>{{el.py + " " +el.name}}</span> ',
                        '                        </li>',
                        '                    </ul>',
                        '                </div>',
                        '            </div>',
                        '        </div>',
                        '    </div>',
                        '</div>',
                        ].join('')

        var el = $(innerHtml);
        $(element).after(el);
        el.attr("avalonctrl",data.vlocId)
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

        var watchHandler,clickProv,hideMap,showMap;
        var vdVm = getVmFormId("vd");

        var vmodel = avalon.define(data.vlocId, function(vm) {
            avalon.mix(true,vm, data.vlocOptions);
            vm.$orgData = null;
            vm.$regionProv = null;
            vm.changeType = function(type,e){
                if(vm.showType!=type){
                    vm.showType = type;
                }
                pin.cancelAll(e);
            }
            vm.initMap = function(){
                var _rootY=23,mapScale=0.5171299288946348;
                var el = $(element).find(".pca-map");
                var map=$.extend({
                    width:400,
                    height:340,
                    area:[],
                    init:function() {
                        this.initChart();
                        this.initEvent();
                        this.addIpinEvent();
                    },
                    getColor:function(n) {
                        return parseInt(Math.random() *n)+100
                    },
                    addIpinEvent:function(){
                        var that = this;
                        hideMap = function(){
                            that.area.forEach(function(item){
                                item.animate({fill:"#ccddff"},50);
                            });
                        }
                        showMap = function(e){
                            var provList = e.provList;
                            that.area.forEach(function(item){
                                if( provList.indexOf(item.data("locName")) != -1){
                                    item.animate({fill:'#4499dd'},50);
                                }
                            });
                        }
                        pin.on("_vmap:hideMap",hideMap);
                        pin.on("_vmap:showMap",showMap);
                    },
                    initChart:function () {
                        console.log("Raphael",Raphael);
                        this.R = new Raphael(el[0], this.width, this.height);
                        for(var i=0,len=this.path.length;i<len;i++){
                            var c = this.R.path(this.path[i].d);
                            var orgColor = "#ccddff";
                            c.attr({
                                fill:orgColor,
                                'stroke-width':'1',
                                'stroke':'#fbfcff'
                            }).transform("m"+mapScale+",0,0,"+mapScale+",0,"+_rootY)
                            .data("locName",this.path[i].title)
                            .data("pid",this.path[i].pid);
                            this.area.push(c);
                        }
                    },
                    hoverColor:'#99bbff',
                    initEvent:function() {
                        var that = this;
                        $(this.area).each(function(){
                            var originalColor;
                            this.hover(function(event) {
                                originalColor = this.attr().fill;
                                this.attr({
                                   fill : that.hoverColor
                                });
                                this.attr({fill : that.hoverColor, cursor : 'pointer'});
                                that.hoverCallback(this, event);
                            }).mouseout(function() {
                                this.attr({
                                   fill : originalColor
                                });
                                $('#_tool_tips').remove();
                            });
                            this.click(function(){
                                pin.fire("_vmap:clickProv",{value:this.data("pid"),text:this.data("locName")});
                                this.attr({fill:"#4499dd"});
                                originalColor="#4499dd";
                            })
                        });
                    },
                    hoverCallback: function(obj, e){
                        var evt = e || window.event || event;
                        var x = (evt.pageX || evt.clientX+document.body.scrollLeft+document.documentElement.scrollLeft) + 10;
                        var y = (evt.pageY || evt.clientY+document.body.scrollTop+document.documentElement.scrollTop) + 10;
                        var tool_tips = function(){
                        $('#_tool_tips').length>0 && $('#_tool_tips').remove();
                        var tipsConGRIiner=['<div id="_tool_tips" class="tips-small"> ',
                        '<p>'+obj.data('locName')+'</p>',
                        '</div>'];
                        $('body').append(tipsConGRIiner.join(''));
                        $('#_tool_tips').show().css({top:y, left:x});
                        }();
                    }
                },_citymap);

                map.init();
            }
            vm.$init = function(){
                var getCfg = pin.getCfg;
                var prov = getCfg("prov");
                var region = {};
                //算行政区域
                Object.keys(pinData.REGION).forEach(function(k){
                    var n = pinData.REGION[k]
                    if( n.provList.indexOf(prov)!=-1 ){
                        region = {name:n.title,pid:k}
                        return false
                    }
                });
                //找该区域内部的省份id
                var regionProv = [];
                var provList = pinData.REGION[region.pid].provList;
                provList.forEach(function(item){
                    _citymap.path.forEach(function(i){
                        if(item == i.title){
                            regionProv.push({pid:i.pid,name:item});
                        }
                    })
                });
                vm.$regionProv = regionProv;
                vm.recommend[0].provL.pushArray([
                    {name:prov,pid:getCfg("pid")},
                    region
                ]);
            }
            vm.$remove = function(){
                pin.unon("_vmap:showMap",showMap);
                pin.unon("_vmap:hideMap",hideMap);
                pin.unon("_vmap:clickProv",clickProv);
                if(watchHandler){
                    vdVm.digValue.$unwatch("length",watchHandler);
                }
            }
            vm.add = function(el,e){
                var addFn = function(elItem){
                    if(!vm.pidList.contains(elItem.pid)){
                        vdVm.$hasChange=true;
                        vdVm.digValue.ensure({value:elItem.pid,text:elItem.name});
                    }
                }
                if(isNaN(+el.pid)){
                    vm.$regionProv.forEach(function(item){
                        addFn(item);
                    })
                } else{
                    addFn(el);
                }
                e && pin.cancelAll(e);
            } 
        });
        watchHandler = function(n){
            vmodel.pidList.clear();
            pin.fire("_vmap:hideMap")
            if(n){
                var tmp = [];
                var txt = [];
                vdVm.$hasChange=true;
                vdVm.digValue.$model.forEach(function(item){
                    tmp.push(item.value);
                    txt.push(item.text);
                });
                pin.fire("_vmap:showMap",{provList:txt});
                vmodel.pidList.pushArray(tmp);
            }
        }
        vdVm.digValue.$watch("length",watchHandler);
        vmodel.initMap();
        watchHandler(vdVm.digValue.length);
        vdVm.$hasChange = false;
        clickProv = function(e){
            vmodel.add({pid:e.value,name:e.text});
        }
        pin.on("_vmap:clickProv",clickProv);
        vmodel.$orgData = data;
        vdVm.$loadVm = vmodel;
        
        avalon.nextTick(function() {
            avalon.scan(element, [vmodel].concat(vmodels));
            avalon.nextTick(function(){vdVm.fixMt();});
        });
        
        return vmodel
    
    };

    widget.defaults = {
        showType:"area",
        pidList:[],
        provList:[
            {"py":"A","pid":"34","name":"安徽"},
            {"py":"B","pid":"11","name":"北京"},
            {"py":"C","pid":"50","name":"重庆"},
            {"py":"F","pid":"35","name":"福建"},
            {"py":"G","pid":"45","name":"广西"},
            {"py":"G","pid":"52","name":"贵州"},
            {"py":"G","pid":"44","name":"广东"},
            {"py":"H","pid":"41","name":"河南"},
            {"py":"H","pid":"13","name":"河北"},
            {"py":"H","pid":"46","name":"海南"},
            {"py":"H","pid":"23","name":"黑龙江"},
            {"py":"H","pid":"42","name":"湖北"},
            {"py":"H","pid":"43","name":"湖南"},
            {"py":"J","pid":"22","name":"吉林"},
            {"py":"J","pid":"36","name":"江西"},
            {"py":"G","pid":"62","name":"甘肃"},
            {"py":"J","pid":"32","name":"江苏"},
            {"py":"L","pid":"21","name":"辽宁"},
            {"py":"N","pid":"15","name":"内蒙古"},
            {"py":"N","pid":"64","name":"宁夏"},
            {"py":"Q","pid":"63","name":"青海"},
            {"py":"S","pid":"14","name":"山西"},
            {"py":"S","pid":"37","name":"山东"},
            {"py":"S","pid":"61","name":"陕西"},
            {"py":"S","pid":"31","name":"上海"},
            {"py":"S","pid":"51","name":"四川"},
            {"py":"T","pid":"12","name":"天津"},
            {"py":"X","pid":"65","name":"新疆"},
            {"py":"X","pid":"54","name":"西藏"},
            {"py":"Y","pid":"53","name":"云南"},
            {"py":"Z","pid":"33","name":"浙江"}
        ],
        recommend:[
            {title:"推荐地区",provL:[]},
            {title:"发达城市",provL:[
                { pid: '11', name: '北京' },
                { pid: '31', name: '上海' },
                { pid: '4403', name: '深圳' },
                { pid: '4401', name: '广州' },
                { pid: '4201', name: '武汉' },
                { pid: '6101', name: '西安' },
                { pid: '3201', name: '南京' },
                { pid: '12', name: '天津' },
                { pid: '5101', name: '成都' },
                { pid: '2201', name: '长春' },
                { pid: '50', name: '重庆' },
                { pid: '2101', name: '沈阳' } 
            ]},
            {title:"空气质量优",provL:[
                { pid: '4401', name: '广州' },
                { pid: '3601', name: '南昌' },
                { pid: '5301', name: '昆明' },
                { pid: '5201', name: '贵阳' },
                { pid: '3501', name: '福州' },
                { pid: '4501', name: '南宁' },
                { pid: '3502', name: '厦门' },
                { pid: '3302', name: '宁波' },
                { pid: '6401', name: '银川' },
                { pid: '3303', name: '温州' }
            ]},
            {title:"最具幸福感",provL:[
                { pid: '6101', name: '西安' },
                { pid: '3201', name: '南京' },
                { pid: '12', name: '天津' },
                { pid: '5101', name: '成都' },
                { pid: '2201', name: '长春' },
                { pid: '3301', name: '杭州' },
                { pid: '4301', name: '长沙' },
                { pid: '2102', name: '大连' },
                { pid: '4404', name: '珠海' },
                { pid: '4306', name: '岳阳' } 
            ]}
        ]
    }

    widget.outHtml='<div class="pbd-con" ms-widget="vloc,$"></div>';

    return widget;
});
