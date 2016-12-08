define(['pin','request','ui/ux',"ui/tpl","common/verNav"],function(pin,request,ux,TPL,verNav){

    var Req = pin.request;
    var getCfg = pin.getCfg;

    verNav.init();
    var mode ={
        init:function(){
            var self = this;
            this.des();
            this.initFixed();
            pin.use('CompareArea',{
                modeCfg:{
                    type:'school',
                    name:'学校',
                    keys:"compare_id",
                    search:{
                        "searchType":'sch',
                        "form":'sch',
                        "idKey":'sch_id+\'__\'+(pin.util.arrayIndexOf(data.sch[i].sch_grade,"本科")==-1?5:7)',
                        "nameKey":'sch_name',
                        "hasStat":true
                    }
                }
            }).getView();

            $('a.add-compare,a#add-compare').click(function(){
                var compareArea =  pin.use('CompareArea');
                compareArea.display(1);
                compareArea.addOne(getCfg('sch_id')+"__"+getCfg('diploma'),getCfg('sch_name'));
                return false;
            });

            $('.younosee').length && $('.younosee').css('height',$('.ex-panel').height())

            $('.excellent').on('click', '.see-another', function(event) {
                var data = getCfg('excellent')
                if (self.pos >= data.length-2) {
                    self.pos = 0;
                } else {
                    self.pos += 2;
                }
                self.replaceResult(data.slice(self.pos,self.pos+2));
            });

        },
        pos:0,

        des:function(){
            var desBnt = $(".sch-bd .sch-des .des-bnt");
            var desEl = $(".sch-bd .sch-des .des");
            var hide = true;
            desEl.css({"overflow":"auto","height":"auto"});
            var maxHeight = desEl.height();
            desEl.css({"overflow":"hidden","height":192});
            desBnt.click(function(){
                if(hide){
                    desEl.height(maxHeight)
                    $(this).html("收起描述");
                } else {
                    desEl.height(192);
                    $(this).html("显示更多");
                }
                hide = ! hide;
                return false;
            });
        },
        initFixed:function(){
            var navSt = $(".sch-nav").offset().top;
            var crumbsSt = $(".crumbs").offset().top;
            var fn = function(){
                var st = $(window).scrollTop();
                $(".sch-nav").checkClass("sch-nav-fixed",st > navSt);
                $(".crumbs").checkClass("crumbs-fixed",st > crumbsSt);
                var cw = document.documentElement.clientWidth || document.body.clientWidth;
                if(st > navSt){
                    if(cw < 1000){
                        $(".sch-nav").css({"left":0,"marginLeft":0});
                    } else {
                        $(".sch-nav").css({"left":"50%","marginLeft":-500});
                    }
                } else {
                    $(".sch-nav").css({"left":"","marginLeft":""});
                }
            }
            fn();
            $(window).scroll(fn);
        },

        replaceResult:function(data){
            var self = this;
            var tpl = self.excellentTpl;
            var html = TPL.ejs(tpl,data);
            $('.excellent .mod-content').html(html);
        },

        excellentTpl:[
            '   <% if(data.length){',
            '        var schoolExcellent = data%>',
            '    <div class="ex-panel left">',
            '        <h3>',
            '            <%=schoolExcellent[0].mate_name%>,<%=schoolExcellent[0].gender%>',
            '        </h3>',
            '        <ul>',
            '            <li>',
            '                <h4 class="year"><%=schoolExcellent[0].grad_date%><span class="circle"></span></h4>',
            '                <p class="post">毕业于',
            '                <%=schoolExcellent[0].grad_sch%>',
            '                <%=schoolExcellent[0].grad_major ? (schoolExcellent[0].grad_major + "专业") : ""%></p>',
            '            </li>',
            '            <%  var job_item = schoolExcellent[0].job_item;',
            '                for(var i =(job_item.length>3 ?job_item.length-3 : 0);i<job_item.length;i++){%>',
            '               <li>',
            '                    <h4 class="year"><%=job_item[i].start_time%>~<%=job_item[i].end_time%><span class="circle"></h4>',
            '                    <p class="post"><%=job_item[i].position%><span class="salary"><%=job_item[i].job_sal%></span></p>',
            '                    <p class="company">某<%=job_item[i].inc_industry%>公司(<%=job_item[i].inc_scale%>)</p>',
            '                </li>',
            '            <%}%>',
            '        </ul>',
            '    </div>',
            '    <% if(data.length>1){%>',
            '    <div class="ex-panel right">',
            '        <h3>',
            '            <%=schoolExcellent[1].mate_name%>,<%=schoolExcellent[1].gender%>',
            '        </h3>',
            '        <ul>',
            '            <li>',
            '                <h4 class="year"><%=schoolExcellent[1].grad_date%><span class="circle"></h4>',
            '                <p class="post">毕业于',
            '                <%=schoolExcellent[1].grad_sch%>',
            '                <%=schoolExcellent[1].grad_major ? (schoolExcellent[1].grad_major + "专业") : ""%>',
            '                </p>',
            '            </li>',
            '            <%  var job_item = schoolExcellent[1].job_item;',
            '                for(var i =(job_item.length>3 ?job_item.length-3 : 0);i<job_item.length;i++){%>',
            '               <li>',
            '                    <h4 class="year"><%=job_item[i].start_time%>~<%=job_item[i].end_time%><span class="circle"></h4>',
            '                    <p class="post"><%=job_item[i].position%><span class="salary"><%=job_item[i].job_sal%></span></p>',
            '                    <p class="company">某<%=job_item[i].inc_industry%>公司(<%=job_item[i].inc_scale%>)</p>',
            '                </li>',
            '            <%}%>',
            '        </ul>',
            '    </div>',
            '    <%}}%>'
        ].join('')
    };

    

    
    return{ 
        init:function(){
            mode.init();

            window.getShare = function(cmd,config){};
            var bdText = getCfg('text');
            if(getCfg('isSchoolRank')){
                bdText += $.trim($("#rankingType .tag-hover").text())+"排名，"+$.trim($(".tabDiv tbody td:eq(0) a").text())+"专业第一，你觉得呢？";
            }
            pin.util.share({
                "common":{
                    "bdSnsKey":{},
                },
                "share":[{
                    "tag":"top-share",
                    'bdUrl':getCfg('bdUrl')||location.href,
                    "bdText":bdText,
                    "bdPic":getCfg('bdPic')
                },{
                    "tag":"invite-share",
                    'onBeforeClick':function(cmd,config){ return window.getShare(cmd,config);}
                }]
            });
        }
    }
})
