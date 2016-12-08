define(
    ["jquery","pin","request","common/defaultView","widget/score",'page/head',"widget/page","common/common"]
    ,function($,pin,Req,defaultView,scoreUi,headjs) {

    var Util = pin.util;
    var PageData = $.extend({},window.PageData);

    var ept = Util.create(defaultView,{
        id:'pipe_1',
        json:PageData.listData,
        

        mvc:function(){
            var that = this;
            var json = this.json;
            return {
                marjorList:json.sameScoreData&&json.sameScoreData.majors.slice(0,20),
                enrollCount:json.sameScoreData&&json.sameScoreData.enroll_total_count,
                similarRank:json.sameScoreData&&json.sameScoreData.majors.length>0&&json.sameScoreData.majors[0].score_rank,
                rank:json.myscore.scoreRank,
                diplomaId:json.diplomaId,
                yearList:json.yearList,
                nowYear:json.nowYear,
                maxPage:Math.ceil(json.sameScoreData.major_total_count/20),
                $pageCfg:{
                    page:1,
                    maxPage:Math.ceil(json.sameScoreData.major_total_count/20)
                },
                page:function(p){
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    that.reload(vm.nowYear,p);
                },
                getScoreYear:function(year,e){
                    pin.cancelAll(e);
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.nowYear!=year){
                        location.href = "/tongfen?year="+year;
                    }
                }
            }
        },
        onViewReady:function(){
            var that = this;
            /*this.isLogin = pin.getCfg("isLogin");
            !this.isLogin && this.notLogin();

            this.isVIP = pin.getCfg("isVip");
            this.isLogin && !this.isVIP && this.notVip();
*/

            pin.util.share({
               "share":[{
                   'bdUrl':location.href,
                   "bdText":"完美志愿 同分考生去向"
               }]
            });
            $('#changeScore').click(function(){
                var vm = scoreUi(that.json.myscore,function(){
                    location.reload(1);
                });
                vm.display = true;
                return false;
            });

            $("body").removeAttr('ms-controller');
        },
        reload:function(year,p){
            var that = this;
            Req.q("/analyze/analyze_report_data",{year:year},function(r){
                var vm = that.getVm();
                var json = r.getData();
                vm.yearList=json.yearList;
                vm.nowYear=json.nowYear;
                vm.diplomaId=json.diplomaId;
                vm.marjorList.clear();
                if (p) {
                    vm.marjorList.pushArray( json.sameScoreData.majors.slice(20*(p-1),20*p) );
                }else {
                    vm.marjorList.pushArray( json.sameScoreData.majors.slice(0,20) );
                }
                vm.maxPage=Math.ceil(json.sameScoreData.major_total_count/20);
                vm.enrollCount=json.sameScoreData.enroll_total_count;
                vm.similarRank=json.sameScoreData.majors[0].score_rank;
                vm.rank=json.myscore.scoreRank;
            });
        },
        notVip:function(){
            $("#content").hide();
            pin.ui.MsgBox.alert("","这是VIP专属功能，请开通VIP后使用",function(){
                window.location.href="/buy/product";
            })
        },
        notLogin:function(){
            pin.ui.MsgBox.alert("","这是VIP专属功能，请开通VIP后使用。若您已是VIP，<a style='color:#4499dd;cursor:pointer;' onclick='javascript:ipinAuth&&ipinAuth.loginBox(location.href);'>请登录</a>。",function(){
                ipinAuth&&ipinAuth.loginBox(location.href);
            })
        },
    });



    return {
        init:function(){
            headjs.init();
            new ept();
        }
    }

});
