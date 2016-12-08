define([
    "jquery","pin","avalon","common/pinData",
    "common/defaultView",
    "page/zhiyuan/zhiyuan/listArea",
    "widget/selectbox",
    "widget/select",
    "widget/page",
    "widget/vloc",
    "widget/vjob",
    "widget/vmajor",
    "widget/vdialog",
    "widget/userUpgrade"
    ],function($,pin,avalon,pinData,defaultView,listArea,Selectbox,Select,Page,Vloc,Vjob,Vmajor,Vdialog,UserUpgrade) {

    var Util = pin.util;
    var Req = pin.request;
    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]} 
    var resetIng = false;

    var isLogin = getCfg("isLogin");
    var isVip = isLogin&&getCfg("isVip");
    var cardPrivilege = getCfg("cardPrivilege");


    pin.reg("zhiyuan/zhiyuan/selectArea",Util.create(defaultView,{
        id:'pipe_1',
        name:"selectArea",
        json:PageData.selectAreaData,
        vmBind:function(vm){
            console.log("selectArea vmBind");
            


            var that = this;
            var rootVm = this.getVmFormId('root');
            var vd;//vdialog , todo:貌似已废弃的对话窗，待清理
            var submit = function(){
                if(resetIng)return;
                if(!vd){
                    vd = that.getVmFormId("vd");
                    console.log("getVmFormId vd>>>",vd)
                }
                if(!vd.display){
                    that.submit();
                }
            };

            var showTypeSubmit = function(v){
                resetIng = true;
                var _data = that._getSortData(that.json.isVip,v);
                vm.sortData.clear()
                vm.sortData.pushArray(_data);
                vm.filter.sortFild = _data[0].value;
                vm.filter.searchKey = "";
                vm.filter.sortRule = 'desc';
                resetIng = false;
                submit();
            }



            vm.filter.schLocList.$watch("length",submit);
            vm.filter.jobList.$watch("length",submit);
            vm.filter.majorList.$watch("length",submit);
            vm.filter.schDifficultyList.$watch("length",submit);
            vm.filter.$watch("schType",submit);
            vm.filter.$watch("schPopular",submit);
            vm.filter.$watch("schGender",submit);
            vm.filter.$watch("schAbroad",submit);
            vm.filter.$watch("majorAbroad",submit);
            vm.filter.$watch("majorGender",submit);
            vm.filter.$watch("tomasterLevel",submit);
            //vm.filter.$watch("searchKey",submit);
            vm.filter.$watch("sortFild",submit);
            vm.filter.$watch("sortRule",submit);
            //vm.filter.$watch("pici",submit);  这个会触发提交 自己不用提交了
            vm.filter.$watch("showType",showTypeSubmit);

            pin.on("resetSelect",function(){
                var vm = that.getVm();
                var json = that.json;
                var filter = avalon.mix(true,{},json.filter) || {};
                resetIng = true;
                vm.filter.schLocList.clear();
                vm.filter.majorList.clear();
                vm.filter.jobList.clear();
                vm.filter.schDifficultyList.clear();
                vm.filter.schDifficultyList.pushArray(filter.schDifficultyList);
                vm.filter.schType = "";
                vm.filter.schPopular = "";
                vm.filter.schGender = "";
                vm.filter.majorGender = "";
                vm.filter.schAbroad = "";
                vm.filter.tomasterLevel = "";
                vm.filter.majorAbroad = "";
                vm.filter.searchKey = "";
                vm.filter.sortFild = filter.sortFild||"totalrank";
                vm.filter.sortRule = filter.sortRule||"desc";
                vm.filter.pici = filter.pici || json.myscore.pici;
                vm.filter.showType = filter.showType
                resetIng = false;
            });
            vm.filter.$watch('pici',function(v) {
                location.href="/zhiyuan?batch="+v;
            });
            rootVm.$watch('iszhuanke',function(v) {
                resetIng = true;
                vm.filter.schAbroad = "";
                vm.filter.majorAbroad = "";
                vm.filter.schPopular = "";
                vm.majorData.clear();
                vm.majorData.pushArray( that.getCopy(v?pinData.major_zk:pinData.major_bk) );
                showTypeSubmit(vm.filter.showType)
                resetIng = false;
            });
            vm.$watch("_ready",function(){
                console.log("_ready,fire selectAreaOk")
                pin.cfg.selectAreaOk = true;
                pin.fire('selectAreaOk');
                window.fixBottom();
            });
            vm.filter.$watch('sortFild',function() {
                vm.vipLockStats = that._getVipLockStats(vm.isVip,vm.filter);
            });
            vm.colle.$watch('pici',function(v) {
                vm.colle.iszhuanke = v.substr(0,2) == 'zk';
            })
            vm.$watch('showVipBox',function(v) {
                if(v){
                    $('#pop_overlay').show();
                } else{
                    $('#pop_overlay').hide();
                }
            })
            vm.$watch('isShowDownloadBox',function(v) {
                if(v){
                    $('#pop_overlay').show();
                } else{
                    $('#pop_overlay').hide();
                }
            })



        },
        getCopy:function(arr) {
            return avalon.mix(true,[],arr)
        },
        _getSortData:function(isVip,showType){
            var rootVm = this.getVmFormId('root');
            switch(showType){
                case 'sch':
                    if (rootVm.iszhuanke) {
                        return [ 
                            {text:"毕业生月薪",value:"salary",lock:''},
                            {text:"录取概率",value:"score",lock:!isVip?"lock":"lock_1"},
                            {text:"社会知名度",value:"popular",lock:!isVip?"lock":"lock_1"},
                            {text:"女生占比",value:"maleratio",lock:!isVip?"lock":"lock_1"}
                        ];
                    } else {
                        return [ 
                            {text:"学校综合评级",value:"totalrank",lock:''},
                            {text:"录取概率",value:"score",lock:!isVip?"lock":"lock_1"},
                            {text:"毕业生月薪",value:"salary",lock:!isVip?"lock":"lock_1"},
                            {text:"社会知名度",value:"popular",lock:!isVip?"lock":"lock_1"},
                            {text:"女生占比",value:"maleratio",lock:!isVip?"lock":"lock_1"}
                        ];
                    }
                case 'major':
                    return [ 
                        {text:"毕业生月薪",value:"salary",lock:''},
                        {text:"职业相关度",value:"duikou",lock:!isVip?"lock":"lock_1"},
                        {text:"行业分布面",value:"jobwide",lock:!isVip?"lock":"lock_1"},
                        {text:"女生占比",value:"maleratio",lock:!isVip?"lock":"lock_1"}
                    ];
                case 'schmajor':
                    return [
                        {text:"录取平均分",value:"score",lock:''},
                        {text:"毕业生月薪",value:"salary",lock:!isVip?"lock":"lock_1"},
                        {text:"女生占比",value:"maleratio",lock:!isVip?"lock":"lock_1"}
                    ];
            }
        },
        _getVipLockStats:function(isVip,filter) {
            if(!isVip){
                var iszhuanke = filter.pici.substr(0,2) == 'zk'
                if(iszhuanke){
                    if(filter.showType=='sch' && filter.sortFild=="salary"){
                        return false
                    }
                } else {
                    if(filter.showType=='sch' && filter.sortFild=="totalrank"){
                        return false
                    }
                }
                if(filter.showType=='major' && filter.sortFild=="salary"){
                    return false
                }
                if(filter.showType=='schmajor' && filter.sortFild=="score"){
                    return false
                }
                return true;
            } else {
                return false;
            }
        },
        filterPICI:function(pici,myScore){//zhejiang 2016
            if(myScore.prov=='33'){
                if(pici=='bk1'&&!(myScore.zh_score&&myScore.zx_score)){
                    return false;
                }else if(pici=='bk2'&&!myScore.zh_score){
                    return false;
                }else if(pici=='zk1'&&!myScore.js_score){
                    return false;
                }
            }
            
            return true;
        },
        mvc:function(){
            var that = this;
            var json = this.json;
            var filter = avalon.mix(true,{},json.filter)|| {};
            var piciArr = [];
            var pici = filter.pici||json.myscore.pici;
            getCfg('piciList').forEach(function(p){
                if(!that.filterPICI(p,json.myscore)){
                    console.log(false)
                    return;
                }

                piciArr.push({value:p,text:pinData.PICINAME[p]})
            });

            var rootVm = this.getVmFormId('root');
            rootVm.iszhuanke = pici.substr(0,2) == "zk";


            
            var mvcObj = {
                bao_count:0,
                chong_count:0,
                wen_count:0,
                impossible_count:0,
                total_sch_count:0,
                total_major_count:0,
                total_sch_major_count:0,
                isVip:json.isVip,
                isLogin:json.isLogin,
                vipLockStats:that._getVipLockStats(json.isVip,filter),
                showVipBox:false,
                isShowDownloadBox: false,
                majorData:[],
                showDownloadBox: function() {
                    var vm = that.getVm();
                    vm.isShowDownloadBox = true;
                },
                hideDownloadBox: function() {
                    var vm = that.getVm();
                    vm.isShowDownloadBox = false;
                },
                hideVipBox:function(e) {
                    var vm = that.getVm();
                    vm.showVipBox = false;
                    pin.cancelAll(e);
                },
                checkShowVipBox: function(e) {
                    if (!that.checkVip.call(that)){
                        e.preventDefault();
                    }
                },
                checkShowLoginBox:function(e){
                    if (!that.checkIslogin.call(that)){
                        e.preventDefault();
                    }
                },
                removeFilter:function(t){
                    var vm = that.getVm();
                    var len = 0;
                    switch(t){
                        case 'sch':
                            len = vm.filter.schLocList.length;
                            vm.filter.schLocList.clear();
                            break;
                        case 'major':
                            len = vm.filter.majorList.length;
                            vm.filter.majorList.clear();
                            break;
                        case 'job':
                            len = vm.filter.jobList.length;
                            vm.filter.jobList.clear();
                            break;                 
                    }
                    if(len){
                        that.submit();
                    }
                },
                filter:{
                    schLocList:filter.schLocList||[],//地区列表
                    jobList:filter.jobList||[],//职位列表
                    majorList:filter.majorList||[],//专业列表
                    schDifficultyList:filter.schDifficultyList||[],//学校困难程度
                    schType:filter.schType||"",//院校类型
                    schPopular:filter.schPopular||"",//社会知名度
                    schGender:filter.schGender||"",//男女比例
                    majorGender:filter.majorGender||"",
                    majorAbroad:filter.majorAbroad||"",//出国氛围
                    schAbroad:filter.schAbroad||"",//出国氛围
                    tomasterLevel:filter.tomasterLevel||"",
                    searchKey:filter.searchKey||"",//搜索条件
                    sortFild:filter.sortFild||"total",//排序字段
                    sortRule:filter.sortRule||"desc",//排序方式，
                    pici:pici,
                    showType:filter.showType,
                    page:1
                },
                $schType:{
                    value:filter.schType,
                    $defaultText:"院校类型不限",
                    data:['院校类型不限',"综合","工科","语言","医药","体育","财经","艺术","民族","师范","林业","农业","政法"/*,"军事","党政"*/],
                    $type:'zhiyuan',
                    otherCss:'rows2'
                },
                $schPopular:{
                    value:filter.schPopular,
                    $defaultText:"学校级别不限",
                    $type:'zhiyuan',
                    data:[{text:'学校级别不限',value:'不限'},{text:"985院校",value:"985"},{text:"211院校",value:"211"},{text:"省内知名院校",value:"prov"},{text:"普通院校",value:"normal"}]
                },
                $schGender:{
                    value:filter.schGender,
                    $defaultText:"男女比例不限",
                    $type:'zhiyuan',
                    data:[{text:"男女比例不限",value:"-1"},{text:"男生多(男>60%)",value:">60"},{text:"女生多(女>60%)",value:"<40"},{text:"男女均衡",value:"=50"}]
                },
                $majorGender:{
                    lock:!json.isVip?"lock_icon":"lock_icon_1",
                    value:filter.majorGender,
                    $defaultText:"男女比例不限",
                    $type:'zhiyuan',
                    data:[{text:"男女比例不限",value:"-1"},{text:"男生多(男>60%)",value:">60"},{text:"女生多(女>60%)",value:"<40"},{text:"男女均衡",value:"=50"}],
                    onChange:function() {
                        if(!that.checkVip())return false;
                    }
                },
                $schAbroad:{
                    lock:!json.isVip?"lock_icon":"lock_icon_1",
                    value:filter.schAbroad,
                    $defaultText:"出国比例不限",
                    $type:'zhiyuan',
                    data:[{text:"出国比例不限",value:"-1"},{text:"20%以上",value:">20"},{text:"10%~20%",value:">10"},{text:"5%~10%",value:">5"},{text:"5%以下",value:"<5"}],
                    onChange:function() {
                        if(!that.checkVip())return false;
                    }
                },
                $tomasterLevel:{
                    lock:!json.isVip?"lock_icon":"lock_icon_1",
                    value:filter.tomasterLevel,
                    $defaultText:"读研比例不限",
                    $type:'zhiyuan',
                    data:[{text:"读研比例不限",value:"-1"},{text:"50%以上",value:"lv5"},{text:"40%~50%",value:"lv4"},{text:"30%~40%",value:"lv3"},{text:"20%~30%",value:"lv2"},{text:"20%以下",value:"lv1"}],
                    onChange:function() {
                        if(!that.checkVip())return false;
                    }
                },
                $majorAbroad:{
                    lock:!json.isVip?"lock_icon":"lock_icon_1",
                    value:filter.majorAbroad,
                    $defaultText:"出国难易程度不限",
                    $type:'zhiyuan',
                    data:[{text:"出国难易程度不限",value:"-1"},{text:"易出国，好就业",value:"lv1"},{text:"易出国，不易就业",value:"lv2"},{text:"较易出国，好就业",value:"lv3"},{text:"较易出国，不易就业",value:"lv4"},{text:"不易出国",value:"lv5"}],
                    onChange:function() {
                        if(!that.checkVip())return false;
                    }
                },
                $xingge:{
                    lock:!json.isVip?"lock_icon":"lock_icon_1",
                    value:"职业兴趣测试",
                    $defaultText:"职业兴趣测试",
                    $type:'zhiyuan',
                    data:[{text:"精简版",value:"1"},{text:"专业版",value:"2"}],
                    onChange:function(v){
                        switch(v){
                            case "1":
                                if(!that.checkVip())return false;

                                window.open("/ceping/answer.html","_blank");
                                break;
                            case "2":
                                if(!that.checkTopVip())return false;
                                window.open("/ceping/answera.html","_blank");
                                break;
                        }
                        return false;
                    }
                },
                $pici:{
                    $defaultText:"批次",
                    $type:'zhiyuan',
                    value:filter.pici || json.myscore.pici,
                    data:piciArr
                },
                sortData:that._getSortData(json.isVip,filter.showType),
                $listPici:{
                    $defaultText:"批次",
                    value:filter.pici || json.myscore.pici,
                    data:piciArr,
                    onChange:function(val){
                        var vm = that.getVm();
                        vm.colle._getColleList(val);
                    }
                },
                $selectboxLoc:{
                    data:pinData.city,
                    $defaultText:"学校所在地",
                    $initValue:Selectbox.getSelectData(filter.schLocList),
                    onChange:function(el){
                        var vm = that.getVm();
                        resetIng = true;
                        var text = [];
                        (el||[]).forEach(function(item){
                            text.push({name:item.name,value:item.value});
                        });
                        vm.filter.schLocList.clear();
                        vm.filter.schLocList.pushArray(el||[]);
                        resetIng = false;
                        that.submit();
                    }
                },
                $selectboxMajor:{
                    data: that.getCopy(rootVm.iszhuanke?pinData.major_zk:pinData.major_bk),
                    $defaultText:"按分类选专业",
                    $source:"majorData",
                    $initValue:Selectbox.getSelectData(filter.majorList),
                    onChange:function(el){
                        var vm = that.getVm();
                        resetIng = true;
                        var text = [];
                        (el||[]).forEach(function(item){
                            text.push(item.name);
                        });
                        vm.filter.majorList.clear();
                        vm.filter.majorList.pushArray(text);
                        resetIng = false;
                        that.submit();
                    }
                },
                $selectboxJob:{
                    data:pinData.job,
                    $initValue:Selectbox.getSelectData(filter.jobList),
                    $defaultText:"看就业选专业",
                    onChange:function(el){
                        var vm = that.getVm();
                        resetIng = true;
                        var text = [];
                        (el||[]).forEach(function(item){
                            text.push(item.name);
                        });
                        vm.filter.jobList.clear();
                        vm.filter.jobList.pushArray(text);
                        resetIng = false;
                        that.submit();
                    }
                },
                colle:{
                    showColleBox:false,
                    colleList:[],
                    colleSchCount:getCfg('colleSchCount') || 0,
                    colleMajCount:getCfg('colleMajCount') || 0,
                    pici:json.myscore.pici,
                    difficultList:["chong","wen","bao"],
                    bao_count:0,
                    chong_count:0,
                    impossible_count:0,
                    wen_count:0,
                    iszhuanke:pici.substr(0,2) == "zk",
                    diffFn:function(t){
                        var vm = that.getVm();
                        if(vm.colle.difficultList.contains(t)){
                            vm.colle.difficultList.remove(t);
                        } else {
                            vm.colle.difficultList.push(t);
                        }
                        vm.colle._getColleList();
                    },
                    _getColleList:function(pici){
                        var vm = that.getVm();
                        pici = pici || vm.colle.pici;
                        Req.sel_listColle(pici,vm.colle.difficultList.$model,function(r){
                            if(r.isOk()){
                                var data = r.getData();
                                vm.colle.colleList.clear();
                                data.sch_list.forEach(function(sch){
                                    sch.show=false;
                                    sch.major_list = sch.major_list||[];
                                })
                                vm.colle.colleList.pushArray(data.sch_list);
                                vm.colle.bao_count = data.bao_count;
                                vm.colle.chong_count = data.chong_count;
                                vm.colle.impossible_count = data.impossible_count;
                                vm.colle.wen_count = data.wen_count;
                                vm.colle.showColleBox = true;
                            }
                        });
                    },
                    getColleList:function(e){
                        var vm = that.getVm();
                        if(vm.colle.showColleBox == false){
                            vm.colle._getColleList();
                        } else {
                            vm.colle.showColleBox = false;
                        }
                        pin.cancelAll(e);
                    },
                    showColleSch:function(collesch){
                        if(collesch.major_list.length > 0){
                            collesch.show = !collesch.show;
                        }
                    },
                    colleListDel:function(sch,maj,e,remove){
                        var major_id = maj ? maj.major_id: "";
                        var vm = that.getVm();
                        Req.removeColle(sch.sch_id,major_id,rootVm.iszhuanke?5:7,function(r){
                            remove();
                            if(r.isOk()){
                                var data = r.getData();
                                vm.colle.colleSchCount = data.sch_count; 
                                vm.colle.colleMajCount = data.major_count; 
                            }
                            pin.fire('removeColle',{sch_id:sch.sch_id,major_id:major_id});
                        });
                    } 
                },
                changeShowType:function(type){
                    var vm = that.getVm();
                    vm.filter.showType = type;
                },
                sortFn:function(type,e){
                    var vm = that.getVm();
                    if( vm.filter.sortFild != type ){
                        vm.filter.sortFild = type;
                        vm.filter.sortRule = "desc";
                    } else {
                        if( ["maleratio","totalrank","scorediff","score"].indexOf(vm.filter.sortFild) != -1){
                            vm.filter.sortRule = vm.filter.sortRule == "desc"?"asc":"desc";
                        }
                    }
                    pin.cancelAll(e);
                },
                diffFn:function(t){
                    var vm = that.getVm();
                    if(vm.filter.schDifficultyList.contains(t)){
                        vm.filter.schDifficultyList.remove(t);
                    } else {
                        vm.filter.schDifficultyList.push(t);
                    }
                },
                searchFn:function(){
                    var vm = that.getVm();
                    if(vm.filter.searchKey != filter.searchKey){
                        filter.searchKey = vm.filter.searchKey;
                        that.submit();
                    }
                },
                searchKeyDown:function(e){
                    if(e.keyCode == 13){
                        var vm = that.getVm();
                        vm.searchFn();
                        return false
                    }
                },
                showVd:function(type,e){//todo:待清理
                    var vd = that.getVmFormId("vd");
                    var vm = that.getVm();
                    var cfg = {
                        display:true,
                        callback:function(el){
                            return true;
                        }
                    };

                    switch(type){
                        case 'loc':
                            avalon.mix(cfg,{
                                digTitle:"选择学校所在地",
                                digTips:"80.2%考生首先考虑学校所在地",
                                digValue:vm.filter.schLocList.$model,
                                $loadWidget:"vloc",
                                callback:function(el,hasChange){
                                    if(!hasChange){return true;}
                                    vm.filter.schLocList.clear();
                                    vm.filter.schLocList.pushArray(el||[]);
                                    that.submit();
                                    return true;
                                }
                            });
                            break;
                        case 'job':
                            avalon.mix(cfg,{
                                digTitle:"确定梦想职业，快速匹配对口专业",
                                digTips:"你还没有选择梦想职业哦！",
                                digValue:vm.filter.jobList.$model,
                                $loadWidget:"vjob",
                                callback:function(el,hasChange){
                                    var text = [];
                                    if(!hasChange){return true;}
                                    (el||[]).forEach(function(item){
                                        text.push(item.text);
                                    });
                                    vm.filter.jobList.clear();
                                    vm.filter.jobList.pushArray(text);
                                    
                                    //添加专业...
                                    /*var majCate = [];
                                    (el||[]).forEach(function(item){
                                        majCate = majCate.concat(item.value.split("、"));
                                    });
                                    majCate.forEach(function(item){
                                        vm.filter.majorList.ensure(item)
                                    });*/

                                    that.submit();
                                    return true;
                                }
                            });
                            break;
                        case 'major':
                            avalon.mix(cfg,{
                                digTitle:"选择心仪专业，为您找到符合的学校",
                                digTips:"你还没有添加心仪专业哦！",
                                digValue:vm.filter.majorList.$model,
                                $loadWidget:"vmajor",
                                callback:function(el,hasChange){
                                    var text = [];
                                    if(!hasChange){return true;}
                                    (el||[]).forEach(function(item){
                                        text.push(item.text);
                                    })
                                    vm.filter.majorList.clear();
                                    vm.filter.majorList.pushArray(text);
                                    that.submit();
                                    return true;
                                }
                            });
                            break;
                    };
                    pin.cancelAll(e);
                    vd.reset(cfg);
                }
            }
           

            return mvcObj;
        },
        checkTopVip: function(ctx) {
            if(!this.checkVip()){
                return false;
            }
            if (cardPrivilege==3) {
                UserUpgrade.tip();
                return false;
            }
            return true;
        },
        checkVip: function(ctx) {
            if (!this.json.isVip) {
                var vm = this.getVm();
                vm.showVipBox = true;
                return false;
            }
            return true;
        },
        checkIslogin: function(ctx) {
            if (!this.json.isLogin) {
                ipinAuth.loginBox(location.href);
                return false;
            }
            return true;
        },
        submit:function(){
            var vm = this.getVm();
            var listAreaVm = this.getVmFormId("pipe_1_1");
            listAreaVm.reloadList();
        },

        onViewReady:function(){
            var that = this;
            var vm = that.getVm();
            this.onCount();
            pin.on("clickBody",function(e){
                if(document.body.contains(e.target) && !$(".collect-box")[0].contains(e.target)){
                    vm.colle.showColleBox = false; 
                }
            });

            console.log('selectArea onViewReady')
        },
        onCount:function() {
            var that = this;
            var setFn = function(e) {
                var vm = that.getVm();
                vm.bao_count = e.bao_count;
                vm.chong_count = e.chong_count;
                vm.wen_count = e.wen_count;
                vm.impossible_count = e.impossible_count;
                vm.total_sch_count = e.total_sch_count;
                vm.total_major_count = e.total_major_count;
                vm.total_sch_major_count = e.total_sch_major_count;
            };
            pin.on("selCount",setFn);
            var selCount = getCfg("selCount");
            if(selCount){
                setFn(selCount);
            }
        }
    }));
    
    return {
        init:function(){
            listArea.init();
            pin.use("zhiyuan/zhiyuan/selectArea");
        }
    }
    

});
