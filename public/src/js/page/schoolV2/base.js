define(["jquery","pin","ui/ui","ui/ux","highstock","raphael","chart/maps/chinaMap","common/common"],function($,pin,ui,ux,Highcharts,Raphael,chinaMap,common){
    var Util = pin.util;
 
    var ept = {
        init:function(){
            this.onViewReady();
        },
        onViewReady:function(){
            /**
             * Set view & data
             */
            this.view = $('.sch-mod.summary')
            this.json = pin.getCfg('employment')
            //console.log(this.json)

            if($("ul.block-list").length){
                this.initChart1();
                this.initChart2();
                this.initChart3();
                this.initChart4();
            }
        },

        initChart1:function(){
            this.json.salary = this.json.salary||[];
            this.json.countrySal = this.json.countrySal||[];
            var salary = this.json.salary.slice(0,5).map(function(o) {return parseInt(o.salary)})
            var countrySal = this.json.countrySal.slice(0,5).map(function(o) {return parseInt(o.salary)})
            $(".chart-1").length&&$(".chart-1").highcharts({
                chart: {
                    type: 'line',
                    width: 110,
                    height:80
                },
                title: {
                    text: "",
                    floating:true,
                },
                xAxis: {
                    lineWidth:0,
                    showFirstLabel:false,
                    showEmpty:false,
                    tickPosition:"inside",
                    tickWidth:0,
                    gridLineWidth:0,
                    labels:{enabled:false}
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    lineWidth:0,
                    gridLineWidth:0,
                    labels:{enabled:false}
                },
                legend:{
                    enabled:false
                },
                tooltip: {
                    enabled:false
                },
                credits:{
                    enabled:false
                },
                plotOptions: {
                    line: {
                        animation:false,
                        lineColor:"#5389f6",
                        enableMouseTracking:false,
                        zIndex:4,
                        marker:{enabled:false},
                    }
                },
                series: [{
                    type:'line',
                    data: salary,
                    zIndex:10
                },{
                    type:'line',
                    data: countrySal,
                    lineColor:"#dcdcdc",
                    zIndex:3
                }]
            });
        },
        initChart2:function(){
            var color=["#6699ff","#99bbff","#ccddff","#e5eeff","#edeef0"];
            var ind = this.json.ind||[];
            var data = [];
            for(var i=0,len=ind.length;i<len;i++){
                data.push({
                    name:ind[i].ind_name,
                    y:ind[i].ratio,
                    color:color[i]||"#edeef0"
                });
            }
            $(".chart-2").length&&$(".chart-2").highcharts({
                chart: {
                    type: 'pie',
                    width : 90,
                    height : 90
                },
                credits:{
                    enabled:false
                },
                legend:{
                    enabled:false,
                    borderWidth:0
                },
                title: {
                    text: "",
                    floating:true,
                },
                plotOptions: {
                    pie: {
                        size:90,
                        animation:false,
                        enableMouseTracking:true,
                        innerSize: 50,
                        dataLabels: {
                            enabled: false
                        },
                        borderWidth:2,
                        tooltip:{
                            pointFormat:"{point.y}%",
                            hideDelay:200
                        }
                    }
                },
                tooltip: {
                    enabled:true
                },
                series: [ {
                    name: '比例',
                    data: data
                }]
            })
        },
        initChart3:function(){
            console.log("initChart3")
            var that = this;
            var loc = this.json.loc[0]||{};
            var _rootY=6,_x=-477,_y=-199+_rootY,mapScale=0.6991377301328385,mapHeight = 88.13330226054555;
            var map = {
                height : 100,
                width : 120,
                init:function(){
                    var holder = $(".chart-3")[0];
                    if(!holder){
                        return;
                    }
                    this.R = new Raphael(holder, this.width, this.height);
                    this.mapObj = this.R.path(this.path);

                    this.mapObj.attr({
                        fill:'#edeef0',
                        'stroke-width':'0.2',
                        stroke:'#f2f3f5'
                    });
                    this.mapObj.transform("m"+mapScale+",0,0,"+mapScale+","+_x+","+_y);
                    this.R.circle(this.longitudeToCoordinate(loc.loc_x), this.latitudeToCoordinate(loc.loc_y),4).attr({
                        "fill":"#4981f2" ,
                        'fill-opacity':'.9',
                        'stroke-width':'0',
                        stroke:'#ccc'
                    });
                },
                latitudeToCoordinate: function(a) {
                    var b, c = this.dataProvider;
                    b = c.topLatitude;
                    var d = c.bottomLatitude;
                    a = this.mercatorLatitudeToCoordinate(a), b = this.mercatorLatitudeToCoordinate(b), d = this.mercatorLatitudeToCoordinate(d);
                    b = (a - b) / (d - b) * mapHeight;
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
            $.extend(map,chinaMap);
            map.init();
        },
        initChart4:function(){
            var male_ratio = this.json.male_ratio;
            $(".chart-4").length&&$(".chart-4").highcharts({
                chart: {
                    type: 'pie',
                    width : 90,
                    height : 90
                },
                credits:{
                    enabled:false
                },
                legend:{
                    enabled:false,
                    borderWidth:0
                },
                title: {
                    text: "",
                    floating:true,
                },
                plotOptions: {
                    pie: {
                        size:90,
                        animation:false,
                        enableMouseTracking:false,
                        innerSize: 50,
                        dataLabels: {
                            enabled: false
                        },
                        borderWidth:2
                    }
                },
                tooltip: {
                    enabled:false
                },
                series: [ {
                    name: '比例',
                    data: [
                        {name:"女",y: (100-male_ratio)/100,color:"#ffe5e5"},
                        {name:"男",y: male_ratio/100,color:"#6699ff"}
                    ]
                }]
            })
        }
    }
    return ept;
});