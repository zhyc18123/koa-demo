define(['ux',"mod/verNav.js"],function(){

    var MsgBox = pin.ui.MsgBox;
    
    var json = {};
    var mode ={
        init:function(){
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
                major_id = getCfg('major_id')
                if(major_id == '000000000000000000000000'){
                    major_id = getCfg('major_name')
                }
                compareArea.addOne(getCfg('sch_id')+"_"+major_id+"_"+getCfg('diploma'),getCfg('sch_name'));
                return false;
            });
        },
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
            }
            fn();
            $(window).scroll(fn);
        }
    };

    var mapStr = {
        "1":"指该专业毕业生毕业五年后的平均收入在全国大学生毕业生中的相对水平。（本校该专业的毕业五年薪酬排全国前{{v}}%）",
        "2":"指毕业生在工作单位的平均跳槽时长。需注意的是，稳定性低也许是该行业对人才的需求强，导致流动性高。（本校该专业的工作稳定性排全国前{{v}}%）",
        "3":"指毕业生就业工作的可选择面的多少，就业面广代表毕业生从事很多不同的岗位，就业面集中代表毕业生从事的职位较集中。（本校该专业的职位就业面排全国前{{v}}%）",
        "4":"指毕业生就业行业的可选择面的多少，就业面广代表毕业生分布在很多行业，就业面集中代表毕业生集中在某几个行业。（本校该专业的行业就业面排全国前{{v}}%）"
    }

    pin.on("pageEnd",function(){

        /*pin.use("verNav",{
            getPageMod:function(){
                return $(".title.page-mod,.assess.page-mod").add("body>.page-mod");
            }
        }).init();*/
        
        var tpl = pipe.getModFromTpl("info")
        if(!tpl){
            tpl = pipe.getModFromTpl("categoryInfo")
        }
        json = tpl.json;

        if(pin.getCfg("deduct")){
            pin.fire("inc_minus",{num:1});
        }
        mode.init();
    });
    
    var getCfg = pin.getCfg;
    window.getShare = function(cmd,config){};
    pin.ux.share({
        "common":{
            "bdSnsKey":{},
        },
        "share":[{
            "tag":"top-share",
            'bdUrl':getCfg('bdUrl')||location.href,
            "bdText":getCfg('text'),
            "bdPic":getCfg('bdPic')
        },{
            "tag":"invite-share",
            'onBeforeClick':function(cmd,config){ return window.getShare(cmd,config);}
        }]
    });

        
})
