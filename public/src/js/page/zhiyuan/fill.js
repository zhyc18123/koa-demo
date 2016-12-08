define(["jquery","pin","avalon","common/pinData",'request','page/head','common/common','common/fixBottom'],
    function($,pin,avalon,pinData,Req,headjs) {

    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]}

    var myscore = getCfg("myscore");
    var isLogin = getCfg("isLogin");
    var isVip = getCfg("isVip");
    var group = getCfg("group");
    var myPici = getCfg("pici")||'bk1';
    var provName = getCfg("prov");
    var wl = myscore.ty=='l'?'li':'wen';
    var iszhuanke = myPici.substr(0,2) == "zk";

    if(myscore.prov=='15'){
        alert("因为内蒙古的志愿填报方式较特殊，暂不支持模拟填报。您可以查询感兴趣的学校和专业。",function(){
            history.go(-1);
        });
        $("body").removeAttr("ms-controller");
        $(".auto-fill-page").hide();
        return;
    }



    

    

    if(!isLogin){
        $("body").removeAttr("ms-controller");
        $(".auto-fill-page").hide();
        ipinAuth.loginBox('/fill');
        return false;
    }/*else if(!isVip){
        alert("开通VIP会员即可使用手动填志愿",function(){
            window.location.href="/buy/product";
        });
    }*/

    

    if(myscore.prov!='15'){
        var gArr = ["一",'二','三','四','五','六']
        var keys = Object.keys(group);
        var pList = [];
        keys.forEach(function(k,pici_idx){

            var picigroup = group[k];
            var gList = [];
            if( avalon.type(picigroup[0]) != "array" ){
                picigroup = [picigroup];
            }



            picigroup.forEach(function(item,group_idx){

                if(avalon.type(item[0]) == "array"){//2016 增加批次分组的院校分类
                    var gTypeList = item;
                    gTypeList.forEach(function(item){
                        collectGItemInfo(item,group_idx,item[2]);
                    });

                }else{
                    collectGItemInfo(item,group_idx);
                }

                function collectGItemInfo(item,group_idx,zhiyuanCateIndex){
                    var groupName = "第"+gArr[group_idx]+"组";
                    var zhiyuanCate = zhiyuanCateIndex?zhiyuanCateIndex+'类':'';

                    var gItem = {
                        show:true,
                        zhiyuanCateIndex:zhiyuanCateIndex,
                        zhiyuanCate:zhiyuanCate,
                        group_idx:group_idx,
                        groupName:groupName,
                        schList:[]
                    }

                    avalon.range(item[0]).forEach(function(sch_idx){//志愿学校个数
                        var zhiyuanName = "志愿"+String.fromCharCode(65+sch_idx%26)+(sch_idx>25?'1':'');
                        var bntName =  (gItem.zhiyuanCate?gItem.zhiyuanCate+' ':'')+(picigroup.length >1 ?gItem.groupName:"" )+ zhiyuanName;
                        var sch_item = {
                            zhiyuanName:zhiyuanName,
                            bntName:bntName,
                            show:false,
                            hasset:false,
                            showPop:false,
                            obey:false,
                            unobey:false,
                            isFirst:false,
                            $pici:k,
                            $piciIdx:pici_idx,
                            $schIdx:sch_idx,
                            $piciName:pinData.PICINAME[k],
                            $value:{
                                schName:"",
                                schId:""
                            },
                            showSchoolItem:function(schItem,e){
                                schItem.show = true;
                                pin.cancelDefault(e);
                            },
                            obeyFn:function(schitem,v,e){
                                if(v == '0'){
                                    schitem.obey = true;
                                    schitem.unobey = false;
                                } else {
                                    schitem.obey = false;
                                    schitem.unobey = true;
                                }
                                root.saveData();
                                //pin.cancelAll(e);
                            },
                            showCollleSch:function(schitem,e){
                                e && pin.cancelAll(e);
                                var cmvm = getVmFormId('cmaj');
                                cmvm.hide();
                                if(schitem.showPop == false){
                                    var csvm = getVmFormId('csch');
                                    var el = getEl([pici_idx,group_idx,sch_idx]);
                                    csvm.show(schitem,el);
                                }
                            },
                            _removeAllMaj:function(schitem){
                                schitem.maj_list.forEach(function(maj){
                                    maj.removeMaj(maj);
                                })
                            },
                            setSch:function(schitem,collSch){
                                schitem._removeAllMaj(schitem);
                                schitem.hasset = false;
                                schitem.$value.schName = collSch.sch_name;
                                schitem.$value.schId = collSch.sch_id;
                                schitem.$value.from = collSch.from;//by linhuabiao date:2016.
                                schitem.hasset = true;
                                if( schitem.obey == false || schitem.unobey == false ){
                                    schitem.obey = true;
                                }
                                root.saveData();
                            },
                            removeSch:function(schitem){
                                schitem.hasset = false;
                                schitem.$value.schName = "";
                                schitem.$value.schId = "";
                                schitem._removeAllMaj(schitem);
                                root.saveData();
                            },
                            next:function(schitem){
                                if(schitem.hasset){
                                    //寻找第一个没有设置节点的
                                    var find = false;
                                    console.log('next>>>', schitem.maj_list,schitem)
                                    schitem.maj_list.forEach(function(maj){
                                        if(!maj.hasset && !find){

                                            maj.showCollleMaj(schitem,maj);
                                            find = true;
                                            return false;
                                        }
                                    })
                                } else {
                                   schitem.showCollleSch(schitem);
                                }
                            }
                        };
                        var maj_list = [];
                        avalon.range(item[1]).forEach(function(maj_idx){//志愿专业个数
                            maj_list.push({
                                hasset:false,
                                $value:{
                                    majorName:"",
                                    majorId:""
                                },
                                $majIdx:maj_idx,
                                showPop:false,
                                $defName:"专业"+(maj_idx+1),
                                showCollleMaj:function(schitem,majitem,e){
                                    console.log("showCollleMaj>>>",schitem,majitem)
                                    e && pin.cancelAll(e);
                                    if(!schitem.hasset){
                                        schitem.next(schitem);
                                        return ;
                                    }
                                    var csvm = getVmFormId('csch');
                                    csvm.hide();
                                    if(majitem.showPop == false){
                                        var cmvm = getVmFormId('cmaj');
                                        var el = getEl([pici_idx,group_idx,sch_idx,maj_idx]);
                                        cmvm.show(schitem,majitem,el);
                                    }
                                },
                                setMaj:function(majitem,collemaj){
                                    majitem.hasset = false;
                                    majitem.$value.majorName = collemaj.major_name;
                                    majitem.$value.majorId = collemaj.major_id;
                                    majitem.hasset = true;
                                    root.saveData();
                                },
                                removeMaj:function(majitem){
                                    if(majitem.hasset){
                                        majitem.hasset = false;
                                        majitem.$value.majorName = '';
                                        majitem.$value.majorId = '';
                                        root.saveData();
                                    }
                                }
                            });
                        });
                        sch_item.maj_list = maj_list;
                        gItem.schList.push(sch_item);
                    });
                    gList.push(gItem);
                }
            });



            pList.push({
                piciName:pinData.PICINAME[k],
                show:myPici == k,
                gList:gList,
                $pici:k,
                changePitemShow:function(pItem,e){
                    pItem.show=!pItem.show;
                    pin.cancelDefault(e);
                }
            })
        });
    }

    
    function getEl(idxArr){//批次,分组,学校,专业
        if( idxArr.length == 3 ){
            return $('.af-box:eq('+idxArr[0]+') .af-section:eq('+idxArr[1]+') .af-group:eq('+idxArr[2]+') .college-box')
        } else {
            return $('.af-box:eq('+idxArr[0]+') .af-section:eq('+idxArr[1]+') .af-group:eq('+idxArr[2]+') .speciality-box:eq('+idxArr[3]+')')
        }
    }

    //读取数据库值
    var initData = function(zhiyuan){
        if(zhiyuan){
            var data = zhiyuan.batch_list;
            data.forEach(function(dpitem){
                var pitem = null;
                pList.forEach(function(_pitem){
                    if(_pitem.$pici == dpitem.batch){
                        pitem = _pitem;
                    }
                });
                dpitem.zhiyuan_group.forEach(function(dgitem,g_idx){
                    var gitem = pitem.gList[g_idx];
                    dgitem.zhiyuan_list.forEach(function(dschitem){
                        //根据idx对应学校
                        var schitem = gitem.schList[dschitem.index_id];
                        schitem.show = true;
                        //设置学校信息
                        if(dschitem.has_set_follow_adjust){
                            schitem.obey = dschitem.follow_adjust;
                            schitem.unobey = !dschitem.follow_adjust;
                        }
                        schitem.$value.schId = dschitem.sch_id;
                        schitem.$value.schName = dschitem.sch_name;
                        schitem.hasset = true;
                        dschitem.major_list.forEach(function(dmajitem){
                            var majitem = schitem.maj_list[dmajitem.index_id];
                            majitem.hasset = true;
                            majitem.$value.majorId = dmajitem.major_id;
                            majitem.$value.majorName = dmajitem.major_name;
                        });
                    });
                });
            });
        }
    }
    initData(getCfg("zhiyuan"));





    function getVmFormId(id){
        if(avalon.vmodels[id]){
            return avalon.vmodels[id]
        } else {
            if(id!="root"){
                throw Error("not Found vm["+id+"]")
            }
        }
    }

    var root = avalon.define({
        $id:"root",
        plist:pList,
        saveData:function(e){
            var root = getVmFormId("root");
            var rv = root.getAllData();
            var zybid = $(".fb-r .btn-auto-fill").data("zybid")||"";
            Req.save_zhiyuan({zybid:zybid,batch_list:JSON.stringify(rv)},function(r){
                var data = r.getData();
                if(r.isOk()){
                    $(".fb-r .btn-auto-fill").data("zybid",data.zhiyuan_id)
                        .attr("href","/analyse_zhiyuan?zyb_id="+data.zhiyuan_id);
                } else {
                    alert(data.msg);
                }
            });
            e && pin.cancelDefault(e);
        },
        getAllData:function(){
            var root = getVmFormId("root");
            var batch_list_2016 = root.getAllData_2016();
            var batch_list_data = [batch_list_2016]



            var batch_list = [];
            root.plist.forEach(function(pitem){
                var batch = {
                    batch:pitem.$pici
                };
                var zhiyuan_group = [];
                pitem.gList.forEach(function(gitem){
                    var zhiyuan_list = [];
                    var group = {
                        zhiyuan_list:zhiyuan_list,
                    };
                    /*var hasOneSet = false;
                    gitem.schList.forEach(function(schitem){
                        hasOneSet = hasOneSet || schitem.hasset;
                    });*/
                    gitem.schList.forEach(function(schitem){
                        if(schitem.hasset){
                            var maj_list=[];
                            var sch = {
                                sch_id: schitem.$value.schId,
                                sch_name: schitem.$value.schName,
                                follow_adjust: schitem.obey,
                                has_set_follow_adjust:schitem.obey || schitem.unobey,
                                major_list:maj_list,
                                index_id:schitem.$schIdx
                            }
                            schitem.maj_list.forEach(function(majitem){
                                if(majitem.hasset){
                                    maj_list.push({
                                        major_id:majitem.$value.majorId,
                                        major_name:majitem.$value.majorName,
                                        index_id:majitem.$majIdx
                                    })
                                }
                            });
                            zhiyuan_list.push(sch);
                        }

                    });
                    zhiyuan_group.push(group)
                });
                batch.zhiyuan_group = zhiyuan_group;
                batch_list.push(batch);
            });

            batch_list_data.push(batch_list);

            return batch_list_data
        },

        getAllData_2016:function(){
            var root = getVmFormId("root");
            var plist = root.plist;
            var zy_list_item_tpl = {
                adjust: 0,
                avg_score: 0,
                avg_year: 2015,
                is_211: false,
                is_985: false,
                is_predict: false,
                safe_ratio: 0,
                sch_id: "",
                sch_loc: "",//city
                sch_name: "",
                select_level: "",
                toudang_score: 0,
                toudang_year: 2015,
                major_list: [],
                old_major_list: [/*{
                    diploma: "bk",
                    is_standard: false,
                    major_code: 0,
                    major_id: "56d19ab5d6d9f531167be6ed",
                    major_name: "计算机科学与技术(招英语考生)"
                }*/]
            }

            var batch_list = [];
            plist.forEach(function(pitem){
                //ab类分开
                var batchs = [];
                var batch = {}
                var group_list = [];
                pitem.gList.forEach(function(gitem){
                    if(gitem.zhiyuanCateIndex&&batch.batch_ex!=gitem.zhiyuanCateIndex){//gitem.zhiyuanCate AB 类
                        group_list = [];
                        batch = {
                            batch:pitem.$pici,
                            batch_ex:gitem.zhiyuanCateIndex,
                            group_list:group_list
                        }
                        batchs.push(batch);
                    }else if(batchs.length==0){//不分AB类
                        batch = {
                            batch:pitem.$pici,
                            batch_ex: gitem.zhiyuanCateIndex||"",
                            group_list:group_list
                        }
                        batchs.push(batch);
                    }

                    var zy_list = [];
                    var group = {
                        major_no:6,
                        zy_list:zy_list,
                    }

                    /*var hasOneSet = false;
                    gitem.schList.forEach(function(schitem){
                        hasOneSet = hasOneSet || schitem.hasset;
                    });*/
                    gitem.schList.forEach(function(schitem){
                        if(schitem.hasset){
                            var maj_list=[];
                            var sch = {};

                            for(var k in zy_list_item_tpl){
                                sch[k] = zy_list_item_tpl[k];
                            }

                            sch.sch_id = schitem.$value.schId;
                            sch.sch_name = schitem.$value.schName;
                            sch.adjust = !!schitem.obey*1;
                            sch.major_list = maj_list;
                            //sch.index_id = schitem.$schIdx;

                            schitem.maj_list.forEach(function(majitem){
                                if(majitem.hasset){
                                    maj_list.push(majitem.$value.majorId);
                                }
                            });

                            schitem.old_major_list = [
                            {
                                diploma: "bk",
                                is_standard: false,
                                major_code: 0,
                                major_id: "56d19ab5d6d9f531167be6ed",
                                major_name: "计算机科学与技术(招英语考生)"
                            }]

                            zy_list.push(sch);
                        }

                    });
                    group_list.push(group)
                });

                batch_list = batch_list.concat(batch);
            });


            return batch_list;
        },
        downloadPDF:function(){
            var zyb_id = $(".fb-r .btn-auto-fill").data("zybid")
            if (zyb_id) {
                location.href = "/zhiyuan/download/"+zyb_id+"/完美志愿_志愿表.pdf"
            }else {
                alert("请至少填报一个志愿")
            }
        }
    });

    var widget1 = avalon.ui.colleSch = function(element, data, vmodels){
        var html = ['<div class="pop-box" ms-visible="display">',
        '    <div class="cbb-ti">',
        '        <div class="cbb-title">',
        '            从收藏列表（{{piciName}}）中添加{{zhiyuan}}',
        '        </div>',
        '    </div>',
        '    <div class="cbb-sort">',
        '        <div class="re-tag">',
        '            <span class="tag" ms-click="diffFn(\'chong\')"><em ms-class="{{difficultList.indexOf(\'chong\')==-1?\'ico_nosel\':\'ico_sel\'}}"></em>可冲击({{chong_count}})</span> ',
        '            <span class="tag" ms-click="diffFn(\'wen\')"><em ms-class="{{difficultList.indexOf(\'wen\')==-1?\'ico_nosel\':\'ico_sel\'}}"></em>较稳妥({{wen_count}})</span> ',
        '            <span class="tag" ms-click="diffFn(\'bao\')"><em ms-class="{{difficultList.indexOf(\'bao\')==-1?\'ico_nosel\':\'ico_sel\'}}"></em>可保底({{bao_count}})</span> ',
        '            <span class="tag" ms-click="diffFn(\'impossible\')"><em ms-class="{{difficultList.indexOf(\'impossible\')==-1?\'ico_nosel\':\'ico_sel\'}}"></em>不建议填报({{impossible_count}})</span> ',
        '        </div>',
        '       <div class="search_bar">',
        '           <input type="text" class="search_keyword" placeholder="搜索学校" ms-blur="showsearchlist(false)" ms-focus="showsearchlist(true)" ms-input="searchsch(this.value,$event)" />',
        '           <i class="icon-search" ms-click="searchsch(this.value,$event)"></i>',
        '           <ul class="search_result" ms-class="hide:searchschListshow==false">',
        '               <li ms-repeat-searchschitem="searchschList" ms-click="addSch(searchschitem,$event)">{{searchschitem.sch_name}}</li>',
        '           </ul>',
        '       </div>',
        '    </div>',
        '    <div style="padding: 0 13px;height: 30px;line-height: 30px;margin-top: -10px;color: #828282;">按照学校的录取概率从低到高进行排序</div>',
        '    <div class="cbb-list cbb-mark">',
        '        <div class="cbb-item" ms-class="cbb-item-extend:collesch.show" ms-repeat-collesch="colleList">',
        '            <div class="ci-ti" ms-click="showColleSch(collesch)">',
        '                <div class="ci-title">',
        '                    <em ms-class="{{\'ico_t\'+{impossible:4,chong:1,wen:2,bao:3}[collesch.difficult_level]}}"></em>',
        '                    <a target="_blank" ms-if="collesch.has_stat" ms-href="/api/school/{{collesch.sch_id}}.html?diploma={{iszhuanke?5:7}}">{{collesch.sch_name}}</a>',
        '                    <a ms-if="!collesch.has_stat">{{collesch.sch_name}}</a>',
        '                </div>',
        '                <div class="ci-r">',
        '                    <span ms-class="{{schIdList.contains(collesch.sch_id)?\'btn-had-common\':\'btn-common\'}}" ms-click="addSch(collesch,$event)">',
        '                       {{ schIdList.contains(collesch.sch_id)? $schIdList[schIdList.indexOf(collesch.sch_id)] : "添加学校" }}',
        '                    </span> ',
        '                    <span>(已收藏{{collesch.major_list.size()}}个专业)</span> ',
        '                </div>',
        '            </div>',
        '            <div class="ci-con">',
        '                <span ms-repeat-collemaj="collesch.major_list">',
        '                   <a target="_blank" ms-if="collemaj.has_stat" ms-href="/api/school-major/{{collesch.sch_id}}-{{collemaj.major_id}}.html?diploma={{iszhuanke?5:7}}">{{collemaj.major_name}}</a>',
        '                   <a  ms-if="!collemaj.has_stat">{{collemaj.major_name}}</a>',
        '                </span>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'].join('');
        var el = $(html);
        $(element).after(el);
        el.attr("avalonctrl",data.colleSchId)
        $(element).remove();
        element = el[0];
        data.element = element;
        var vmodel = avalon.define(data.colleSchId, function(vm) {
            avalon.mix(vm, data.colleSchOptions);
            vm.setSchId = null;
            vm.piciName = null;
            vm.zhiyuan = null;
            vm.iszhuanke = iszhuanke;
            vm.difficultList = []
            vm.pici = null;
            vm.$schitem = null;
            vm.setSchId = null;
            vm.show=function(schitem,el){
                vm.hide();
                el.append(element);
                schitem.showPop=true;
                vm.piciName = schitem.$piciName;
                vm.zhiyuan = String.fromCharCode(65+schitem.$schIdx) + "志愿";
                vm.difficultList.clear();
                vm.difficultList.pushArray(["chong","wen","bao"]);
                vm.pici = schitem.$pici;
                vm.iszhuanke = schitem.$pici.substr(0,2) == "zk";
                vm.$schitem = schitem;
                vm.setSchId = schitem.$value.schId;
                vm._getAllSchData();
                vm._getColleList();
                vm.display=true;
            }
            vm._getAllSchData = function(){
                var piciVm = getVmFormId("root").plist[vm.$schitem.$piciIdx];
                var schId = [];
                var $schId = [];
                var hasSetGroup = piciVm.gList.length > 0;
                piciVm.gList.forEach(function(gitem){
                    gitem.schList.forEach(function(schitem){
                        if(schitem.hasset){
                            schId.push(schitem.$value.schId);
                            $schId.push(String.fromCharCode(65+schitem.$schIdx) + "志愿");
                        }
                    });
                });
                vm.$schIdList = $schId;
                vm.schIdList.clear();
                vm.schIdList.pushArray(schId);
            }
            vm.hide=function(){
                vm.display=false;
                vm.setSchId = '';
                if(vm.$schitem){
                    vm.$schitem.showPop=false;
                    vm.$schitem = null;
                }
            }
            vm.$init = function(){
                pin.on("clickBody",function(e){
                    if(!element.contains(e.target)){
                        vm.hide();
                    }
                });
            }
            vm.addSch = function(colleSch,e){
                var schitem = vm.$schitem;
                if(!vm.schIdList.contains(colleSch.sch_id)){//加入选择学校
                    schitem.setSch(schitem,colleSch);
                    vm._getAllSchData();
                    vm.hide();
                    schitem.next(schitem);
                }else{
                    alert('该学校已经在志愿表中，请换一个');
                }
                pin.cancelAll(e);
            }
            vm.diffFn = function(t){
                if(vm.difficultList.contains(t)){
                    vm.difficultList.remove(t);
                } else {
                    vm.difficultList.push(t);
                }
                vm._getColleList();
            }
            vm._getColleList =function(){
                Req.sel_listColle(vm.pici,vm.difficultList.$model,function(r){
                    if(r.isOk()){
                        var data = r.getData();
                        vm.colleList.clear();
                        data.sch_list.forEach(function(sch){
                            sch.show=false;
                            sch.major_list = sch.major_list||[];
                        })
                        vm.colleList.pushArray(data.sch_list);
                        vm.bao_count = data.bao_count;
                        vm.chong_count = data.chong_count;
                        vm.impossible_count = data.impossible_count;
                        vm.wen_count = data.wen_count;
                    }
                });
            }
            vm.showColleSch = function(collesch){
                if(collesch.major_list.length > 0){
                    collesch.show = !collesch.show;
                }
            }

            //search
            vm.searchschListshow = false;
            vm.showsearchlist = function(frag){
                frag = frag&&!!vm.searchschList.length
                setTimeout(function(){
                    vm.searchschListshow = frag&&!!vm.searchschList.length;
                },frag?0:300);

            }
            vm.searchsch = function(searchKey,e){
                pin.cancelAll(e);
                var self = this;
                searchKey = (searchKey||'').replace(/^\s+|\s+$/g,'');
                if(searchKey.length<2){
                    return;
                }

                self.xhr&&self.xhr.abort();
            /*    self.xhr = Req.getZhaoshengSch({
                    search_key:searchKey,
                    diploma:7,
                    batch:'bk1',
                    wenli:'li',
                    province_id:'440000000000'
                },function(r){
                    var data = r.getData();
                    var sch_list = data.sch.sch_list||[];

                    if(sch_list.length){
                        vm.searchschList.clear();
                        var filterSchList = [];
                        sch_list.forEach(function(sch){
                            if(sch.school_diploma_id==5||sch.school_grade_tag_name.join().match('专科')){
                                sch.diploma_id = 5;
                            }else{
                                sch.diploma_id = 7;
                            }
                            if((vm.iszhuanke&&sch.diploma_id==5)||(vm.iszhuanke==false&&sch.diploma_id == 7)){
                                sch.sch_id = sch.school_id;
                                sch.sch_name = sch.school_name;
                                sch.is_211 = !!sch.school_grade_tag_id.join().match('211');
                                sch.is_985 = !!sch.school_grade_tag_id.join().match('985');
                                sch.avg_score = 0;
                                sch.avg_year = 2015;
                                sch.toudang_year = 2015;
                                sch.is_predict = false;
                                sch.safe_ratio = 0;
                                sch.sch_loc = '';//sch.school_city_name;
                                sch.show=false;
                                sch.adjust=1;
                                sch.major_list = sch.major_list||[];
                                sch.from = 'search';
                                filterSchList.push(sch);
                            }

                        });
                        vm.searchschList.pushArray(filterSchList);
                        vm.showsearchlist(true);
                    }
                });*/

                self.xhr = Req.autoSearch({
                    searchKey:searchKey,
                    searchType:'sch'
                },function(r){
                    var data = r.getData();
                    var sch_list = data.sch.sch_list||[];

                    if(sch_list.length){
                        vm.searchschList.clear();
                        var filterSchList = [];
                        sch_list.forEach(function(sch){
                            if(sch.school_diploma_id==5||sch.school_grade_tag_name.join().match('涓撶')){
                                sch.diploma_id = 5;
                            }else{
                                sch.diploma_id = 7;
                            }
                            if((vm.iszhuanke&&sch.diploma_id==5)||(vm.iszhuanke==false&&sch.diploma_id == 7)){
                                sch.sch_id = sch.school_id;
                                sch.sch_name = sch.school_name;
                                sch.is_211 = !!sch.school_grade_tag_id.join().match('211');
                                sch.is_985 = !!sch.school_grade_tag_id.join().match('985');
                                sch.avg_score = 0;
                                sch.avg_year = 2015;
                                sch.toudang_year = 2015;
                                sch.is_predict = false;
                                sch.safe_ratio = 0;
                                sch.sch_loc = '';//sch.school_city_name;
                                sch.show=false;
                                sch.adjust=1;
                                sch.major_list = sch.major_list||[];
                                sch.from = 'search';
                                filterSchList.push(sch);
                            }
                            
                        });
                        vm.searchschList.pushArray(filterSchList);
                        vm.showsearchlist(true);
                    }
                });

            }
        });

        avalon.nextTick(function(){
            avalon.scan(element, [vmodel].concat(vmodels));
        });

        return vmodel;
    }
    widget1.defaults = {
        display:false,
        $schitem:null,
        difficultList:["chong","wen","bao"],
        bao_count:0,
        chong_count:0,
        impossible_count:0,
        wen_count:0,
        colleList:[],
        pici:"bk1",
        piciName:"",
        zhiyuan:"",
        schIdList:[],
        $schIdList:[],
        searchschList:[]
    };

    var widget2 = avalon.ui.colleMaj = function(element, data, vmodels){
        var html = ['<div class="pop-box" ms-visible="display">',
                    '    <div class="cbb-ti">',
                    '        <div class="cbb-title">',
                    '            添加{{zhiyuan}}的第{{majorIdx}}专业',
                    '        </div>',
                    '    </div>',
                    '    <div class="cbb-mark">',
                    '       <div class="cbb-desc">',
                    '           <p>{{schName}}的收藏专业（{{majorList.size()}}）</p>',
                    '       </div>',
                    '       <div class="cbb-list">',
                    '           <div class="cbb-item" ms-repeat-collemaj="majorList">',
                    '               <div class="ci-ti">',
                    '                   <a target="_blank" ms-if="collemaj.has_stat" ms-href="/api/school-major/{{schId}}-{{collemaj.major_id}}.html?diploma={{iszhuanke?5:7}}" class="ci-title">{{collemaj.major_name}}</a>',
                    '                   <a target="_blank" ms-if="!collemaj.has_stat" class="ci-title">{{collemaj.major_name}}</a>',
                    '                   <div class="ci-r">',
                    '                       <span ms-click="addMaj(collemaj,$event)" ms-class="{{majIdList.contains(collemaj.major_id)?\'btn-had-common\':\'btn-common\'}}">',
                    '                       {{ majIdList.contains(collemaj.major_id)? $majIdxList[majIdList.indexOf(collemaj.major_id)] : $bntText }}',
                    '                       </span> ',
                    '                       <span ms-if="collemaj.has_avg_score">（14年平均分:{{collemaj.avg_score}})</span>',
                    '                   </div>',
                    '               </div>',
                    '           </div>',
                    '       </div>',
                    '       <div ms-if="allMajorList.size()>0">',
                    '       <div class="cbb-desc">',
                    '           <p>{{schName}}的其他在招专业（{{allMajorList.size()}}）</p>',
                    '       </div>',
                    '       <div class="cbb-list">',
                    '           <div class="cbb-item" ms-repeat-collemaj="allMajorList">',
                    '               <div class="ci-ti">',
                    '                   <a target="_blank" ms-if="collemaj.has_stat" ms-href="/api/school-major/{{schId}}-{{collemaj.major_id}}.html?diploma={{iszhuanke?5:7}}" class="ci-title">{{collemaj.major_name}}</a>',
                    '                   <a target="_blank" ms-if="!collemaj.has_stat" class="ci-title">{{collemaj.major_name}}</a>',
                    '                   <div class="ci-r">',
                    '                       <span ms-click="addMaj(collemaj,$event)" ms-class="{{majIdList.contains(collemaj.major_id)?\'btn-had-common\':\'btn-common\'}}">',
                    '                       {{ majIdList.contains(collemaj.major_id)? $majIdxList[majIdList.indexOf(collemaj.major_id)] : $bntText }}',
                    '                       </span> ',
                    '                       <span ms-if="collemaj.has_avg_score">（14年平均分:{{collemaj.avg_score}})</span>',
                    '                   </div>',
                    '               </div>',
                    '           </div>',
                    '       </div>',
                    '       </div>',
                    '    </div>',
                    '</div>'].join('');

        var el = $(html);
        $(element).after(el);
        el.attr("avalonctrl",data.colleMajId)
        $(element).remove();
        element = el[0];
        data.element = element;
        var vmodel = avalon.define(data.colleMajId, function(vm) {
            avalon.mix(vm, data.colleMajOptions);
            vm.majorIdx = '';
            vm.zhiyuan = "";
            vm.schId = "";
            vm.iszhuanke = iszhuanke;
            vm.schName = "";
            vm.$bntText = "";
            vm.$majitem = "";
            vm.$schitem = '';
            vm.setSchId = '';
            vm.$pici = "";
            vm.display=false;
            vm.show = function(schitem,majitem,el){
                vm.hide();
                el.append(element);
                majitem.showPop=true;
                vm.majorIdx = gArr[majitem.$majIdx];
                vm.zhiyuan = String.fromCharCode(65+schitem.$schIdx) + "志愿";
                vm.schId = schitem.$value.schId;
                vm.schName = schitem.$value.schName;
                vm.iszhuanke = schitem.$pici.substr(0,2) == "zk";
                vm.$pici = schitem.$pici;
                vm.$bntText = "添加第"+ gArr[ majitem.$majIdx ] +"专业";
                vm.$majitem = majitem;
                vm.$schitem = schitem;
                vm._getAllMajorData();
                vm.setSchId = majitem.$value.majorId;
                vm._getColleList();
                vm.display=true;
            }
            vm._getAllMajorData = function(){
                var majIdList=[],majIdxList = [];
                vm.$schitem.maj_list.forEach(function(maj){
                    if(maj.hasset){
                        majIdList.push(maj.$value.majorId);
                        majIdxList.push('第' + gArr[ maj.$majIdx ] +"专业" );
                    }
                });
                vm.$majIdxList =  majIdxList;
                vm.majIdList.clear();
                vm.majIdList.pushArray(majIdList);
            }
            vm.hide=function(){
                vm.display=false;
                vm.setSchId = '';
                if(vm.$majitem){
                    vm.$majitem.showPop=false;
                    vm.$majitem = null;
                    vm.$schitem = null;
                }
            }
            vm.addMaj = function(collemaj,e){
                if( !vm.majIdList.contains(collemaj.major_id)){
                    var schitem = vm.$schitem;
                    vm.$majitem.setMaj(vm.$majitem,collemaj);
                    vm._getAllMajorData();
                    vm.hide();
                    schitem.next(schitem);
                }
                pin.cancelAll(e);
            }
            vm._getColleList = function(){
                //判断是否来自搜索, by linhuabiao 2016.6.10
                //console.log("vm.$schitem.$value.from>>>",vm.$schitem.$value.schName, vm.$schitem.$value.from);
                var colleMajors = function(data){
                    var majorList = [];
                    var otherMajor = [];
                    data.major_list.forEach(function(j){
                      !!j.major_name && majorList.push(j);
                    });

                    data.all_major_list.forEach(function(j) {
                        var f = false;
                        if(!j.major_name)
                          f = true;
                        else{
                          for(var i=0,len=majorList.length;i<len;i++){
                              if(j.major_id == majorList[i].major_id){
                                  f = true;
                                  break;
                              }
                          }
                        }
                        !f && otherMajor.push(j)
                    });

                    vm.allMajorList.clear();
                    vm.allMajorList.pushArray(otherMajor);
                    vm.majorList.clear();

                    vm.majorList.pushArray(majorList);
                }

                var schFrom = vm.$schitem.$value.from;

                if(schFrom=='search'){//搜索学校的专业
                    Req.getSchEnrollment({
                        sch_id:vm.schId,
                        diploma:vm.iszhuanke?5:7,
                        province:provName,
                        wl:wl,
                        page:0,
                        count:100
                    },function(r){
                        var rdata = r.getData();
                        var dataList = rdata.dataList||[];
                        /*
                        avg_score: 616
                        avg_year: 0
                        has_avg_score: true
                        job_wide_ratio: 0.1324977008753704
                        major_id: "52aedf5b747aec1cfc84172f"
                        major_name: "会计学"
                        people_cnt: 0
                        people_year: 0
                        */


                        /*alias_major_id: "52aedf5b747aec1cfc8416d0"
                        alias_major_name: "建筑学"
                        is_major_id: true
                        major_has_stats: true
                        major_id: "52aedf5b747aec1cfc8416d0"
                        major_name: "建筑学"
                        plan_type: "非定向"
                        rank_index: 1
                        short_alias_major_id: "zf0sdg"
                        short_major_id: "zf0sdg"
                        wenli: "文史"
                        zhaosheng_batch: "本科第一批"
                        zhaosheng_count: 1
                        zhaosheng_xuezhi: "-"*/


                        //formart
                        var data = {
                            all_major_list:[],
                            major_list:[]
                        }

                        var major = {
                            avg_score: 0,
                            avg_year: 0,
                            has_avg_score: false,
                            job_wide_ratio: 0,
                            major_id: "",
                            major_name: "",
                            people_cnt: 0,
                            people_year: 0
                        }

                        for(var i=0;i<dataList.length;i++){
                            if(!dataList[i].major_id||!dataList[i].major_name){
                                continue;
                            }
                            var o = {};
                            for(var k in major){
                                o[k] = major[k];
                            }
                            o.major_id = dataList[i].major_id;
                            o.major_name = dataList[i].alias_major_name||dataList[i].major_name;
                            data.all_major_list.push(o);
                        }

                        colleMajors(data);

                    });

                }else{//搜索已收藏的学校专业
                    Req.sch_colle(vm.schId,vm.iszhuanke?5:7,vm.$pici,function(r){
                        var data = r.getData();
                        var allMajor = data.all_major_list||[];
                        if(!allMajor.length){//找不到专业
                            vm.$schitem.$value.from = 'search';
                            vm._getColleList();
                            return;
                        }

                        colleMajors(data);
                    });
                }

            }

            vm.$init = function(){
                pin.on("clickBody",function(e){
                    if(!element.contains(e.target)){
                        vm.hide();
                    }
                });
            }
        });

        avalon.nextTick(function(){
            avalon.scan(element, [vmodel].concat(vmodels));
        });

        return vmodel;
    }
    widget2.defaults = {
        schName:"",
        schId:"",
        display:false,
        $majIdxList:[],
        majIdList:[],
        allMajorList:[],
        $majitem:null,
        $schitem:null,
        zhiyuan:"",
        majorIdx:"",
        $bntText:"",
        majorList:[]
    };



    if(root.plist.length){
        var idx = Object.keys(getCfg("group")).indexOf(myPici);
        if(root.plist[idx]){
            var g_idx = getCfg('g_idx');
            var sch_idx = getCfg('sch_idx');
            var from_url = getCfg('from_url');
            var sch = root.plist[idx].gList[g_idx].schList[sch_idx];
            if(from_url){
                sch.showCollleSch(sch);
            }
            //sch.show = true;
            //sch.next(sch);
        } else if ( idx != -1 ){
            var sch = root.plist[idx].gList[0].schList[0];
            sch.isFirst=true;
        }
    }

    


    return {
        init:function(){
            headjs.init();
            avalon.scan(document.body,[root]);
            this.initEvent();
        },
        initEvent:function(){
            $('body').click(function(e){
                pin.fire("clickBody",{target:e.target});
            });

            var aCss = {
                'position':'absolute',
                'top':'auto'
            }

            var fCss = {
                'position':'fixed',
                'top':0
            }

            $(window).on("scroll",function(){
                var node = $(".auto-fill-page")[0];
                var rect = node.getBoundingClientRect()
                var toolbar = $(".js-tool-bar");
                if(rect.top<=0&&toolbar.css("position")!="fixed"){
                    toolbar.css(fCss);
                }else if(rect.top>0&&toolbar.css("position")!="absolute"){
                    toolbar.css(aCss);
                }
            });


            

            $(".fb-r .btn-auto-fill").on("click",function(){
                // if(!$(this).data('zybid')){
                //     alert("请先完成志愿填报");
                //     return false;
                // }

                alert('此功能正在升级中，您可以尝试智能填报等功能。');
                return false;
            });




        }
    }
});
