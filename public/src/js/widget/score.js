define(["jquery","pin","common/pinData","widget/select","request"],function($,pin,pinData,selectUi,Req) {
    var showScore = function(myScore,callback,notAllowClose){
        notAllowClose = !!notAllowClose;
        notAllowClose = notAllowClose||false;

        var scorepaneWarp = ['<div class="pop-dialog pop-score-dialog win-fixed" ms-class="pop-min-dialog:notAllowClose" ms-visible="display">',
            '    <div class="win-pop">',
            '        <div class="inner">',
            '            <div class="hd" style="margin:0;">',
            '                <a href="#" ms-if="!notAllowClose" class="btn-close" ms-click="closeFn"></a> ',
            '            </div>',
            '            <div class="bd js-warp">',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>'].join('')



        var msgBox = ['<div class="pop protocol-confirm win-fixed" style="display:none; margin: -120px 0 0 -240px;">',
                    '  <div class="bg">',
                    '    <div class="bd">',
                    '      <div class="txt">修改地区或者科目会丢失已保存的志愿方案。</div>',
                    '      <div class="bnt-area">',
                    '        <a href="#" class="bnt" id="succ">确认修改</a><a href="#" id="fail" class="bnt bnt-cancel">放弃修改</a>',
                    '      </div>',
                    '    </div>',
                    '  </div>',
                    '  <a href="#" class="close"></a>',
                    '  <div class="gl"></div><div class="gr"></div>',
                    '</div>'].join('')



        //2016 scorepane
        html = document.getElementById('scorePane').innerHTML;
        var element = $(scorepaneWarp);
        element.find(".js-warp").append(html);
        element.find(".form_box").css("position","relative");
        element.find(".form_btn").text("确定");


        var vm = avalon.vmodels.score;
        var succCallback = callback || $.noop;
        if(vm){
            vm.succCallback = succCallback;
            return vm;
        } else {

            var mask = $('<div id="pop_overlay" style="display: none;z-index: 1010;"></div>');
            var msgBox = $(msgBox);
            mask.appendTo('body');
            msgBox.appendTo('body');
            element.appendTo('body');
            var msgBoxObj = {
                calBack:$.noop,
                view:msgBox,
                show:function(fn){
                    this.calBack = fn;
                    this.view.show();
                },
                init:function(){
                    var that = this;
                    this.view.find(".close,#fail").click(function(){
                        that.view.hide();
                        return false;
                   });
                    this.view.find("#succ").click(function(){
                        that.calBack();
                        that.view.hide();
                        return false;
                    })
                }
            };
            msgBoxObj.init();


            /* ----------score-------------- */
            //myScore.pici = 'bk1'

            var oldTips = "修改地区或者科目会丢失已保存的志愿方案。";
            var old_prov = myScore.prov;
            var old_ty = myScore.ty;

            var piciArrJson = pinData.piciArr;
            var piciMap = {};
            var useDiffMap = {};
            var getProtext = [];
            piciArrJson.forEach(function(p){
                getProtext.push({text:p.py + "  "+p.prov,value:p.pid});
                var t = [];
                p.pici.forEach(function(piciStr){
                    t.push({text:pinData.PICINAME[piciStr],value:piciStr})
                });
                piciMap[p.pid] = t;
                if(p.useDiff) {
                    useDiffMap[p.pid] = true;
                }
            });

            function getProvName(prov){
                var provName;
                for(var i=0;i<getProtext.length;i++){
                    if(getProtext[i].value==prov){
                        provName = getProtext[i].text.replace(/[\w\s]/g,'');
                        break;
                    }
                }
                return provName;
            }


            //江苏分数
            var jiangsuCourseCfg = pinData.jiangsuCourseCfg;
            var req_courseCfg;

            if(myScore.req_course){
                req_courseCfg = pinData.getCourse(myScore.req_course);
            }else{
                req_courseCfg = jiangsuCourseCfg.req_course[myScore.ty];
            }

            myScore.score = myScore.score>=0?myScore.score:'';
            myScore.realScore = myScore.realScore>0?myScore.realScore: '';
            myScore.scoreRank = myScore.scoreRank>0?myScore.scoreRank: '';

            //for jiangsu province
            myScore.req_courseCfg = req_courseCfg;
            myScore.req_course = req_courseCfg.value;
            myScore.opt_course = myScore.opt_course||jiangsuCourseCfg.opt_courseList[0].value;
            myScore.req_level = myScore.req_level||jiangsuCourseCfg.courseLevels[0];
            myScore.opt_level = myScore.opt_level||jiangsuCourseCfg.courseLevels[0];

            //forjaingsu
            myScore.ysy_score = myScore.ysy_score>0?myScore.ysy_score:"";
            myScore.zh_score = myScore.zh_score>0?myScore.zh_score:"";
            myScore.zx_score = myScore.zx_score>0?myScore.zx_score:"";
            myScore.js_score = myScore.js_score>0?myScore.js_score:"";

            myScore.update_count = myScore.update_count;


            myScore.opt_courseCfg={
                biology:'生物',
                chemistry:'化学',
                geography:'地理',
                politics:'政治'
            }

            var scoreInfo = avalon.mix({},myScore);


            var vmodel = avalon.define({
                $id:"score",
                saveScoreForm:'scoreBox',
                display:false,
                errtxt:oldTips,
                notAllowClose:notAllowClose,
                succCallback : succCallback,
                title:notAllowClose?(myScore.score?"预测录取概率功能已上线,<br />马上输入你的排名试试看":"根据分数，为你推荐完美志愿"):"修改成绩",

                lineName:pinData.PICILINENAME[myScore.pici||'bk1'],
                score:scoreInfo,
                piciArr:[],

                $opt_course_list:{
                    value:myScore.opt_course,
                    data:jiangsuCourseCfg.opt_courseList,
                    $mustHaveValue: true,
                    onChange:function(v){
                        vmodel.score.opt_course = v;
                    }

                },
                $req_level_list:{
                    value:myScore.req_level,
                    data: jiangsuCourseCfg.courseLevels,
                    $mustHaveValue: true,
                    onChange:function(v){
                        vmodel.score.req_level = v;
                    }
                },

                $opt_level_list:{
                    value:myScore.opt_level,
                    data: jiangsuCourseCfg.courseLevels,
                    $mustHaveValue: true,
                    onChange:function(v){
                        vmodel.score.opt_level = v;
                    }
                },

                $prov:{
                    value:myScore.prov,
                    data:getProtext,
                    $mustHaveValue:true,
                    onChange:function(pid){
                        vmodel.piciArr.clear();
                        vmodel.piciArr.pushArray(piciMap[pid]);
                        vmodel.lineName = pinData.PICILINENAME[vmodel.score.pici];
                        vmodel.provName = getProvName(pid);

                    }
                },
                provName:getProvName(myScore.prov),

                $pici:{
                    value:myScore.pici,

                    $mustHaveValue:true,
                    data:piciMap[myScore.prov],
                    onChange:function(v){
                        vmodel.lineName = pinData.PICILINENAME[v];
                    }
                },


                showScoreTab: true,
                toggleTab: function (flag){
                    vmodel.showScoreTab = flag
                },
                changewl:function(t,e){
                    vmodel.score.ty = t;

                    vmodel.score.req_courseCfg = jiangsuCourseCfg.req_course[t];
                    vmodel.score.req_course = vmodel.score.req_courseCfg.value;

                    //console.log(' vmodel.score.req_course>>>', vmodel.score.req_course,vmodel.score.opt_course)
                    pin.cancelDefault(e);
                },

                changStats:function(t,e){
                    vmodel.score.hasScore = t;
                    pin.cancelDefault(e);
                },

                validScore:function(){
                    //provid:上海 31, 江苏 32, 浙江 33 ,海南 46
                    var myScore = vmodel.score.$model;
                    var provid = myScore.prov.slice(0,2);
                    var msg = '';

                    if(myScore.update_count<=0){
                        alert('您的成绩已锁定，在8月31日之前不可修改');
                        return false;
                    }

                    if(myScore.realScore<=0&&myScore.scoreRank<=0&&provid!=33){
                        msg = '请输入您的成绩'
                    }else if(provid==33){
                        if(myScore.ysy_score>450){
                            msg = '您输入的【语数英】成绩已超过满分，请重新输入'
                        }else if(myScore.zh_score>450){
                            msg = '您输入的【综合】成绩已超过满分，请重新输入'
                        }else if(myScore.zx_score>60){
                            msg = '您输入的【自选】成绩已超过满分，请重新输入'
                        }else if(myScore.js_score>100){
                            msg = '您输入的【技术】成绩已超过满分，请重新输入'
                        }

                    }else if(provid==46&&myScore.realScore>900){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if(provid==31&&myScore.realScore>630){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if(provid==32&&myScore.realScore>480){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if($.inArray(provid*1,[31,32,33,46])==-1&&myScore.realScore>750){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }

                    msg&&alert(msg);
                    return !msg;
                },

                submit:function(e){
                    if(!vmodel.validScore(vmodel.score)){
                        return;
                    }




                    var params = {};
                    var paramKeys = ["prov","pici","hasScore","realScore","scoreRank","score","ty"];
                    if(vmodel.score.prov=='32'){
                        paramKeys = paramKeys.concat(["req_course","opt_course","req_level","opt_level"]);
                    }else if(vmodel.score.prov=='33'){
                        paramKeys = paramKeys.concat(["ysy_score","zh_score","zx_score","js_score"]);

                    }
                    for(var i=0;i<paramKeys.length;i++){
                        params[paramKeys[i]] = vmodel.score[paramKeys[i]];
                    }





                    var saveFn = function(){
                        Req.score(vmodel.saveScoreForm,params,function(r){
                            if(r.data.data.code==500){
                                alert(r.data.data.msg);
                            }else{
                                //location.href="/analyze_report";
                                //location.href="/evaluate";
                                //location.href="/zhiyuan";
                                 vmodel.succCallback(vmodel.score.$model);

                            }

                        });
                    }



                    var confireSubmit = function(){
                        if(vmodel.score.update_count>0&&vmodel.score.update_count<1000){
                            vmodel.doSaveFn = saveFn;
                            vmodel.showPop(4);
                            
                        }else{
                            saveFn();
                        }
                    }



                    /*if( old_ty!= vmodel.score.ty || old_prov != vmodel.score.prov){
                        pin.ui.MsgBox.confirm('温馨提示','修改地区或者科目会丢失已保存的志愿方案',function(choose){
                            confireSubmit();
                        });
                    }else{
                        confireSubmit();
                    }*/



                    if( !notAllowClose && (params.prov != old_prov || params.ty != old_ty)){
                        msgBoxObj.show(confireSubmit);
                    } else {
                        confireSubmit();
                    }
                    

                    pin.cancelAll(e);
                },

                doSaveFn:function(){

                },
                hideLockTip:function(){
                    vmodel.isPopShow.pop4 = false;
                },

                show: function (){
                    console.log('show~~~~')
                },
                isPopShow: {pop1: false, pop2:false, pop3: false,pop4:false},
                showPop: function (idx, e){
                    e&&e.preventDefault()
                    for (var key in vmodel.isPopShow) {
                        if (vmodel.isPopShow.hasOwnProperty(key)) {
                            vmodel.isPopShow[key] = (key.replace('pop','') == idx)
                        }
                    }
                },

                closeFn:function(e){
                    pin.cancelDefault(e);
                    vmodel.display = false;
                }
            });


            !notAllowClose && mask.click(function(){
                vmodel.display = false;
            });


            vmodel.$watch("display",function(v){
                if(v){

                    mask.show();
                } else {
                    mask.hide();
                    msgBoxObj.view.hide();
                }
            });


            vmodel.score.$watch("realScore",function(n,o){
                vmodel.score.realScore = parseInt(n*1)||"";
                if(vmodel.score.realScore>0&&vmodel.score.realScore!=o){
                    vmodel.score.score = 0;
                    vmodel.score.scoreRank = 0;
                    vmodel.score.hasScore = true;
                }

            });

            vmodel.score.$watch("scoreRank",function(n,o){
                vmodel.score.scoreRank = parseInt(n*1)||"";
                if(vmodel.score.scoreRank>0&&vmodel.score.scoreRank!=o){
                    vmodel.score.realScore = 0;
                    vmodel.score.score = 0;
                    vmodel.score.hasScore = false;
                }
            });


            element.click(function(){
                vmodel.errtxt=oldTips;
            });


            avalon.nextTick(function() {
                avalon.scan(element[0], [vmodel]);
            });
            return vmodel;
        }
    }
    return showScore;
});
