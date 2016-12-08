define(['ux',"mod/verNav.js"],function(){

    var getCfg = pin.getCfg;
    var MsgBox = pin.ui.MsgBox;
    var mode ={
        init:function(){
            //this.fixedBar();
            this.nextPage();
            this.select();
            this.des();
            pin.use('CompareArea',{
                modeCfg:{
                    type:'school',
                    name:'学校',
                    keys:"compare_id",
                    search:{
                        "searchType":'sch',
                        "form":'sch',
                        "idKey":'sch_id+\'__7\'',
                        "nameKey":'sch_name',
						"hasStat":true
                    }
                }
            }).getView();

            $('a.add-compare').click(function(){
                var compareArea =  pin.use('CompareArea');
                compareArea.display(1);
                compareArea.addOne(getCfg('sch_id')+"__"+getCfg('diploma'),getCfg('sch_name'));
                return false;
            });
            this.tips();
        },
        nextPage: function (){//nextPageschMjorNav
            try{
                var $nav = $('.sch-nav');
                var $list= $nav.find('li');
                var $curr = $nav.find('.selected');
                var idx = $list.index($curr);
                var $next = $('.sch-next');
                if (idx >= $list.length -1) {
                    return $next.hide();
                }
                var $nextLink = $list.eq(idx + 1).find('a');
                var nextUrl = $nextLink.attr('href');
                var nextTxt = $nextLink.text();
                $next.attr('href', nextUrl).html('进入下一项: ' + nextTxt + '<i class="icon"></i>');
            }catch(err){}
        },
        select:function(){
            $(".fixed-bar .major").each(function(){
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    cssNode:$('<div></div>')
                }).getView();
            });
            pin.use("select",{
                view:$("#gr")[0],
                hidden:true,
                autoColumn:true,
                cssNode:$('<div></div>'),
                onchange:function(v,el){
                    var elDom = this.jq().next();
                    elDom.find('.m').html($(el).attr('m'));
                    elDom.find('.f').html($(el).attr('f'));
                }
            }).getView();
        },
        fixedBar:function(){
            var fn = function(){
                var st = $(window).scrollTop();
                var el = $(".title.page-mod");
                if(st > el.offset().top + el.height()){
                    $(".fixed-mask").show()
                } else {
                    $(".fixed-mask").hide()
                }
            }
            fn();
            $(window).scroll(fn);
        },
        des:function(){
            var desAll = $(".title .des");
            var packUp = $('div.packUp')
            desAll.find(".more").click(function(){
                desAll.eq(0).cssDisplay(0);
                desAll.eq(1).cssDisplay(1);
                packUp.cssDisplay(1);
                return false;
            });
            packUp.click(function(){
                desAll.eq(1).cssDisplay(0);
                desAll.eq(0).cssDisplay(1);
                packUp.cssDisplay(0);
                return false;
            });
        },
        tips:function(){
            var d = MsgBox.getSysTips();
            d.jq().addClass('school-tips');
            d.display(0);
            $('.assess .f4 i.icon').hover(function(){
                var msg = mapStr[$(this).attr('i')];
                msg = msg.replace('{{v}}',$(this).attr('v'))
                d.display(0);
                d = MsgBox.tips(msg,500,this,function(){},true,"top","bc");
                d.clearHideTimer();
            },function(){
                d.setHideTimer();
            });
        }
    };

    var mapStr = {
        "1":"指该校毕业生毕业五年后的平均收入在全国大学生毕业生中的相对水平。（本校的毕业五年薪酬排全国前{{v}}%）",
        "2":"计算毕业生在社会上的影响力，以及媒体对学校的报道。（本校的知名度排全国前{{v}}%）",
        "3":"采用通用的城市等级划分体系，将中国的城市划分为四个等级，城市等级越高，毕业后就业的机会将相应增加。（本校地处中国{{v}}线城市）"
    }

    mode.init();

    pin.on("pageEnd",function(){
        
        /*pin.use("verNav",{
            getPageMod:function(){
                return $(".title.page-mod").add("body>.page-mod");
            }
        }).init();*/

        if(pin.getCfg("deduct")){
            pin.fire("inc_minus",{num:1});
        }
        
    });

    window.getShare = function(cmd,config){};
    var bdText = getCfg('text');
    if(getCfg('isSchoolRank')){
        bdText += $.trim($("#rankingType .tag-hover").text())+"排名，"+$.trim($(".tabDiv tbody td:eq(0) a").text())+"专业第一，你觉得呢？";
    }
    pin.ux.share({
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

},'pipe/school/school/main.js')
