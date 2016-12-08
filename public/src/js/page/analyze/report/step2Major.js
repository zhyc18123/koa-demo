define(['jquery','pin','request',"common/defaultView","widget/page"],function($,pin,Req,defaultView,PageUI) {
    
    var Util = pin.util;
    var Req = pin.request;
    var PageData = $.extend({},window.PageData);

    pin.reg("analyze/report/step2Major",Util.create(defaultView,{
        id:'pipe_3',
        json:PageData.analyzeStep2MajorData,
        mvc:function(){
            var that = this;
            var json = this.json;
            this.isLogin = pin.getCfg("isLogin");
            this.isVIP = pin.getCfg("isVip");
            if(!this.isLogin||!this.isVIP){
                //!this.isLogin && this.notLogin();
                //this.isLogin && !this.isVIP && this.notVip();
               return; 
            }
            
            return {
				diplomaId:json.diplomaId,
                gender:json.gender,
                major_cate_list:json.majorData.major_cate_list,
                $allNum:that.getOneCount(json.majorData.major_cate_list),
                major_cate:json.major_cate,
                major_list:json.majorData.major_second_cate_list.slice(0,6),
                maxPage:Math.ceil(json.majorData.total_major_second_cate_count/6),
                curPage:1,
                $pageCfg:{
                    page:1,
                    maxPage:Math.ceil(json.majorData.total_major_second_cate_count/6)
                },
                page:function(p){
                    if(!pin.chkLogin())return false;
                    var json = that.json;
                    var vm = that.getVm();
                    vm.major_list.clear();
                    vm.major_list.pushArray( json.majorData.major_second_cate_list.slice(6*(p-1),6*p) );
                },
                clickCate:function(major_cate,e){
                    pin.cancelAll(e);
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.major_cate!=major_cate){
                        that.reload(vm.gender,major_cate);
                    }
                },
                clickGender:function(gender,e){
                    pin.cancelAll(e);
                    if(!pin.chkLogin())return false;
                    var vm = that.getVm();
                    if(vm.gender!=gender){
                        that.reload(gender,vm.major_cate);
                    }
                }
            }
        },
        getOneCount:function (arr) {
            return arr.length ? arr[0].count:0
        },
        reload:function(gender,majorCate){
            var that = this;
            Req.q("/analyze/analyze_step2_majorData",{gender:gender,majorCate:majorCate},function(r){
                var vm = that.getVm();
                var json = r.getData();
                that.json = json;

                vm.gender=json.gender;
                vm.$allNum=that.getOneCount(json.majorData.major_cate_list);
                vm.major_cate_list.clear();
                vm.major_cate_list.pushArray(json.majorData.major_cate_list);
                vm.major_cate=json.major_cate;
                vm.major_list.clear();
                vm.major_list.pushArray(json.majorData.major_second_cate_list.slice(0,6) );
                vm.maxPage = 1;
                vm.maxPage=Math.ceil(json.majorData.total_major_second_cate_count/6);
                

                //vm.curPage = 1; //todo: add curPage PARAM TO PAGE WIDGET
                
            });
        }
    }));

    
    return {
        init:function(){
            pin.use("analyze/report/step2Major");
        }
    }

});
