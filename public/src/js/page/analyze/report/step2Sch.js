define([
    'jquery','pin','request',
    "common/pinData",
    'common/defaultView',
    "raphael","cityLow","highcharts",
    "widget/page"],function($,pin,Req,pinData,defaultView,Raphael) {    

    var Util = pin.util;
    var Req = pin.request;
    var PageData = $.extend({},window.PageData);

    pin.reg("analyze/report/step2Sch",Util.create(defaultView,{
        id:'pipe_2',
        json:PageData.analyzeStep2SchData,
        mvc:function(){
            var that = this;
            var json = this.json;
            

            return {
				diplomaId:json.diplomaId,
                schoolList:json.schdata.sch_list.slice(0,4),
                yearList:json.yearList,
                nowYear:json.nowYear,
                locType:json.locType,
                cur_province:json.schdata.cur_province,
                cur_region:json.schdata.cur_region,
                topcity:json.schdata.topcity,
                maxPage:Math.ceil(json.schdata.total_sch_count/4),
                $pageCfg:{
                    page:1,
                    maxPage:Math.ceil(json.schdata.total_sch_count/4)
                },
                showMap:function(type){
                    var vm = that.getVm();
                    clearTimeout(vm.$timeId);
                    cityArr = [];
                    switch(type){
                        case 'province':
                            cityArr = [vm.cur_province.loc] ;
                            break;
                        case 'region':
                            cityArr = pinData.REGION[vm.cur_region.loc_id].provList;
                            break;
                        case 'topcity':
                            cityArr = ["北京","上海","广东"]
                            break;
                    }
                    pin.fire("hideMap");
                    pin.fire("showMap",{provList:cityArr})
                },
                $timeId:0,
                releave:function(){
                    var vm = that.getVm();
                    vm.$timeId=setTimeout(function(){
                        pin.fire("hideMap")  
                    },200)                    
                },
                getSchYear:function(year,e){
                    pin.cancelAll(e); 
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.nowYear!=year){
                        that.reload(year,vm.locType);
                    }
                },
                changeLocType:function(locType,e){
                    pin.cancelAll(e); 
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.locType!=locType){
                        that.reload(vm.nowYear,locType);
                    }
                },
                page:function(p){
                    if(!pin.chkLogin())return false;
                    var json = that.json;
                    var vm = that.getVm();
                    vm.schoolList.clear();
                    vm.schoolList.pushArray( json.schdata.sch_list.slice(4*(p-1),4*p) );
                }
            }
        },
        onViewReady:function(){
            this.isLogin = pin.getCfg("isLogin");
            this.isVIP = pin.getCfg("isVip");
            if(!this.isLogin||!this.isVIP){
                //!this.isLogin && this.notLogin();
                //this.isLogin && !this.isVIP && this.notVip();
               return; 
            }
            this.initChart2(this.json);
            this.initChart3(this.json);
            this.initChart4(this.json);
            this.initChart5(this.json);
        },
        reload:function(year,locType){
            var that = this;
            Req.q("/analyze/analyze_step2_schData",{year:year,locType:locType},function(r){
                var vm = that.getVm();
                var json = r.getData();
                that.json = json;

                vm.schoolList=json.schdata.sch_list.slice(0,4);
                vm.yearList=json.yearList;
                vm.nowYear=json.nowYear;
                vm.locType=json.locType;
                vm.cur_province=json.schdata.cur_province;
                vm.cur_region=json.schdata.cur_region;
                vm.topcity=json.schdata.topcity;
                vm.maxPage=Math.ceil(json.schdata.total_sch_count/4);

                that.initChart2(json);
                that.initChart3(json);
                that.initChart4(json);
                that.initChart5(json);
            });
        },
        initChart3:function(json){
            this.initChartPie(this.jq(".chart3"),json.schdata.cur_province.ratio);
        },
        initChart4:function(json){
            this.initChartPie(this.jq(".chart4"),json.schdata.cur_region.ratio);
        },
        initChart5:function(json){
            this.initChartPie(this.jq(".chart5"),json.schdata.topcity.ratio);
        },
        initChartPie:function(el,data){
            data = parseInt(data * 1000)/10;
            el.highcharts({
                chart: {
                    type: 'pie',
                    width : 100,
                    height : 100
                },
                credits:{
                    enabled:false
                },
                legend:{
                    enabled:false,
                    borderWidth:0
                },
                title: {
                    text: data+"%",
                    style:{
                        color:"#4981f2",
                        fontSize:"24px"
                    },
                    y:48,
                    align:"center",
                    floating:true
                },
                plotOptions: {
                    pie: {
                        size:100,
                        animation:false,
                        enableMouseTracking:false,
                        innerSize: 88,
                        dataLabels: {
                            enabled: false
                        },
                        borderWidth:0
                    }
                },
                tooltip: {
                    enabled:false
                },
                series: [ {
                    name: '比例',
                    data: [{name:"设计",y: data,color:"#6699ff"},
                        {name:"工程技术",y: 100-data,color:"#edeef0"}]
                }]
            });
        },
        initChart2:function(json){
            var that = this;
            var _rootY=17,mapScale=0.5042016806722689;
            var cityMap = {};
            json.schdata.loc_ratio_map.forEach(function(item){
                cityMap[item.prov] = item.ratio;
            });
            delete pin.event["showMap"];
            delete pin.event["hideMap"];
            that.jq('.chart2').html('');
            var map=$.extend({
                width:390,
                height:320,
                area:[],
                colors:['#e5eeff','#ccddff','#99bbff','#6699ff','#4981f2'],
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
                    pin.on("hideMap",function(){
                        that.area.forEach(function(item){
                            item.animate({fill:item.data("orgColor")},50);
                        });
                    });
                    pin.on("showMap",function(e){
                        var provList = e.provList;
                        that.area.forEach(function(item){
                            if( provList.indexOf(item.data("locName")) != -1){
                                item.animate({fill:'#2453b2'},50);
                            }
                        });
                    });
                },
                initChart:function () {
                    this.R = new Raphael(that.jq('.chart2')[0], this.width, this.height);
                    for(var i=0,len=this.path.length;i<len;i++){
                        var c = this.R.path(this.path[i].d);
                        var ra = cityMap[this.path[i].title] || 0;
                        var orgColor = ra ? this.colors[Math.min(3,Math.floor(ra/0.1)) + 1] : "#e5eeff";
                        c.attr({
                            fill:orgColor,
                            'stroke-width':'2s',
                            'stroke':'#fbfcff'
                        }).transform("m"+mapScale+",0,0,"+mapScale+",0,"+_rootY)
                        .data("locName",this.path[i].title)
                        .data("orgColor",orgColor)
                        .data("ratio",parseInt(ra * 10000)/100 );
                        this.area.push(c);
                    }
                },
                hoverColor:'#ccddff',
                initEvent:function() {
                    var that = this;
                    $(this.area).each(function(){
                        var originalColor = this.attr().fill;
                        this.hover(function(event) {
                           this.animate({
                               fill : that.hoverColor
                           }, 50);
                            this.attr({fill : that.hoverColor, cursor : 'pointer'});
                            that.hoverCallback(this, event);
                        }).mouseout(function() {
                           this.animate({
                               fill : originalColor
                           }, 50);
                           $('#_tool_tips').remove();
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
                    '<p>'+obj.data('ratio')+'%</p>',
                    '</div>'];
                    $('body').append(tipsConGRIiner.join(''));
                    $('#_tool_tips').show().css({top:y, left:x});
                    }();
                }
            },_citymap);

            map.init();
        }
    }));

    

    return {
        init:function(){
            pin.use("analyze/report/step2Sch");
        }
    }

});
