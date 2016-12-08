define(["jquery","pin","avalon","common/pinData","widget/select",'page/head','common/getFlash'],function($,pin,avalon,pinData,selectUi,headjs,getFlash) {
    var Req = pin.request;
    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]} 
    
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
        if(p.useDiff) {//批次配置文件中标记了使用分差
            useDiffMap[p.pid] = true
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
    

    /*

    江苏考生
    理科学生，必选物理，然后政治、地理、化学、生物四门中再选择一门；
    文科学生，必选历史，然后政治、地理、化学、生物四门中再选择一门；
    具体等级为  A+、A、B+、B、C、D六个等级  

    江苏总分超过480，
    海南总分超过900，
    上海总分超过630，
    其它省份总分超过750
    “您输入的成绩已超过满分，请重新输入。”

    浙江：语数英超过450、综合超过300、自选超过60、技术超过100
    “您输入的【科目名称】成绩已超过满分，请重新输入。”

    */
    

    var jiangsuCourseCfg = pinData.jiangsuCourseCfg;
    var req_courseCfg;
    if(getCfg("req_course")){
        req_courseCfg = pinData.getCourse(getCfg("req_course"));
    }
    if(!req_courseCfg){
        req_courseCfg = jiangsuCourseCfg.req_course[getCfg("ty")];
    }
    var myScore = {
        infoType:getCfg("infoType")||false,
        update_count:getCfg("update_count"),
        prov:getCfg("prov"),
        pici:getCfg("pici")||'bk1',
        hasScore:getCfg("realScore")>0,
        realScore:getCfg("realScore")>0? getCfg("realScore"):"",
        scoreRank:getCfg("scoreRank")||"",
        score:getCfg("score") || "",
        ty:getCfg("ty"),

        //for jiangsu province
        req_courseCfg:req_courseCfg,
        req_course:req_courseCfg.value,
        opt_course:getCfg("opt_course")||jiangsuCourseCfg.opt_courseList[0].value,
        req_level:getCfg("req_level")||jiangsuCourseCfg.courseLevels[0],
        opt_level:getCfg("opt_level")||jiangsuCourseCfg.courseLevels[0],
        opt_courseCfg:{
            biology:'生物',
            chemistry:'化学',
            geography:'地理',
            politics:'政治'
        },


        //forjaingsu
        ysy_score:getCfg("ysy_score")||"",
        zh_score:getCfg("zh_score")||"",
        zx_score:getCfg("zx_score")||"",
        js_score:getCfg("js_score")||""
    }


     
    var old_prov = myScore.prov;
    var old_ty = myScore.ty;


    var root = avalon.define({
        $id:"root",
        provShow:true,
        piciArr:[],
        
        provName:getProvName(myScore.prov),
        lineName:pinData.PICILINENAME[myScore.pici],
        score:myScore,

        
        
        $opt_course_list:{
            value:myScore.opt_course,
            data:jiangsuCourseCfg.opt_courseList,
            $mustHaveValue: true,
            onChange:function(v){
                root.score.opt_course = v;
            }
        },
        $req_level_list:{
            value:myScore.req_level,
            data: jiangsuCourseCfg.courseLevels,
            $mustHaveValue: true,
            onChange:function(v){
                root.score.req_level = v;
            }
        },
        $opt_level_list:{
            value:myScore.opt_level,
            data: jiangsuCourseCfg.courseLevels,
            $mustHaveValue: true,
            onChange:function(v){
                root.score.opt_level = v;
            }
        },
        
        $prov:{
            value:myScore.prov,
            data:getProtext,
            $mustHaveValue:true,
            onChange:function(pid){
                root.piciArr.clear();
                root.piciArr.pushArray(piciMap[pid]);
                root.lineName = pinData.PICILINENAME[root.score.pici];
                root.provName = getProvName(pid);

                /*$("*[dt='score_diff']").show()
                $("*[dt='score_rank']").hide()*/
            }
        },

        $pici:{
            value:myScore.pici,
            $mustHaveValue:true,
            data:piciMap[myScore.prov],
            onChange:function(v){
                root.lineName = pinData.PICILINENAME[v];
            }
        },

        showScoreTab: true,
        toggleTab: function (flag){
            root.showScoreTab = flag
            console.log(flag)
        },
        changewl:function(t,e){
            root.score.ty = t;

            root.score.req_courseCfg = jiangsuCourseCfg.req_course[t];
            root.score.req_course = root.score.req_courseCfg.value;

            //console.log(' root.score.req_course>>>', root.score.req_course,root.score.opt_course)
            pin.cancelDefault(e);
        },
        

        
    
        show: function (){},
        isPopShow: {pop1: false, pop2:false, pop3: false,pop4:false},
        showPop: function (idx, e){
            e&&e.preventDefault()
            for (var key in root.isPopShow) {
                if (root.isPopShow.hasOwnProperty(key)) {
                    root.isPopShow[key] = (key.replace('pop','') == idx)
                }
            }
        },

        
        validScore:function(){
            var myScore = root.score.$model;
            if(myScore.update_count<=0){
                alert('您的成绩已锁定，在8月31日之前不可修改');
                return false;
            }

            //provid:上海 31, 江苏 32, 浙江 33 ,海南 46
            var provid = myScore.prov.slice(0,2);
            var msg = '';


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
            if(!root.validScore(root.score)){
                return;
            }


            var saveFn = function(){
                var params = {};
                var paramKeys = ["prov","hasScore","realScore","scoreRank","score","ty"];
                if(root.score.prov=='32'){
                    paramKeys = paramKeys.concat(["req_course","opt_course","req_level","opt_level"]);
                }else if(root.score.prov=='33'){
                    paramKeys = paramKeys.concat(["ysy_score","zh_score","zx_score","js_score"]);

                }
                for(var i=0;i<paramKeys.length;i++){
                    params[paramKeys[i]] = root.score[paramKeys[i]];
                }
                

                Req.score("",params,function(r){
                    if(r.data.data.code==500){
                        alert(r.data.data.msg);
                    }else{
                        root.hideLockTip();
                        var batch = r.data.data.myscore.pici;
                        batch = batch||'bk1';
                        location.href="/zhiyuan?batch="+batch;
                    }
                    
                });
            }



            var confireSubmit = function(){
                if(root.score.update_count>0&&root.score.update_count<1000){
                    root.doSaveFn = saveFn;
                    root.showPop(4);
                    
                }else{
                    saveFn();
                }
            }



            if( old_ty!= root.score.ty || old_prov != root.score.prov){
                pin.ui.MsgBox.confirm('温馨提示','修改地区或者科目会丢失已保存的志愿方案',function(choose){
                    confireSubmit();
                });
            }else{
                confireSubmit();
            }



            pin.cancelAll(e);
        },
        //提交成绩修改，占位函数
        doSaveFn:function(){

        },
        //成绩锁定提示
        hideLockTip:function(){
            root.isPopShow.pop4 = false;
        }


    });



    root.score.$watch("realScore",function(n,o){
        root.score.realScore = parseInt(n*1)||"";
        if(root.score.realScore>0&&root.score.realScore!=o){
            root.score.score = 0;
            root.score.scoreRank = 0;
            root.score.hasScore = true;
        }
        
    });

    root.score.$watch("scoreRank",function(n,o){
        root.score.scoreRank = parseInt(n*1)||"";
        if(root.score.scoreRank>0&&root.score.scoreRank!=o){
            root.score.realScore = 0;
            root.score.score = 0;
            root.score.hasScore = false;
        }
    });

    function showScoreUi(){
        avalon.scan(document.body,[root]);
        $(".js_scoreHolder").removeClass("hidden");
    }


    //侧边栏
    function sitebarSwitch(){
        var sitebar = $(".fixed-box");
        if($(window).scrollTop()>544){
            sitebar.fadeIn();
        }else{
            sitebar.fadeOut();
        }
         
        $(window).on("scroll",function(e){
            if($(window).scrollTop()>544){
                sitebar.fadeIn();
            }else{
                sitebar.fadeOut();
            }
        });
    }

    //首页广告
    function bannerSwitch(){
        var curIndex = 0;
        var time = 800;
        var slideTime = 4000;
        var tid = setInterval(autoSlide, slideTime);

        function autoSlide() {
            if ($("#banner_img>li").size() <2 ) return
            curIndex + 1 >= $("#banner_img>li").size() ? curIndex = -1 : false;
            show(curIndex + 1);
        }
        function show(index) {
            $('#banner_ctr>a').removeClass('ctr_btn').eq(index).addClass('ctr_btn');
            $("#banner_img>li").eq(curIndex).stop(false, true).fadeOut(time);
            setTimeout(function () {
                $("#banner_img>li").eq(index).stop(false, true).fadeIn(time);
            
            }, 200)
            curIndex = index;
        }

        $("#banner_ctr>a").click(function () {
            show($(this).index());
            window.clearInterval(tid);
            tid = setInterval(autoSlide, slideTime);
        });
    }

    //合作方logo
    function logoSwitch(){
        var logos = $(".nav-search-friend img");
        var time=4000,i=0,curLogo;
        setInterval(function(){
            curLogo = logos.eq(i);
            curLogo.removeClass("hide").siblings().addClass("hide");
            i = (i+1)%logos.length;
        },time);
        
    }

    //帮助学生用户
    function numberSwitch(){
        var holder = $(".js-userCount");
        var time = 3000,deltaTime=16,num1 = 4200000,num2 = 4288486;
        var delta = Math.ceil((num2-num1)/(time/deltaTime));
        holder.text(num1);
        var m = 1,t1 = new Date();
        var timer = setInterval(function(){
            num1+=delta;
            if(num1>num2){
                num1 = num2;
                clearInterval(timer);
                console.log('numberSwitch time>>>',new Date()-t1)
            }
            holder.text(num1);
        },deltaTime);
    }

    //实用工具
    function toolSwitch(){
        var holder = $(".js-gaokaoTools");
        var tab = holder.find(".list");
        var sheets = holder.find(".details .details-list");

        tab.on("mouseover","li",function(){
            $(this).addClass("active").siblings().removeClass("active");
            sheets.eq($(this).index()).removeClass("hide").siblings().addClass("hide");
        })


    }

    //专家介绍
    function expertSwitch(){
        var experts = $(".expert-name li");
        var time=4000,i=0,curExpert;
        setInterval(function(){
            curExpert = experts.eq(i);
            curExpert.removeClass("hide").siblings().addClass("hide");
            i = (i+1)%experts.length;
        },time);
    }

    //视频
    function videoSwitch(){
        var videos = $(".m-video-box li");
        var videoNavs = $(".video-nav span");
        var time=4000,i=0,timer;
        function start(i){
            clearInterval(timer);
            timer = setInterval(function(){
                i = (i+1)%videos.length;
                videos.eq(i).removeClass("hide").siblings().addClass("hide");
                videoNavs.eq(i).addClass("long").siblings().removeClass("long");
            },time);
        }
        start(i);
        


        //play event
       
        videoNavs.on("click",function(){
            if($(this).hasClass("long")){
                return;
            }
            var i = $(this).index();
            $(this).addClass("long").siblings().removeClass("long");
            videos.eq(i).removeClass("hide").siblings().addClass("hide"); 

            start(i);
        });
    }

    var VideoTool = {
        init:function(){
            $(document.body).on("click",".video_box",function(e){
                var src = $(this).data("src");
                VideoTool.playVideo(src);
                e.preventDefault();
                return false;
            }).on("click",".js-hideVideo",function(e){
                VideoTool.hideVideo();
                e.preventDefault();
                return false;
            });
        },
        playVideo:function(src){
            // var img = this.parentNode.getElementsByTagName("img")[0];

            if(!$('.zm-mask').length){
                $('body').css('position','relative').append($('<div class="zm-mask js-hideVideo" style="position:fixed;left:0;top:0;width:100%;height:100%;z-index:10000;background:rgba(0,0,0,.5)"><i class="zm-closeBtn js-hideVideo" style="position:absolute;font-size:45px;right:100px;top:100px;border-radius:50%;border:1px solid #aaa;width:50px;width:50px;text-align:center;line-height:48px;cursor:pointer;color:#aaa;z-index:1000">X</i><div class="container" style="position:absolute;left:0;right:0;top:0;bottom:0;margin:auto;"></div></div>'))
            }
            else{
                $('.zm-mask').show();
            }
            var height = Math.max(400,$(window).innerHeight()-400);
            var width = height*1.6;
            var $container = $('.zm-mask').children('.container');

            $container.css({
                width:width+'px',
                height:height+'px'
            });

            getFlash($container,{
                src:src,
                width:width,
                height:height
            },{},{allowFullScreen:true});
        },
        hideVideo:function (){
            var $mask =  $('.zm-mask');
            var $container = $mask.children('.container');
            $mask.hide();
            if(!!$container.length)
                $container.empty();
        }
    }


    function domEvents(){
        VideoTool.init();
        sitebarSwitch();
        bannerSwitch();
        logoSwitch();
        numberSwitch();
        toolSwitch();
        expertSwitch();
        videoSwitch();
        
        $(".g-register").on("click","a",function(){
            $("#reg_link").trigger("click");
        });


        $(".js-gaokaoTools").on("click",".details-list li",function(e){
            var href = $(e.target).closest("li").find("a").attr("href");
            if(href&&href.indexOf('javascript')==-1){
                window.location.href = href;    
            }else{
                var tip = $("#tipfortool");
                var mask = $("#layer-mask");

                tip.find(".close,#pin_bnt_ok").on("click",function(){
                    tip.hide();
                    mask.addClass("hide");
                    pin.cancelAll(event);
                });

                mask.removeClass("hide");
                tip.show();
                e.preventDefault();
                return false;
            }
            
        });
    }


    return {
        init:function(){
            //邀请注册,long long ago 的功能，考虑删除
            var invite = getCfg('invite');
            if(invite){
                ipinAuth.regBox();
            }

            showScoreUi();
            domEvents();


            headjs.init();
        }
    }

});
