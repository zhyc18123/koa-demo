define(['jquery','pin','request',"common/defaultView","widget/score","highcharts"],function($,pin,Req,defaultView,scoreUi) {
    
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);

    pin.reg("analyze/report/step1",Util.create(defaultView,{
        id:'pipe_1',
        json:PageData.analyzeStep1Data,
        mvc:function(){
            var that = this;
            var json = this.json;
            return {
                yearList:json.yearList,
                nowYear:json.nowYear,
                scoreText:json.scoreText,
                real_score:json.scoreData.real_score,
                score_rank:json.scoreData.score_rank,
                score_rank_ratio:json.scoreData.score_rank_ratio,
                getScoreYear:function(year,e){
                    pin.cancelAll(e); 
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.nowYear!=year){
                        that.reload(year);
                    }
                }
            }
        },
        onViewReady:function(){
            var that = this;
            $('#changeScore').click(function(){
                var vm = scoreUi(that.json.myscore,function(){
                    location.reload(1);
                });
                vm.display = true;
                return false;
            });


            this.isLogin = pin.getCfg("isLogin");
            this.isVIP = pin.getCfg("isVip");


            if(!this.isLogin||!this.isVIP){
                //!this.isLogin && this.notLogin();
                //this.isLogin && !this.isVIP && this.notVip();
               return; 
            }

           
            if(!this.json.hasSetScore){//必须录入成绩，否则可能有奇怪现象发生
                scoreUi(that.json.myscore,function(){
                    location.reload(1);
                },true).display = true;
            }
            
            that.initChart(that.json)
            pin.util.share({
               "share":[{
                   'bdUrl':location.href,
                   "bdText":"完美志愿 成绩分析报告"
               }]
            });
        },
        initChart:function(json){
            var t = [];
            json.scoreData.score_stat_list.forEach(function(item){
                t.push({"x":item.score_start,"score_end":item.score_end,"y":item.count});
            });
            this.jq(".pic").html('');
            if(!t.length){
                this.jq(".pic").html('<div class="null-text">暂无'+json.nowYear+'年'+$("#origin").val()+'的'+$("#subject").val()+'录取数据</div>')
                return false;
            }
            var lines =  json.batch_score_map;
            var youScore = json.scoreData.real_score,youIdx;
            var minX,maxX;

            var min=0,max=t.length-1,f=false,data=[];
            for(var i=0;i<=max;i++){
                if(t[i].y!=0){min=i; break;}
            }
            for(var i=max;i>=0;i--){
                if(t[i].y!=0){max=i; break;}
            }
            data = t.slice(min,max);
            minX=data[0].x;
            maxX=data[data.length-1].x;

            data.forEach(function(p,i) {
                if(p.x <= youScore && youScore <= p.score_end){
                    youIdx = i;
                    p.color="#2453b2";
                    return false;
                }
            });

            this.jq(".pic").highcharts({
                chart: {
                    type: 'column',
                    events: {
                        load: function(){
                            var ren = this.renderer;
                            var points = this.series[0].points;
                            var zIndex = this.tooltip.label.zIndex;

                            ren.label('成绩', 555, 320)
                                .css({fontSize: '12px',color:"#999"})
                                .add();
                            ren.label('人数', 15, 5)
                                .css({fontSize: '12px',color:"#999"})
                                .add();
                            lines.forEach(function(item) {
                                points.forEach(function(p,i){
                                    if(p.x <= item.score && item.score <= p.score_end){
                                        item.pIdx = i;
                                        return false;
                                    }
                                });
                                return false;
                            });
                            //line
                            lines.forEach(function(item) {
                                var p = points[item.pIdx];
                                if(!p)return;
                                var graphic = p.graphic;
                                var group = p.series.group;
                                var x = graphic.x + group.translateX + graphic.width/2;
                                var lineStartY = 35;
                                ren.path(['M', x, lineStartY,"L",x,graphic.y + 10 ])
                                    .attr({
                                        'stroke-width': 1,
                                        stroke: '#6699ff',
                                        dashstyle: 'dash'
                                    })
                                    .add();

                                ren.label(item.text,x-6,lineStartY-30)
                                     .css({fontSize: '12px',color:"#333"})
                                    .add();

                                ren.label(item.score + "分",x-6,lineStartY-45)
                                     .css({fontSize: '12px',color:"#999"})
                                    .add();

                                ren.circle(x,lineStartY-3,3)
                                    .attr({
                                        fill: '#6699ff'
                                    })
                                    .add();
                            });
                            if(!youIdx)return;
                            var txtIndex = zIndex || 8;
                            var pGraphic = points[youIdx].graphic;
                            ren.rect(pGraphic.x - 30,pGraphic.y-60,90,60,0)
                                .attr({
                                    'stroke-width': 1,
                                    stroke: '#e2e2e4',
                                    fill: 'rgba(224,235,255,.9)',
                                    zIndex: txtIndex-1
                                })
                                .add();
                            ren.label("对应分数",pGraphic.x - 28,pGraphic.y - 55)
                                     .css({fontSize: '18px',color:"#000"})
                                     .attr({zIndex: txtIndex-1})
                                     .add();
                            ren.label(json.scoreText,pGraphic.x - 5,pGraphic.y - 30)
                                     .css({fontSize: '12px',color:"#4981f2"})
                                     .attr({zIndex: txtIndex-1})
                                     .add();
                        }
                    }
                },
                title: {
                    text: "",
                    floating:true
                },
                xAxis: {
                    title: {text: null},
                    gridLineWidth:0,
                    tickLength:0,
                    tickWidth:0,
                    tickPositions:[minX,maxX],
                    showLastLabel:true,
                    labels: {enabled:true}
                },
                yAxis: {
                    lineWidth:1,
                    title: {text: null},
                    gridLineWidth:0,
                    labels:{enabled:false}
                },
                tooltip: {
                    enabled:true,
                    formatter:function() {
                        return this.x+"~"+this.point.score_end+"<br/>"+this.y+"人"
                    }
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
                        selected:false,
                        color:'#e1e1e3',
                        dataLabels:{
                            enabled:false
                        },
                        states:{
                            hover:{
                                enabled:true,
                                color: "#69f"
                            }
                        }
                    }
                },
                series: [{
                    data: data
                }]
            });
        },
        notVip:function(){
            $("#content").hide();
            pin.ui.MsgBox.alert("","这是VIP专属功能，请开通VIP后使用",function(){
                window.location.href="/buy/product";
            })
        },
        notLogin:function(){
            pin.ui.MsgBox.alert("","这是VIP专属功能，请开通VIP后使用。若您已是VIP，<a style='color:#4499dd;cursor:pointer;' onclick='javascript:$(\"#pin_bnt_ok\").trigger(\"click\");'>请登录</a>。",function(){
                ipinAuth&&ipinAuth.loginBox(location.href);
            })
        },
        reload:function(year){
            var that = this;
            Req.q("/analyze/analyze_step1_data",{year:year},function(r){
                var vm = that.getVm();
                var json = r.getData();
                vm.yearList=json.yearList;
                vm.nowYear=json.nowYear;
                vm.scoreText=json.scoreText;
                vm.real_score=json.scoreData.real_score;
                vm.score_rank=json.scoreData.score_rank;
                vm.score_rank_ratio=json.scoreData.score_rank_ratio;
                that.initChart(json);
            });
        }
    }));

    

    return {
        init:function(){
            pin.use("analyze/report/step1");
        }
    }

});