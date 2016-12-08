define(["jquery","pin"],function($,pin){

    $.extend(pin.request,{
        score:function(score_form,data,fn){
            data = $.extend({},data);
            data.score_form = score_form;
            return this.postReq("/zhiyuan/score",data,fn)
        },
        zhineng_group:function(fn){
            return this.q("/zhiyuan/zhineng_group",{},fn);
        },
        jobcate_group:function(fn){
            return this.q("/zhiyuan/jobcate_group",{},fn);
        },
        rank_list:function(data_process_type,rank_list_id,fn){
            return this.q("/zhiyuan/rank_list",{data_process_type:data_process_type,rank_list_id:rank_list_id},fn);
        },
        detail_jobcate:function(top_job_cate,fn){
            return this.q("/zhiyuan/detail_jobcate",{top_job_cate:top_job_cate},fn);
        },

        sel_listColle:function(pici,difficult_list,fn){
            return this.q("/zhiyuan/list_collect",{pici:pici,difficult_list:difficult_list},fn,{async:false});  
        },
        recommend_detail:function(data,fn){
            return this.postReq("/zhiyuan/recommend_detail",data,fn);
        },
        sch_list:function(filter,fn){
            return this.postReq("/zhiyuan/sch_list",{filter:filter},fn);
        },
        major_list_cate:function(fn) {
            return this.q("/zhiyuan/major_list_cate",{},fn);
        },
        major_group:function(fn){
            return this.q("/zhiyuan/major_group",{},fn);
        },
        detail_majorcate:function(major_cate,fn) {
            return this.q("/zhiyuan/detail_majorcate",{major_cate:major_cate},fn);
        },
        save_zhiyuan:function(data,fn){
            return this.postReq("/zhiyuan/save_zhiyuan",data,fn);
        },
        create_bespoke:function(data,fn){
            return this.postReq("/zhiyuan/create_bespoke",data,fn);
        },
        zybSave:function(data,fn){
            return this.postReq("/zhiyuan/zybSave",data,fn);
        },
        zybDel:function(data,fn){
            return this.postReq("/zhiyuan/zybDel",data,fn);
        },
        getMajorsByZhineng:function(data, fn){
            return this.postReq("/zhiyuan/major_from_zhineng",data,fn);
        },

        //collect
        addColle:function(sch_id,major_id,diploma,fn){
            return this.q("/account/addColle",{sch_id:sch_id,major_id:major_id,diploma:diploma},fn);
        },
        removeColle:function(sch_id,major_id,diploma,fn){
            return this.q("/account/removeColle",{sch_id:sch_id,major_id:major_id,diploma:diploma},fn);
        },
        sch_colle:function(sch_id,diploma,pici,fn){
            return this.q("/account/schColle",{sch_id:sch_id,diploma:diploma,pici:pici},fn);
        },
        list_sch_major:function(sch_id,diploma,fn){
            return this.q("/account/listSchMajor",{sch_id:sch_id,diploma:diploma},fn);
        },
        listColle:function(fn){
            return this.q("/account/listColle",{},fn,{async:false});
        },
        removeColleExam:function(exam_id,fn){
            return this.q("/account/removeColleExam",{exam_id:exam_id},fn);
        },
        colleExam:function(exam_id,fn){
            return this.q("/account/colleExam",{exam_id:exam_id},fn);
        },

        //reg login
        checkImageIdentifyCode:function(data,fn){
            return this.postReq("/account/checkImageIdentifyCode",data,fn);
        },
        getRegVerifyCode:function(data,fn){
            return this.postReq("/account/getRegVerifyCode",data,fn);
        },
        checkRegVerifyCode:function(data,fn){
            return this.postReq("/account/checkRegVerifyCode",data,fn);
        },

        ajaxLogin:function(data, fn){
            return this.postReq("/account/ajaxLogin",data,fn);
        },

        //payment
        bind_card:function(data, fn){
            return this.postReq("/buy/bind_card",data,fn);
        },
        getGoods:function(data,fn){
            return this.postReq("/buy/getGoods",data,fn);
        }, 
        getRebateCost:function(data,fn){
            return this.postReq("/buy/getRebateCost",data,fn);
        },
        queryWXPayStatus:function(data,fn){
            return this.postReq("/buy/queryWXPayStatus",data,fn);
        },
        getWxPayLink:function(data,fn){
            return this.postReq("/buy/getWxPayLink",data,fn);
        },
        getUpgradeWxPayLink:function(data,fn){
            return this.postReq("/buy/getUpgradeWxPayLink",data,fn);
        }
        /*getAlipayLink:function(data,fn){
            return this.postReq("/buy/getAlipayLink",data,fn);
        },*/

    });

    
    //wmzy_api
    $.extend(pin.request,{
        getSchEnrollment:function(data,fn){
            return this.q("/api/getSchEnrollment",data,fn);
        },
        recruitForcast:function(data,fn){//录取概率预测 
            return this.q("/api/getForecast",data,fn);
        },
        getZhaoshengSch:function(data,fn){
            return this.q("/api/school/zhaosheng",data,fn);
        },
        searchMoreResult: function(data,fn){
            return this.q("/api/search/searchMore.do",data,fn);
        },
        autoSearch:function(data,fn){//学校库、专业库等数据搜索
            return this.q("/api/search/autoSearch.do",data,fn);
        },
        getExcellent:function(data,fn){//获取优秀校友
            return this.q("/api/school/excellent",data,fn);
        },
        getSchAllMajorScore:function(data,fn){
            return this.q("/api/school-score/getSchAllMajorScore",data,fn)
        },
        getSchList:function(data,fn){//eg
            return this.q("/api/school/getSchList",data,fn)
        },
        getMajorList:function(data,fn){
            return this.q("/api/major/getMajorList",data,fn)
        },
        getAllMajorInfo:function(data,fn){
            return this.q("/api/school/getAllMajorInfo",data,fn);
        },
        getSchRankList:function(data,fn){
            return this.q("/api/rank/school",data,fn)
        },
        getMajorRankList:function(data,fn){
            return this.q("/api/rank/major",data,fn)
        },
        getScoreList:function(data,fn){
            return this.q("/api/score/getScoreList",data,fn)
        },
        getExamList:function(data,fn){
            return this.q("/exam/getExamList",data,fn);
        }
    });
    
    return pin.request;

});
