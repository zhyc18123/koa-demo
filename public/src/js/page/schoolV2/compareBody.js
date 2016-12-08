define(["ux","highstock"],function(){
    var Util = pin.util;
    var Req = pin.request;

    pin.reg("schoolV2/compareBody",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
            this.gender();
            this.salary();
            this.initSelect();
            this.initScore();
            this.initEvent();
        },
        initEvent:function(){
            var that = this;
            this.jq('.school-name .remove').click(function(){;
                var v = $(this).attr('v');
                v && that.removeShowItem(v);
                return false;
            });
            this.jq('.school-name .clear').click(function(){;
                var v = $(this).parent().attr('v');
                for(var i=0,len=that.json.selIds.length;i<len;i++){
                    if( that.json.selIds[i] == v ){
                        break;
                    }
                }
                var arr = v.split('_');
                arr[1] = "";
                that.json.selIds[i] = arr.join('_');
                that.reload();
                return false;
            });
        },
        removeShowItem:function(v){
            pin.util.arrayRemove(this.json.selIds,v);
            var arr = v.split("_");
            arr[1] = "";
            pin.fire('removeSelectItem',{ids:arr.join('_')});
            this.reload();
        },
        initSelect:function(){
            var that = this;
            this.jq(".select").each(function(){
                var El = $(this);
                var id = El.attr('id');
                var selectObj = pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(val){
                        if(id == "selId"){
                            var v = El.attr('v').split("_");
                            var idx = +El.attr('idx');
                            v[1] = val;
                            that.json.selIds[idx] = v.join('_');
                        } else {
                            that.json.scoreFilter[id] = val;
                        }
                        if(id == "pid"){
                            that.json.scoreFilter.pici = "bk1";
                        }
                        this.jq().triggerHandler('blur');
                        that.reload();
                        return false;
                    },
                    afterHide:function(){
                        this._hide("select");
                        if( id == "selId" ){
                            var f = this.val() != "";
                            this.jq(">i.icon").checkClass('clear',f);
                        }
                    }
                });
                selectObj.getView();

                if(id == "selId"){
                    var v = El.attr('v');
                    var majorId = v.split("_")[1];
                    majorId && selectObj.val(majorId);
                    majorId && selectObj.jq(">i.icon").addClass('clear');
                }
            });
        },
        getScoreSeries:function(){
            var rv = [];
            var that = this;
            this.json.dataList.forEach(function(d,idx){
                var data = [];
                var scoreList = d.scoreList;
                for(var i=0,len=scoreList.length;i<len;i++){
                    data.push({
                        x:scoreList[i].year,
                        y:parseInt(scoreList[i].score)
                    });
                }
                var c = [{
                    type:'line',
                    data: data,
                    name:d.sch_name,
                    zIndex:10,
                    color:that.colors[idx],
                    marker:{symbol:"circle"}
                }];
                rv = rv.concat(c);
            });
            return rv;
        },
        reload:function(){
            $(".compare-body").addClass('compare-body-loadding');
            var urlData = {
                ty:this.json.scoreFilter.ty,
                pici:this.json.scoreFilter.pici,
                pid:this.json.scoreFilter.pid,
                selIds:this.json.selIds,
                pipeId:this.id,
            };
            pipe.cancalLoadModel();
            this.xhr && this.xhr.abort();
            pipe.fireLock = false;
            this.xhr = pipe.loadModel("/school/v2/getSchCompareBody.do",urlData,'post');
        },
        initScore:function(){
            var series = this.getScoreSeries();
            var allLen = 0,title = {};
            for(var i=0,len=series.length;i<len;i++){
                allLen += series[i].data.length;
            }
            if(allLen == 0 && this.json.selIds.length > 0){
                title = {
                    text: "<div style='padding: 10px 20px;background: #ccc;color: #666;margin: -40px 0 0 40px;border-radius: 3px;'>对比学校在本批次都不招生</div>",
                    floating:true,
                    verticalAlign:'middle',
                    useHTML:true
                }
            }else{
                title = {
                    text: "",
                    floating:true
                }
            }
            this.jq(".compare-row.admit").find('.chart').highcharts({
                chart: {
                    type: 'line',
                    width:850,
                    height:310,
                    backgroundColor:"#fff",
                },
                title: title,
                xAxis: {
                    lineWidth:0,
                    tickWidth:0,
                    showLastLabel:true,
                    gridLineWidth:1,
                    minTickInterval:1,
                    labels: {
                        formatter:function(){
                            if(this.value){return this.value} else { return ""}
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    gridLineWidth:1,
                    labels: {
                        formatter:function(){
                            if(this.value){return this.value} else { return ""}
                        }
                    }
                },
                legend:{enabled:false},
                /*legend:{
                    enabled:true,
                    itemDistance:50,
                    symbolRadius:0,
                    width:850,
                    borderWidth:0
                },*/
                tooltip: {
                    shared: true,
                    useHTML:true,
                    headerFormat:"{point.key}年 <br /><table>",
                    pointFormat:"<tr><td style='color:{series.color};text-align: right;'>{series.name}:</td><td style='text-align: right;'>{point.y}</td></tr>",
                    footFormat:"</table>",
                    valueSuffix: ' 分',
                    backgroundColor : '#fff',
                    borderWidth:1,
                    borderRadius:0,
                    style:{
                        color:"#666"
                    }
                },
                credits:{enabled:false},
                plotOptions: {},
                series: series
            });
        },
        gender:function(){
            var allEl = this.jq(".compare-row.gender .chart");
            var that = this;
            allEl.each(function(i){
                that._gender($(this),that.json.dataList[i].gender)
            });
        },
        _gender:function(el,data){
            el.highcharts({
                    chart: {
                        type: 'pie',
                        width : 99,
                        height : 99
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
                            {name:"男",y: data._m,color:"#4499ff"},
                            {name:"女",y: data._f,color:"#cee4ff"}
                        ]
                    }]
                });
        },
        saveItem:function(){
            var data = this.json.compareData;
            var k = Object.keys(data);
            var val = []
            for(var i=0,len=k.length;i<len;i++){
                val.push(data[k[i]]);
            }
            Req.q('/school/compareData.do',{k:k,v:val},function(){});
        },
        removeItem:function(id){
            try{
                var keys = Object.keys(this.json.compareData);
                var schId = id.substr(0,24);
                for(var i=0,len=keys.length;i<len;i++){
                    if(schId == keys[i].substr(0,24)){
                        id = keys[i];
                    }
                }
                delete this.json.compareData[id];
                this.saveItem();
                if( this.json.selIds.indexOf(id) != -1 ) {
                    this.removeShowItem(id);
                }
                return true;
            } catch(e){
                return false
            }
        },
        addItem:function(id,value){
            var data = this.json.compareData;
            var k = Object.keys(data);
            var schId = id.substr(0,24);
            for(var i=0,len=k.length;i<len;i++){
                if(schId == k[i].substr(0,24)){
                    id = k[i];
                    pin.ui.MsgBox.alert("",value+"已经存在了");
                    return false;
                }
            }
            if(k.length > 11){
                return false;
            }
            data[id] = value;
            this.saveItem();
            return true;
        },
        colors:['#4499ff','#ffbf00','#86c400','#945d1e'],
        getErrorData:function(data,color){
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
                    enableMouseTracking:false,
                    lineWidth: 3,
                    marker:{
                        symbol:'circle',
                        fillColor: '#fff',
                        lineWidth: 2,
                        lineColor: color,
                        states:{
                            hover:{
                                lineColor:"#ffffff",
                                fillColor:color,
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
        getSalarySeries:function(){
            var rv = [];
            var that = this;
            this.json.dataList.forEach(function(d,idx){
                var salary = d.salary;
                var data = [];
                var sch_name = d.sch_name;
                if(sch_name.length > 8){
                    sch_name = sch_name.substr(0,6)+"..."
                }
                var k = "graduate_year";
                salary.length && salary[0].after_graduation_year!=undefined && (k = "after_graduation_year")
                salary = salary.sort(function(a,b){ return a[k]-b[k]});

                for(var i=0,len=salary.length;i<len;i++){
                    data.push({
                        x:salary[i].graduate_year || salary[i].after_graduation_year,
                        y:parseInt(salary[i].salary),
                        virtual_flag:salary[i].virtual_flag
                    });
                }
                var c = [{
                    type:'line',
                    data: data,
                    name:sch_name,
                    zIndex:10,
                    color:that.colors[idx],
                    marker:{symbol:"circle"}
                }].concat(that.getErrorData(data,that.colors[idx]));
                rv = rv.concat(c);
            });
            return rv;
        },
        salary:function(){
            var series = this.getSalarySeries();
            var title = {};
            if( series.length>this.json.selIds.length ){
                title = {
                    text: "<div style='background:#fff; padding: 5px; margin: -5px 0px 0px -5px;'>虚线表示对应年份样本不足</div>",
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
            } else{
                title = {
                    text: "",
                    floating:true
                }
            }
            this.jq(".compare-row.salary").find('.chart').highcharts({
                chart: {
                    type: 'line',
                    width:850,
                    height:310,
                    backgroundColor:"#fff",
                },
                title: title,
                xAxis: {
                    labels: {
                        formatter: function() {
                            if(this.value == 0){
                                return '应届生';
                            } else{
                                return "已毕业"+this.value+"年"; 
                            }
                        }
                    },
                    lineWidth:0,
                    tickWidth:0,
                    showLastLabel:true,
                    gridLineWidth:1
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    gridLineWidth:1,
                    labels: {
                        formatter:function(){
                            if(this.value){return this.value} else { return ""}
                        }
                    }
                },
                legend:{enabled:false},
                /*legend:{
                    enabled:true,
                    itemDistance:50,
                    symbolRadius:0,
                    width:850,
                    borderWidth:0
                },*/
                tooltip: {
                    shared: true,
                    useHTML:true,
                    headerFormat:"毕业{point.key}年 <br /><table>",
                    pointFormat:"<tr><td style='color:{series.color};text-align: right;'>{series.name}:</td><td style='text-align: right;'>{point.y}</td></tr>",
                    footFormat:"</table>",
                    valueSuffix: ' 元',
                    backgroundColor : '#fff',
                    borderWidth:1,
                    borderRadius:0,
                    style:{
                        color:"#666"
                    }
                },
                credits:{enabled:false},
                plotOptions: {},
                series: series
            });
        }
    }));

},"pipe/schoolV2/compareBody.js");