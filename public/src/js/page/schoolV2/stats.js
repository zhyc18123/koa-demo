define(["jquery","pin",'ui/ux',"highstock","raphael","chart/maps/chinaMap"],function($,pin,ux,Highstock,Raphael,chinaMap){

    var Util = pin.util;
    var TooltipInit = Highcharts.Tooltip.prototype.init;
    //console.log(ux)
    Highcharts.Tooltip.prototype.init = function(chart, options) {
        TooltipInit.apply(this, arguments);
        options.hide && ( this.hide = options.hide);
    };

    var ept = {
        jq:function(selector){
            return this.view.find(selector);
        },

        init:function(){
            this.onViewReady();
        },
        onViewReady:function(){
            /**
             * Set view & data
             */
            this.view = $('.sch-mod.salary').parent()
            this.json = pin.getCfg('employment')

            this.report = this.json.report;
            this.setSize();

            this.cache = {
                provinceSal: this.json.provinceSal,
                countrySal: this.json.countrySal
            }

            if(this.json.smallSample) return;
            if( !this.json.showDetails ){
                this.initSalarySelect();
                this.initSalary();
                
                if( this.json['zhineng_dis'] ){
                    this.initFun();
                }
                this.initInd();
                this.initLoc();
                this.initLocCity();
            }else{
                if(this.jq('.invite').length){
                    require('pipe/inviteShare.js',$.noop);
                }
            }
        },
        setSize:function(){
            if(!this.report){
                //原始的
                this.size = {
                    area:{width:410,height:320},
                    areaLoc:{width:414,height:280},
                    ind:{width:820,height:360},
                    fun:{width:380,height:360},
                    salary:{width:820,height:280}
                }
            } else {
                this.size = {
                    area:{width:414,height:360},
                    areaLoc:{width:414,height:360},
                    ind:{width:820,height:350},
                    fun:{width:370,height:380},
                    salary:{width:820,height:280}
                }
            }
        },
        initSalarySelect:function(){
            var topThis = this;
            var el = this.jq('.salary');
            var sel = el.find(".control")[0];
            pin.use("Base",{
                view:sel,
                onViewReady:function(){
                    var that = this;
                    var allCheckbox  = this.jq(".c-right i.checkbox");
                    allCheckbox.click(function(i){
                        var el = $(this);
                        allCheckbox.removeClass("checkbox-checked");
                        el.addClass("checkbox-checked");
                        var salData,v = -1
                        if ($(allCheckbox).index(el) == 0) {
                            salData = topThis.json.countrySal
                            that.jq('.c-right .c-item').eq('0').find('div').css('display', 'inline')
                            that.jq('.c-right .c-item').eq('1').find('div').css('display', 'none')

                        } else {
                            v = 1
                            salData = topThis.json.provinceSal
                            that.jq('.c-right .c-item').eq('0').find('div').css('display', 'none')
                            that.jq('.c-right .c-item').eq('1').find('div').css('display', 'inline')
                        }
                        that.loadSalary(v, salData)
                        return false;
                    })
                },
                loadSalary:function(v,data){
                    var allCheckbox  = this.jq(".c-right .c-item>div");
                    var el  = this.jq(".c-right i.checkbox-checked");
                    topThis.compareSalary = data;
                    topThis.initSalary(v);
                }
            }).getView();
            this.compareSalary = [];
            $.extend(true,this.compareSalary,this.json.countrySal);
        },
        cache:{},
        getErrorData:function(data){
            var error = [];
            var jump = [],now=undefined,nowI;
            for(var i=0,len=data.length;i<len;i++){
                if(data[i].virtual_flag){
                    error.push(i);
                }
                if(now == undefined){
                    now = data[i].x;
                    nowI = i
                } else {
                    if(now != data[i].x-1){
                        jump.push([nowI,i])
                    } else {
                        now = data[i].x;
                        nowI = i
                    }
                }
            }
            if(error.length || jump.length){
                var out=[];
                var outData = [];
                var lineTpl = {
                    type:'line',
                    animation:false,
                    lineColor:"#fff",
                    enableMouseTracking:true,
                    lineWidth: 3,
                    marker:{
                        symbol:'circle',
                        fillColor: '#fff',
                        lineWidth: 2,
                        lineColor: "#358cd5",
                        states:{
                            hover:{
                                lineColor:"#ffffff",
                                fillColor:'#358cd5',
                                radius:8
                            }
                        },
                        radius:4,
                        tooltip:{
                            enabled:false
                        }
                    },
                    dashStyle: 'dot',
                    zIndex:13
                }
                var minP=error[0],maxP=error[0],section=[],maxLen=data.length;
                for(var i=1,len=error.length;i<len;i++){
                    if( error[i] == maxP+1 || error[i] == maxP+2){
                        maxP = error[i];
                    } else {
                        section.push([ Math.max(minP-1,0) , Math.min(maxP+1,maxLen)]);
                        minP = maxP = error[i];
                    }
                }
                error.length && section.push([ Math.max(minP-1,0) , Math.min(maxP+1,maxLen)]);

                for(var i=0,len=jump.length;i<len;i++){
                    section.push(jump[i]);
                }
                for(var i = 0,len=section.length;i<len;i++){
                    var t = [];
                    for(var j=section[i][0],jlen=section[i][1];j<=jlen;j++){
                        t.push(data[j]);
                    }
                    outData.push(t)
                }
                for(var i=0,len=outData.length;i<len;i++){
                    var t = $.extend({},lineTpl);
                    t.data = outData[i];
                    out.push(t);
                }
                return out;
            } else{
                return []
            }
        },
        getSalarySeries:function(v){
            var data = [],salary = this.json.salary;
            var compareSalary = this.compareSalary;
            var data1=[];

            var k = "grad_year";
            salary.length && salary[0].after_graduation_year!=undefined && (k = "after_graduation_year")
            salary = salary.sort(function(a,b){ return a[k]-b[k]});

            k = "after_graduation_year";
            compareSalary.length && compareSalary[0].grad_year!=undefined && (k = "grad_year")
            compareSalary = compareSalary.sort(function(a,b){ return a[k]-b[k] });

            for(var i=0,len=salary.length;i<len;i++){
                data.push({
                    x:salary[i].grad_year || salary[i].after_graduation_year,
                    y:parseInt(salary[i].salary),
                    virtual_flag:salary[i].virtual_flag
                });
            }
            for(var i=0,len=compareSalary.length;i<len;i++){
                data1.push({
                    x:compareSalary[i].grad_year || compareSalary[i].after_graduation_year,
                    y:parseInt(compareSalary[i].salary)
                })
            }
            var series = [{
                type:'line',
                data: data,
                zIndex:10
            },{
                type:'line',
                animation:false,
                data: data1,
                lineColor:"#bfbfbf",
                enableMouseTracking:false,
                lineWidth: 2,
                marker:{
                    symbol: v ? ( v == "-1" ? 'circle' : "triangle" ) : "circle",
                    fillColor: '#fff',
                    lineWidth: 2,
                    lineColor: "#bfbfbf",
                    states:{
                        hover:{
                            lineColor:"#bfbfbf",
                            lineWidth:2,
                            radius:4
                        }
                    },
                    radius:4,
                    tooltip:{
                        enabled:false
                    }
                },
                zIndex:9
            }].concat(this.getErrorData(data));
            return series

        },
        initSalary:function(v){
            var that = this;
            var el = this.jq('.salary');
            var series  = this.getSalarySeries(v);
            var title = {};
            var manData = {};
            var manData1 = {};

            if(series[0].data.length == 0){
                title = {
                    text: "<div style='padding: 10px 20px;background: #ccc;color: #666;margin: -40px 0 0 40px;border-radius: 3px;'>很抱歉，样本不足无法展示</div>",
                    floating:true,
                    verticalAlign:'middle',
                    useHTML:true
                }
            } else {
                if( series.length>2 ){
                    // 有虚线部分
                    if(!this.json.major_second_category){
                        title = {
                            text: "<div style='background:#fff; padding: 5px; margin: -5px 0px 0px -5px;'>蓝色虚线表示对应年份样本不足</div>",
                            y:20,
                            x:60,
                            useHTML:true,
                            align:'left',
                            floating:true,
                            style:{
                                fontSize:'12px',
                                color:"#49d"
                            }
                        }
                    } else {
                        title = {
                            text: ["<div id='salTitleDiv' style='cursor: pointer;padding: 10px 20px;background: #ccc;color: #666;margin: -40px 0 0 40px;border-radius: 3px;'>",
                            "薪酬样本不足！<span style=' text-decoration: underline;'>查看"+this.json.major_second_category +"的薪酬情况</span></div>"].join(''),
                            floating:true,
                            verticalAlign:'middle',
                            useHTML:true
                        }
                        manData = series.pop()
                        manData1 = series.shift()
                    }
                } else{
                    title = {
                        text: "",
                        floating:true
                    }
                }
            }

            el.find('.chart').length&&el.find('.chart').highcharts({
                chart: {
                    type: 'area',
                    width:that.size.salary.width,
                    height:that.size.salary.height,
                    backgroundColor:"#fff",
                },
                title: title,
                xAxis: {
                    labels: {
                        formatter: function() {
                            if(this.value == 0){
                                return '刚毕业';
                            } else{
                                return "已毕业"+this.value+"年"; 
                            }
                        }
                    },
                    lineWidth:0,
                    tickWidth:0,
                    showLastLabel:true,
                    gridLineWidth:1
                    //tickInterval:1
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    gridLineWidth:1,
                    labels: {
                        formatter:function(){
                            if(this.value){
                                return this.value
                            } else {
                                return ""
                            }
                        }
                    }
                },
                legend:{
                    enabled:false
                },
                tooltip: {
                    shadow:false,
                    useHTML:true,
                    backgroundColor : 'rgba(0, 0, 0, 0.7)',
                    borderWidth:0,
                    style:{
                        color:"#ccc"
                    },
                    positioner:function(w,h,p){
                        var cw = this.chart.chartWidth,ch=this.chart.chartHeight;
                        var v = {x:p.plotX,y:p.plotY-12-46};
                        v.x = v.x<0?0:v.x;
                        v.x = v.x+w>cw?cw-w:v.x;
                        v.y = v.y<0?0:v.y;
                        v.y = v.y+h>ch?ch-h:v.y;
                        return v;
                    },
                    formatter : function(){
                        var series = this.series;
                        var rev = "月薪"+this.y;
                        for(var i=0,len=series.chart.series.length;i<len;i++){
                            if( series.chart.series[i].group.zIndex == 10){
                                series = series.chart.series[i];
                                break;
                            }
                        }
                        if (this.x != 0 ){
                            var i = 0;
                            for(i=0;i<series.xData.length;i++){
                                if(series.xData[i] == this.x) break;
                            }
                            y1 = series.yData[i-1];
                            c = parseInt((this.y-y1)/y1*10000)/100||0;
                            rev+="<br/>涨幅" + c + "%"
                        }
                        return rev + "<i class='down'></i>";
                    }
                },
                credits:{
                    enabled:false
                },
                plotOptions: {
                    area: {
                        animation:false,
                        lineWidth: 3,
                        fillOpacity:.6,
                        marker: {
                            fillColor: 'white',
                            lineWidth: 2,
                            lineColor: "#358cd5",
                            states:{
                                hover:{
                                    lineColor:"#ffffff",
                                    fillColor:'#358cd5',
                                    radius:8
                                }
                            },
                            radius:4
                        },
                        color:"#e6eef6",
                        lineColor:"#358cd5",
                        zIndex:4
                    }
                },
                series: series
            },function(chart){
                var el  = chart.tooltip.label.div;
                el && $(el).css('left','-1000px');
                $("#salTitleDiv").click(function(){
                    chart.addSeries(manData);
                    chart.addSeries(manData1);
                    chart.setTitle({
                        text: "<div style='background:#fff; padding: 5px; margin: -5px 0px 0px -5px;'>薪酬样本不足，改为显示"+that.json.major_second_category+"的薪酬情况</div>",
                        y:20,
                        x:60,
                        useHTML:true,
                        align:'left',
                        floating:true,
                        verticalAlign:"top",
                        style:{
                            fontSize:'12px',
                            color:"#49d"
                        }
                    });
                })
            });

        },
        initFun:function(){
            var fun = this.jq('.fun');
            var func = this.json['zhineng_dis'];
            var color = ["#6699ff","#99bbff","#ccddff","#e5eeff","#e1e1e3"];
            var now;
            function selected(point){
                if(!point) return;
                now = point.x;
                var series = point.series;

                $(series.points).each(function (i) {
                   this.applyOptions({color:color[i]||"#e1e1e3",sliced: false,selected:false});
                });
                point.applyOptions({color:"#7db7ec",sliced: true,selected: true});
                series.update();
                $("path",series.group.element).on("click",function(){});
                fun.find('.pos-mask ul').css({"marginLeft":-now*350});
            }
            var data = [];
            for(var i =0,len=func.length;i<len;i++){
                data.push({
                    name:func[i].zhineng,
                    y:func[i].ratio,
                    color:color[i]||"#e1e1e3",
                    onMouseOver:function(){selected(this);}
                })
            }
            var that = this;

            fun.find('.chart').length&&fun.find('.chart').highcharts({
                chart: {
                    type: 'pie',
                    width:that.size.fun.width,
                    height:that.size.fun.height
                },
                legend:{
                    width:200,
                    borderWidth:0
                },
                title: {
                    text: "",
                    floating:true
                },
                credits:{
                    enabled:false
                },
                plotOptions: {
                    pie: {
                        size:200,
                        shadow: false,
                        animation:true,
                        allowPointSelect:true,
                        cursor:"pointer",
                        showInLegend: true,
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function() {
                                return  /*this.key + " "+*/parseInt(this.percentage*100)/100 +' %';
                            }
                        },
                        borderWidth:3
                    }
                },
                tooltip: {
                    enabled:false
                },
                series: [ {
                    name: '比例',
                    data: data,
                    rotation:100
                }]
            },function(chart) {
                var allLen = fun.find(".pos-mask ul").find("li").length;
                selected(chart.series[0].points[0]);
                fun.find(".right>a:eq(0)").click(function(){
                    if( now >0 ){
                        selected(chart.series[0].points[now-1]);
                    }
                    return false;
                });
                fun.find(".right>a:eq(1)").click(function(){
                    if( now < allLen-1 ){
                        selected(chart.series[0].points[now+1]);
                    }
                    return false;
                });
            });
        },
        initInd:function(){
            var ind = this.jq('.ind');
            var indJson = this.json.ind||[];

            var p = null;
            function selected(point){
                if(p == point.x) return;
                p = point.x;
                var series = point.series;

                $(series.points).each(function (i) {
                   this.applyOptions({
                        color:"#ccc",
                        dataLabels:{
                            enabled:true,
                            color: '#999',
                            formatter: function() {
                                return this.y +'%';
                            }
                        }
                    });
                });
                point.applyOptions({color:"#7db7ec",dataLabels:{enabled:false}});
                series.chart.tooltip.refresh(point);
                series.update();
            }
            var data = [],categories=[];
            for(var i=0,len = indJson.length;i<len;i++){
                categories.push(indJson[i].ind_name||'None')
                data.push({
                    y:indJson[i].ratio,
                    //color:"#ccc",
                    /*onMouseOver:function(e){
                        selected(this);
                    }*/
                })
            }
            var that = this;
            ind.find('.chart').length&&ind.find('.chart').highcharts({
                chart: {
                    type: 'column',
                    inverted:true,
                    width:that.size.ind.width,
                    height:that.size.ind.height
                },
                title: {
                    text: "",
                    floating:true
                },
                xAxis: {
                    categories: categories,
                    gridLineWidth:0
                },
                yAxis: {
                    title: {text: null},
                    gridLineWidth:1,
                    labels:{
                        enabled:true,
                        formatter:function(){
                            return this.value+"%";
                        }
                    }
                },
                tooltip: {
                    enabled:false
                },
                legend:{
                    enabled:false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        animation:false,
                        pointWidth:10,
                        selected:false,
                        color:'#6699ff',
                        dataLabels:{
                            enabled:true,
                            style:{color:"#333"},
                            formatter:function(){
                                return this.y+"%";
                            }
                        }
                    }
                },
                series: [{
                    data: data
                }]
            }/*,function(chart) {
                selected(chart.series[0].points[0]);
            }*/);
        },
        initLoc:function(){
            var el = this.jq('.area');
            var that = this;
            var loc = this.json.loc;
            var mapScale = 2.388720577953865;
            var mapOrgHeight = 126.05999999999989;
            var _rootY=9,t_x=-1630,t_y=-681+_rootY;
            /*var mapScale = 2.9152526931924294;
            var mapOrgHeight = 126.05999999999989;
            var _rootY=31,t_x=-1987,t_y=-830+_rootY;*/
            if(loc.length ==0){return;}
            var map = {
                //width:500,
                //height:430,
                width:410,
                height:320,
                mapScale:mapScale,
                circle:[],
                path:chinaMap.path,
                colors:['#9dd0fe','#86c7fa','#6ab7f4','#53a6e8','#4499dd'],
                init:function() {
                    el.length&&this.initChart();
                    this.initEvent();
                },
                initChart:function () {
                    this.R = new Raphael(that.jq('#mapdiv')[0], this.width, this.height);
                    this.mapObj = this.R.path(this.path);
                    this.mapObj.attr({
                        fill:'#efefef',
                        'stroke-width':'0.2',
                        stroke:'#ccc'
                    })
                    .transform("m"+mapScale+",0,0,"+mapScale+","+t_x+","+t_y);
                    //.transform('t-517.9634,-132.5905s'+this.mapScale);

                    var maxR = loc[0]._ratio;
                    var k = maxR/100*30;
                    for(var i=0,len=loc.length;i<len;i++){
                        var _c = Math.min( 3+k*loc[i].ratio/100, 25);
                        var c = this.R.circle(this.longitudeToCoordinate(loc[i].loc_x), this.latitudeToCoordinate(loc[i].loc_y),_c);
                        var coloridx = parseInt(loc[i].ratio/20);
                        c.attr({
                            fill:this.colors[ Math.max(0,Math.min(coloridx,4)) ] ,
                            'fill-opacity':'.9',
                            'stroke-width':'0',
                            stroke:'#ccc'
                          })
                         .data("city_name", loc[i].city_name)
                         .data("ratio", loc[i]._ratio)
                         .data("i",i)
                        this.circle.push(c);
                    }
                },
                hoverColor:'#0066cc',
                initEvent:function() {
                    var that = this;
                    $(this.circle).each(function(){
                        this.data('originalColor',this.attr().fill);
                        this.hover(function(event) {
                            that.hoverCallback(this,event);
                            pin.fire("locHover",{idx:this.data('i')});
                        }).mouseout(function() {
                           that.removeSelected(this);
                           //$('#_tool_tips').remove();
                        })
                    });
                    pin.on("locCityHover",function(e){
                        that.circle.length&&that.hoverCallback(that.circle[e.idx]);
                    });
                    that.circle.length&&that.hoverCallback(that.circle[0]);
                },
                nowSelect:null,
                showSelected:function(obj){
                    obj.animate({fill : this.hoverColor}, 50)
                    obj.attr({fill : this.hoverColor, cursor : 'pointer'});
                    if(this.nowSelect){
                        this.removeSelected(this.nowSelect);
                    }
                    this.nowSelect = obj;
                },
                removeSelected:function(obj){
                    obj.animate({fill : obj.data('originalColor')}, 50);
                    this.nowSelect = null;
                },
                hoverCallback: function(obj,e){
                    var s  = $(obj.node).position();
                    var p = $(obj.node.parentNode).position();

                    s = $(obj.node)[0].getBoundingClientRect();
                    p = $(obj.node.parentNode)[0].getBoundingClientRect();
                    console.log('getBoundingClientRect fixed')

                    this.showSelected(obj);
                    $('#_tool_tips').length > 0 && $('#_tool_tips').remove();
                    $('<div id="_tool_tips" class="tips-small"><p>'+obj.data('city_name')+'<br/>'+ obj.data('ratio') +'%</p></div>')
                        .css({
                            left: s.left-p.left + 40 - (31-obj.attr('r')),
                            top : s.top-p.top + 80 - 48 - 10
                        })
                        .appendTo('#anchor-sch-location')
                },
                dataProvider:{
                    leftLongitude:73.554302,
                    topLatitude:53.561780,
                    rightLongitude:134.775703,
                    bottomLatitude:18.155060
                },
                latitudeToCoordinate: function(a) {
                    var b, c = this.dataProvider;
                    b = c.topLatitude;
                    var d = c.bottomLatitude;
                    a = this.mercatorLatitudeToCoordinate(a), b = this.mercatorLatitudeToCoordinate(b), d = this.mercatorLatitudeToCoordinate(d)
                    b = (a - b) / (d - b) * mapOrgHeight * this.mapScale;
                    //b = (a - b) / (d - b) * this.mapHeight;
                    return b + _rootY ;
                },
                longitudeToCoordinate: function(a) {
                    var b, c = this.dataProvider;
                    b = c.leftLongitude, b = (a - b) / (c.rightLongitude - b) * this.width;
                    return b
                },
                mercatorLatitudeToCoordinate: function(a) {
                    89.5 < a && (a = 89.5); - 89.5 > a && (a = -89.5);
                    a = a / 180 * Math.PI;
                    a = 0.5 * Math.log((1 + Math.sin(a)) / (1 - Math.sin(a)));
                    return 180 * (a / 2 / Math.PI);
                }
            }
            map.init();
        },
        initLocCity:function(){
            var loc = this.json.loc,p;
            var el = this.jq(".sch-area .right");
            var data = [];
            var categories = [];
            var chartObj = null;
            var that = this;
            function selected(point){
                if(!point||p == point.x) return;
                p = point.x;
                var series = point.series;

                $(series.points).each(function (i) {
                    this.applyOptions({
                        color:"#6699ff"
                    });
                });
                var ops = {color:"#2453b3"};
                if(point.shapeArgs.height > 310){
                    ops.dataLabels = {
                        style:{color:"#eee"}
                    }
                }
                point.applyOptions(ops);
                series.update();
            }
            pin.on("locHover",function(e){
                if(chartObj.series[0].points.length>e.idx){
                    selected(chartObj.series[0].points[e.idx]);
                }
            })
            for(var i=0,len=loc.length;i<len && i<10;i++){
                data.push({y:loc[i]._ratio,idx:i});
                categories.push(loc[i].city_name)
            }
            
            for(var i=0,len=data.length;i<len;i++){
                data[i].color = "#6699ff";
                data[i].onMouseOver = function(e){
                    pin.fire("locCityHover",{idx:this.idx});
                    selected(this);
                };
            }
            el.length&&el.highcharts({
                chart: {
                    type: 'column',
                    inverted:true,
                    width:that.size.areaLoc.width,
                    height:that.size.areaLoc.height
                },
                title: {
                    text: "",
                    floating:true,
                },
                xAxis: {
                    categories: categories,
                    gridLineWidth:0
                },
                yAxis: {
                    title: {text: null},
                    gridLineWidth:1,
                    showLastLabel:false,
                    minTickInterval:1,
                    labels:{
                        enabled:true,
                        formatter:function(){
                            return this.value+"%";
                        }
                    }
                },
                tooltip: {
                    enabled:false
                },
                legend:{
                    enabled:false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        pointWidth:10,
                        showCheckbox:true,
                        selected:true,
                        animation:false,
                        color:"#6699ff",
                        dataLabels:{
                            enabled:true,
                            style:{color:"#333"},
                            formatter: function(a,b) {
                                return this.y +'%';
                            }
                        }
                    }
                },
                series: [{
                    data: data
                }]
            },function(chart){
                chartObj = chart;
                selected(chart.series[0].points[0]);
            });
        }
    }
    return ept;
})
