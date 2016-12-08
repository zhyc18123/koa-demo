define(["jquery","pin","avalon","common/pinData","widget/score","widget/page","common/defaultView"],function($,pin,avalon,pinData,scoreUi,Page,defaultView) {
    var PageData = $.extend({},window.PageData);
    var isLogin = pin.getCfg("isLogin");
    var isVip = isLogin&&pin.getCfg("isVip");
    var Util = pin.util;
    var Req = pin.request;
    var allGrid,loaddingEl ;
    ipinAuth.callback = function(method){
        if(method == 'close'){
            pin.fire("resetSelect");
        }
    }
    Req.filter = function(r){
        if(r.getCode() == 401){
            ipinAuth.regBox();
            return false
        }
    }
    $("#regBnt").click(function(){ipinAuth.regBox();return false;});
    $("#loginBnt").click(function(){ipinAuth.loginBox();return false;});
    $("#gotoUserCenter").click(function(){ return pin.chkLogin(); });
    $("#weiboBnt").click(function(){
        var url = "http://www.ipin.com/account/accessWeibo.do?callback="+encodeURIComponent("http://"+location.hostname+"/proxy.do?callback="+encodeURIComponent(location.href));
        $(this).attr("href",url);
    });
    $("#qqBnt").click(function(){
        var url = "http://www.ipin.com/account/accessQQ.do?callback="+encodeURIComponent("http://"+location.hostname+"/proxy.do?callback="+encodeURIComponent(location.href));
        $(this).attr("href",url);
    });




    pin.reg("zhiyuan/zhiyuan/listArea",Util.create(defaultView,{
        id:'pipe_1_1',
        name:"listArea",
        json:PageData.listAreaData,
        mvc:function(){
            var that = this;
            var json = this.json;
            var rootVm = this.getVmFormId('root');
            var _setSchItem = function(sch_list){
                sch_list = sch_list.slice(0,10);
                sch_list.forEach(function(sch){
                    sch.allMajorList = [];
                    sch.$showMajorList = false;
                    sch.majorMaxPage=0;
                    sch.majorListPageChange = function(p,sch){
                        var vm = that.getVm();
                        sch.majorFilter.page = p;
                        vm._loadMajor_list(sch);
                    };
                    sch.$score_list = sch.score_list||[];
                    var item = sch.score_list[sch.score_list.length-1]||{};
                    sch.$last_score = {
                        year:item.year,
                        low_score:item.low_score,
                        avg_score:item.avg_score,
                        avg_score_rank:item.avg_score_rank,
                        low_score_rank:item.low_score_rank
                    }
                    sch.$majXhr=null;
                    delete sch.score_list;
                    sch.majorFilter = {
                        page:1,
                        order_type:"salary",
                        order:"desc"
                    };
                });
                return sch_list;
            }
            var _setMajorItem = function(major_list){
                major_list = major_list.slice(0,10);
                major_list.forEach(function(major){
                    major.$dest_job_second_cate_list = major.dest_job_second_cate_list.slice(0,3);
                    delete major.dest_job_second_cate_list;
                    major.allSchList = major.top_sch_list;
                    delete major.top_sch_list;
                    major.showSchList = false;
                    major.schMaxPage=0;
                    major.$schXhr=null;
                    major.schListPageChange = function(p,major){
                        var vm = that.getVm();
                        major.schFilter.page = p;
                        vm._loadSch_list(major);
                    };
                    major.schFilter = {
                        page:1,
                        order_type:"salary",
                        order:"desc"
                    };
                });
                return major_list;
            }
            var _setSchMajorItem = function(sch_major_list){
                sch_major_list = sch_major_list.slice(0,10);
                sch_major_list.forEach(function(major){
                });
                return sch_major_list;
            }
            var _listMaxPage = function(json){
                var maxLen = 0;
                switch(json.schData.cur_show_type){
                    case 'sch':
                        maxLen = json.schData.total_sch_count;
                        break;
                    case 'major':
                        maxLen = json.schData.total_major_count;
                        break;
                    case 'schmajor':
                        maxLen = json.schData.total_sch_major_count;
                        break;
                }
                return Math.ceil( maxLen/10);
            }
            allGrid = $(".first-election-page  .grid");
            loaddingEl = allGrid.find(".loadding-mask");
            var piciArr = [];
            pin.getCfg('piciList').forEach(function(p){
                piciArr.push({value:p,text:pinData.PICINAME[p]})
            });
            var firstNotUse = true;
            return {
                sch_list:_setSchItem(json.schData.sch_list),
                major_list:_setMajorItem(json.schData.major_list),
                sch_major_list:_setSchMajorItem(json.schData.sch_major_list),
                showType:json.schData.cur_show_type,
                piciText:json.piciText,
                piciLineText:json.piciLineText,
                myprov:json.myprov,
                listMaxPage:_listMaxPage(json),
                use_year:(json.schData.use_year+"").substr(2),
                $mark:0,
                piciText:"",
                $listPageCfg:{
                    maxPage:_listMaxPage(json),
                    page:1,
                    $maxShowPage:10
                },
                resetListPage:function(p){//ui.page实现
                },
                listPageChange:function(p) {
                    var selVm = that.getVmFormId("pipe_1");
                    selVm.filter.page = p;
                    var vm = that.getVm();
                    vm.reloadList(true);
                },
                _loadding:function(){
                    allGrid.addClass('loading_stats');
                    allGrid.removeClass('login_stats');
                    var vm = that.getVm();
                    loaddingEl.find('.bar').stop(true);
                    vm.$mark = 0;
                    loaddingEl.find('.bar').css({width:0});
                    loaddingEl.find('.bar').animate({'width':"98%"},1000,function(){
                        vm._loadSucc('aninate');
                    });
                },
                _loadFn:$.noop,
                _loadSucc:function(type,fn){
                    var vm = that.getVm();
                    if(type == "xhr"){
                        vm._loadFn = fn;
                    }
                    vm.$mark++;
                    if(vm.$mark == 2){
                        vm.$mark = 0;
                        vm._loadFn();
                        vm._loadFn = $.noop;
                        allGrid.removeClass('loading_stats');
                    }
                },
                $loadListXhr:null,
                reloadList:function(fromPage){
                    if(that.json.isfirst && firstNotUse){
                        firstNotUse = false;
                    }/* else if( pin.chkLogin()== false ){
                        return false;
                    }*/
                    var selVm = that.getVmFormId("pipe_1");
                    var vm = that.getVm();
                    if(!fromPage){
                        selVm.filter.page = 1;
                        vm.resetListPage(1);
                        vm._loadding();
                    }
                    vm.$loadListXhr && vm.$loadListXhr.abort();
                    vm.$loadListXhr = Req.sch_list(JSON.stringify(selVm.filter.$model),function(r){
                        if(r&&r.isOk()){
                            var json = r.getData();
                            var succFn = function(){
                                vm.listMaxPage = _listMaxPage(json);
                                switch( json.schData.cur_show_type ){
                                    case "sch":
                                        vm.sch_list.clear();
                                        vm.sch_list.pushArray( _setSchItem(json.schData.sch_list) );
                                        break;
                                    case "major":
                                        vm.major_list.clear();
                                        vm.major_list.pushArray( _setMajorItem(json.schData.major_list) );
                                        break;
                                    case "schmajor":
                                        vm.sch_major_list.clear();
                                        vm.sch_major_list.pushArray( _setSchMajorItem(json.schData.sch_major_list) );
                                        break;
                                        //  TODO 此处应该有default处理，二进防止vm.showType为undefined
                                }
                                vm.showType = json.schData.cur_show_type;
                                that.fireCount(json);
                                vm.piciText = json.piciText;
                                vm.piciLineText = json.piciLineText;
                                window.fixBottom && fixBottom();
                                if(json.notLogin && json.showOne){
                                    //allGrid.addClass('lock_stats');
                                }
                            }
                            if(fromPage){
                                $("html,body").animate({"scrollTop":0},200,function(){
                                    succFn();
                                    succFn = $.noop;
                                });
                            } else {
                                vm._loadSucc('xhr',succFn);
                            }
                        }
                    })
                },
                $majListPageCfg:{
                    maxPage:0,
                    page:1,
                    $maxShowPage:7
                },
                $schListPageCfg:{
                    maxPage:0,
                    page:1,
                    $maxShowPage:7
                },
                _loadSch_list:function(major,setMaxPage){
                    var qData=avalon.mix({},major.schFilter.$model);
                    var selVm = that.getVmFormId("pipe_1");
                    var vm = that.getVm();
                    var filter = selVm.filter.$model;
                    qData.filter = JSON.stringify(filter);
                    qData.major_id = major.major_id;
                    qData.show_type="major_detail";
                    major.$schXhr = Req.recommend_detail(qData,function(r){
                        if(r.isOk()){
                            var d = r.getData();
                            if(setMaxPage){
                                var maxPage = Math.ceil(d.total_count/10);
                                vm.$schListPageCfg.maxPage = maxPage;
                                major.schMaxPage = Math.ceil(d.total_count/10);
                            }
                            major.allSchList.clear();
                            major.allSchList.pushArray(d.sch_list);
                            window.fixBottom && fixBottom();
                        }
                    });
                },
                shouAllSch:function(major,showStats,e){
                    pin.cancelDefault(e);
                    var vm = that.getVm();
                    if(showStats == major.showSchList){return false;}
                    if(showStats){
                        major.showSchList = true;
                        vm._loadSch_list(major,true);
                    } else {
                        major.$schXhr && major.$schXhr.abort();
                        major.$schXhr = null;
                        major.showSchList = false;
                    }
                },
                schListSort:function(major,type){
                    var vm = that.getVm();
                    if(major.schFilter.order_type == type){
                        major.schFilter.order = ( major.schFilter.order == "desc"?"asc":"desc" )
                    } else {
                        major.schFilter.order = "desc";
                    }
                    var setMaxPage = false;
                    if(major.showSchList == false){
                        major.showSchList = true;
                        setMaxPage = true;
                    }
                    major.schFilter.page = 1;
                    major.schFilter.order_type = type;
                    vm._loadSch_list(major,setMaxPage);
                },
                _loadMajor_list:function(sch,setMaxPage){
                    var qData=avalon.mix({},sch.majorFilter.$model);
                    var selVm = that.getVmFormId("pipe_1");
                    var vm = that.getVm();
                    var filter = selVm.filter.$model;
                    qData.filter = JSON.stringify(filter);
                    qData.sch_id = sch.sch_id;
                    qData.show_type="sch_detail";
                    sch.$majXhr = Req.recommend_detail(qData,function(r){
                        if(r.isOk()){
                            var d = r.getData();
                            if(setMaxPage){
                                var maxPage = Math.ceil(d.total_count/10);
                                vm.$majListPageCfg.maxPage = maxPage;
                                sch.majorMaxPage = Math.ceil(d.total_count/10);
                            }
                            sch.allMajorList.clear();
                            sch.allMajorList.pushArray(d.major_list);
                            window.fixBottom && fixBottom();
                        }
                    });
                },
                shouAllMajor:function(sch,showStats,e){
                    pin.cancelDefault(e);
                    var vm = that.getVm();
                    if(showStats == sch.$showMajorList){return false;}
                    if(showStats){
                        sch.$showMajorList = true;
                        //sch.majorFilter.page = 1;
                        vm._loadMajor_list(sch,true);
                    } else {
                        sch.$majXhr && sch.$majXhr.abort();
                        sch.$majXhr = null;
                        sch.$showMajorList = false;
                        sch.allMajorList.clear();
                    }
                },
                majListSort:function(sch,type){
                    var vm = that.getVm();
                    if(sch.majorFilter.order_type == type){
                        sch.majorFilter.order = ( sch.majorFilter.order == "desc"?"asc":"desc" )
                    } else {
                        sch.majorFilter.order = "desc";
                    }
                    sch.majorFilter.page = 1;
                    sch.majorFilter.order_type = type;
                    vm._loadMajor_list(sch);
                },
                levelMouseenter:function(){
                    that.tipsEl.insertAfter(this);
                    var tipsText = $("div",this).attr("class");
                    var msg = {
                        "chong":"可冲击解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率在50%-80%时，则为可冲击",
                        "wen":"较稳妥解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率在80%-98%时，则为较稳妥",
                        "bao":"可保底解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率大于98%时，则为可保底",
                        "impossible":"不建议填报解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率小于50%时，则不建议报考"
                    }
                    that.tipsEl.css("top",'');
                    clearTimeout(that.$tipsTimeId);
                    that.tipsEl.removeClass('hidden').html("<p>"+msg[tipsText]+"</p>");
                },
                majorSelectMouseenter:function(){
                    that.tipsEl.appendTo(this);
                    that.tipsEl.css("top",'');
                    clearTimeout(that.$tipsTimeId);
                    that.tipsEl.removeClass('hidden').html("<p>根据您的排名对比该校往年录取考生的排名分析得到，你的选择权超过越多录取学生，就越有机会挑选专业。</p>");
                },
                tipsMouseleave:function(){
                    that.$tipsTimeId = setTimeout( function(){ that.tipsEl.addClass("hidden"); },200);
                },
                scoreMouseenter:function(sch) {
                    that.tipsEl.insertAfter(this);
                    clearTimeout(that.$tipsTimeId);
                    var html = "<table><thead><tr><th></th><td>最高分</td><td>最低分</td><td>最低分排名</td><td>平均分</td><td><b>平均分排名</b></td></tr></thead><tbody>";
                    sch.$score_list.forEach(function (item) {
						if(item.avg_score_rank <=0) {
							item.avg_score_rank = "--";
						}
						if(item.high_score <= 0){
							item.high_score = "--";
						}
						if(item.avg_score <= 0){
							item.avg_score = "--";
						}
                        if(item.low_score<=0){
                            item.low_score = '--';
                        }
                        if(item.low_score_rank<=0){
                            item.low_score_rank = '--';
                        }
                        html+=['<tr>',
                        '    <th>'+item.year+'年</th>',
                        '    <td>'+item.high_score+'</td>',
                        '    <td>'+item.low_score+'</td>',
                        '    <td>'+item.low_score_rank+'</td>',
                        '    <td>'+item.avg_score+'</td>',
                        '    <td><b>'+item.avg_score_rank+'</b></td>',
                        '</tr>'].join('')
                    });
                    var top = [88,76,65,53][sch.$score_list.length]
                    that.tipsEl.css("top",top);
                    that.tipsEl.removeClass('hidden').html(html +"</tbody></table>");
                },
                changeColle:function(sch,maj,e,type){
                    if(!isLogin){
                        ipinAuth.loginBox();  
                        return false;
                    }
                    var item =  maj || sch;
                    var vm = that.getVm();
                    var sch_id = sch.sch_id;
                    var major_id = maj ? maj.major_id : "" ;
                    var el = this;
                    if(type){
                        switch(type){
                            case 'tab2':
                                item = sch;
                                sch_id = sch.sch_id;
                                major_id = maj.major_id;
                                break
                            case 'tab3':
                                item = sch;
                                sch_id = sch.sch_id;
                                major_id = sch.major_id;
                                break;
                        }
                    }
                    if(!item.is_collect){
                        Req.addColle(sch_id,major_id,rootVm.iszhuanke?5:7,function(r){
                            var data = r.getData();
                            if(data.success){
                                item.is_collect = true;
                                if(maj){
                                    sch.is_collect = true
                                }
                                vm.updateColle(r);
                                if(!maj && !type){
                                    that.tips2.show(sch,el);
                                }
                            }
                        });
                    } else {
                        Req.removeColle(sch_id,major_id,rootVm.iszhuanke?5:7,function(r){
                            item.is_collect = false;
                            vm.updateColle(r);
                            pin.fire('removeColle',{sch_id:sch_id,major_id:major_id});
                        });
                    }
                    pin.cancelDefault(e);
                },
                updateColle:function(r){
                    var vm =  that.getVmFormId("pipe_1");
                    var data = r.getData();
                    if(r.isOk()){
                       vm.colle.colleSchCount = data.sch_count;
                       vm.colle.colleMajCount = data.major_count;
                    }
                }
            }
        },
        vmBind:function(vm){
            console.log("listArea vmBind");
            var that = this;
            vm.$watch("_ready",function(){
                console.log("listArea _ready ,",that.json.isfirst,pin.cfg.selectAreaOk)
                if(that.json.isfirst){
                    if(pin.cfg.selectAreaOk){
                        vm.reloadList();
                    } else {
                        console.log("listArea _ready pin.on selectAreaOk")
                        pin.on('selectAreaOk',function(){
                            vm.reloadList();
                        });
                    }
                }
            })
        },
        isImportant:true,
        onViewReady:function(){
            var that = this;
            this.tips();
            this.tips2Init();
            this.event();


            if(this.json.notHasScore){

                this.json.myscore.pici = "";
                scoreUi(this.json.myscore,function(_score){
                    location.href="/zhiyuan?batch="+_score.pici;
                },true).display = true;
                this.fireCount(this.json);
            } else {
                if(!$.cookie('guide')){
                    $.cookie('guide','1',{expires:30,path:"/"})
                    pin.fire('guide');
                }
            }



            $("#setMyscore").click(function(){
                /*location.href="/";
                return false;*/

                scoreUi(that.json.myscore,function(_score){
                    location.href="/zhiyuan?batch="+_score.pici;
                }).display = true;
                return false;
            });


            console.log('listArea onViewReady')
        },
        fireCount:function(json){
            var selCount = {
                bao_count : json.schData.bao_count||0,
                chong_count : json.schData.chong_count||0,
                wen_count : json.schData.wen_count||0,
                impossible_count : json.schData.impossible_count||0,
                total_major_count:json.schData.total_major_count,
                total_sch_count:json.schData.total_sch_count,
                total_sch_major_count:json.schData.total_sch_major_count
            };
            pin.fire("selCount",selCount);
            if(!avalon.vmodels.pipe_1){
                pin.cfg.selCount = selCount;
            }

        },
        event:function(){
            var vm = this.getVm();
            pin.on('removeColle',function(e){
                var sch_id = e.sch_id;
                var major_id = e.major_id;
                vm.sch_list.forEach(function(item){
                    if(item.sch_id == sch_id){
                        if(major_id == ''){
                            item.is_collect = false;
                        }
                        var collectLen = 0;
                        if(item.allMajorList.length){
                            item.allMajorList.forEach(function(subItem){
                                if(major_id  == subItem){
                                    subItem.is_collect = false;
                                    return false
                                }
                                if(major_id == ''){
                                    subItem.is_collect = false;
                                }
                                if(subItem.is_collect){
                                    collectLen++;
                                }
                            })
                        };
                        item.major_collect_count = collectLen;
                        return false;
                    }
                });
            })
        },
        $tipsTimeId:0,
        tips:function(){
            var that = this;
            this.tipsEl = $('<div class="float-tips"><p></p></div>');
            this.tipsEl.appendTo('body').addClass('hidden');
            this.tipsEl.hover(function(){
                clearTimeout(that.$tipsTimeId);
            },function(){
                that.$tipsTimeId = setTimeout(function(){ that.tipsEl.addClass("hidden"); },200);
            })
        },
        tips2Init:function(){
            var that = this;
            var vm = this.getVm();
            var tpl = ['<div class="float-tips2 hidden">',
            '    <div class="ft-con">',
            '        <p>是否继续添加该校的专业？',
            '            <br><span>(建议至少选择6个）</span> ',
            '        </p>',
            '    </div>',
            '    <div class="ft-btn">',
            '        <span class="btn-common">继续添加</span> ',
            '        <span class="btn-common2">否</span> ',
            '    </div>',
            '</div>'].join('');

            this.tips2 = {
                init:function(){
                    this.view = $(tpl);
                    this.view.appendTo('body');
                    var that = this;
                    this.view.find(".ft-btn span").click(function(){
                        that.hide();
                        return false;
                    });
                    this.view.find(".ft-btn .btn-common").click(function(){
                        var sch = that.model;
                        sch.$showMajorList = true;
                        vm._loadMajor_list(sch,true);
                    });
                    pin.on("clickBody",function(e){
                        if(!that.view[0].contains(e.target)){
                            that.hide();
                        }
                    });
                },
                show:function(schModel,el){
                    this.model=schModel;
                    $(el).parent().append(this.view);
                    this.view.removeClass("hidden");
                },
                hide:function(){
                    this.view.addClass("hidden");
                }
            };
            this.tips2.init();
        }
    }));

     return {
        init:function(){
            pin.use("zhiyuan/zhiyuan/listArea");
        }
    }
    
    

});
