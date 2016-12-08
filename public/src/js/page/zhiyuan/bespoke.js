
define(["jquery","pin","common/pinData",'page/head','request',"ui/ui","widget/select","widget/userUpgrade"],function($,pin,pinData,headjs,Req,ui,selectUi,UserUpgrade) {
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    var getCfg = function(name){ return PageData[name]}

    var szm = 0;
    var ept = {

    	init:function(){
            headjs.init();

            this.defaultScore = getCfg("myscore");
            if(this.defaultScore.prov=='15'){
                alert("因为内蒙古的志愿填报方式较特殊，暂不支持模拟填报。您可以查询感兴趣的学校和专业。",function(){
                    history.go(-1);
                });
                //return;
            }

            
            this.isLogin = getCfg("isLogin");
            this.isVIP = getCfg("isVip");
            this.cardPrivilege = getCfg("cardPrivilege");

    		if(!this.isLogin){
                this.notLogin();
            }
            if(this.cardPrivilege==3||!this.cardPrivilege){
                this.noPrivilege();
            }

            

            this.scorePane(); 
            this.hasScore = getCfg("hasScore");
			this.locInfo = getCfg("locInfo");
           
            if(getCfg("bespokeData")){
                this.defaultParams = getCfg("bespokeData");
                this.paramsCache = $.extend(true,{},this.defaultParams);
            }else{//empty
                this.defaultParams = $.extend(true,{},this.paramsCache);
            }

            this.initEvent();
            this.renderScore();
            this.renderLoc();
            this.renderMajor();
            this.renderStrategy();
    	},
        noPrivilege:function(){
            var cardPrivilege = getCfg("cardPrivilege")>>0;
            if(cardPrivilege==3){
                UserUpgrade.tip("即可使用智能填志愿");
                
            }else if(!cardPrivilege){
                alert("开通VIP会员即可使用智能填志愿",function(){
                    window.location.href="/buy/product";
                });
            }
            
        },
        notLogin:function(){
            pin.ui.MsgBox.alert("","这是VIP专属功能，请开通VIP后使用。若您已是VIP，<a style='color:#4499dd;cursor:pointer;' onclick='javascript:ipinAuth&&ipinAuth.loginBox(location.href);'>请登录</a>。",function(){
                // ipinAuth&&ipinAuth.loginBox(location.href);

                window.location.href="/buy/product";
            })
        },
        watchParams:function(){
            var self = this;
            var hasData = false;
            var province = this.paramsCache.province;
            var locs = this.paramsCache.locs;
            var dataCount = 0;


            self.locCitySelect();
            if(province.want.length||locs.want.length||$('#locSheet .dec-city').find('li').hasClass('active')){
                $("#locSheet .des-reset").removeClass("hide");
                hasData = true;
                dataCount++;
            }else{
                $("#locSheet .des-reset").addClass("hide");
            }
            var majors = this.paramsCache.majors;
            if(majors.want.length){
                $("#majorSheet .des-reset").removeClass("hide");  
                hasData = true; 
                dataCount++;
            }else{
                $("#majorSheet .des-reset").addClass("hide");   
            }

            if(this.paramsCache.strategy){
                $("#strategySheet .des-reset").removeClass("hide");
                hasData = true;
                dataCount++;
            }else{
                $("#strategySheet .des-reset").addClass("hide");
            }

            if(hasData){
                $(".sys-btn").removeClass("hide");
            }else{
                $(".sys-btn").addClass("hide");
            }
            //^
            if(dataCount!=3){
                $(".desire-btn a").addClass("disabled")
                    .css("background-color","#999");
            }else{
                !self.isVIP ? self.notVip() : $(".desire-btn a").removeClass("disabled")
                    .css("background-color","#ffbf00");
            }
            // console.log(szm++,self.paramsCache)
        },
        avalon:{},
        paramsCache:{
            scoreInfo:{
                "wenli":"li" //default
            },
            province:{
                want:[],
                unwant:[]
            },
            locs:{
                want:[],
                unwant:[]
            },
            majors:{
                want:[],
                unwant:[]
            },
            jobs:{
                want:[],
                unwant:[]
            },
            strategy:''

        },

    	initEvent:function(){
            var self = this;
            //暂时不支持不想选
            $(".dec-nill").css("display","none");
            $(".js-jobMajor .hot-major").eq(1).css("display","none");


      //       //scoreInfo-rank
      //       $(".js-scoreInfo").on("click",".js-ranking-type li",function(){
      //           var target = $(this);
      //           var type = target.data("type");
      //           target.addClass("active").siblings().removeClass("active");
      //           target.parent()
      //               .siblings(".use_"+type).removeClass("hide")
      //               .siblings("div").addClass("hide");
                    
      //       }).on("input","input",function(){//成绩排名
      //           var target = $(this);
      //           var v = $.trim(this.value);
      //           if(!!v && !(/^\d+$/).test(v)){
      //               self.showmsg("请输入数字");
      //               return;
      //           }
      //           self.paramsCache.scoreInfo.scoreType = target.data("type");
      //           console.log(self.paramsCache.scoreInfo.scoreType)
      //           self.paramsCache.scoreInfo.score = v;
      //           self.watchParams();
      //           //^
      //       }).on("click",".des-reset",function(){
      //           self.paramsCache.scoreInfo = $.extend(true,{},self.defaultParams.scoreInfo);
      //           self.watchParams();
      //           self.renderScore();


      //       });
            
      //       //scoreInfo-prov
    		// $(".js-prov-selectbox").on("click",".menu-hd",function(){
      //           $(this).siblings(".menu-bd").toggle();
      //       }).on("click",".menu-bd li",function(){
      //           var target = $(this);
      //           var menu = target.parent().siblings(".menu-hd");
      //           var v = target.data("v");
      //           menu.text(target.text());
      //           menu.data("v",v);
      //           target.parent().hide();
      //           self.paramsCache.scoreInfo.provid = v;
      //           self.watchParams();
      //       });

      //       //scoreInfo-wenli
      //       $(".radio_wrap").on("click",".radio_box",function(){
      //           var target = $(this);
      //           target.addClass("checked").siblings().removeClass("checked");
      //           self.paramsCache.scoreInfo.wenli = $(this).data("v");
      //           self.watchParams();
      //       });

            //zhiyuan-strategy
            $(".js-strategy").on("click","dl a",function(){
                var target = $(this);
                target.addClass("active");
                target.parent().parent().siblings("dl").find("a").removeClass("active");
                self.paramsCache.strategy = target.data("strategy");
                self.watchParams();
                self.toTop($('#strategySheet'));

            }).on("click",".des-reset",function(){
                var sheet = $("#strategySheet");
                var strategy = self.paramsCache.strategy = self.defaultParams.strategy;
                self.watchParams();
                self.renderStrategy()

            });
            //^
            //add item btn
            $(".des-choose").on("click",".dec-think .last-think",function(){
                var target = $(this);
                target.siblings(".flash").removeClass("hide");
                target.closest("dl").siblings("dl").find(".flash").addClass("hide");
                target.closest(".des-choose").data("act",target.data("act"));

                var sheet = target.closest(".des-choose");
                var key = sheet.data("key");
                var want = sheet.data("act");
                self.wantedSwitch(key,want,sheet);
                
            });



            //del item
            $(".dec-think").on("click","li[data-v] span",function(){
                var target = $(this);
                var v = target.parent().data("v");
                var key = target.closest(".des-choose").data("key")||target.closest(".dec-think").data("key");
                var want = target.closest("dl").hasClass(".dec-nill")?"unwant":"want";
                var sheet,li = target.parent();
                if(li.siblings(".flash").length&&!li.siblings(".flash").hasClass("hide")){//editing
                    sheet = li.closest(".des-choose");
                }

                var values = self.paramsCache[key][want];
                for(var i=0;i<values.length;i++){

                    if(values[i]==v){
                        values.splice(i,1);
                        break;
                    }
                }
                self.watchParams();

               
                if(sheet){
                    self.wantedSwitch(key,want,sheet);
                }

                target.parent().remove();
            });



            //clear
            // $(".dec-think .js-clean").on("click",function(){
            //     var target = $(this);
            //     var want = target.closest("dl").hasClass("dec-nill")?"unwant":"want";
            //     var key = target.closest(".dec-think").data("key");
            //     target.siblings("li").remove();
            //     self.paramsCache[key][want] = [];
            //     self.watchParams();
            //     target.closest("dl").find("i").text('').addClass("hide")

            // });

            //checkbox
            $(".desire-box").on("click",".icon-check",function(){
                var target = $(this);
                var sheet = target.closest(".des-choose");
                if(target.parent().hasClass("disabled")){ return; }
                if(sheet.hasClass("js-jobMajor")){
                    if(target.hasClass("ipin-ico-close")){
                        target.removeClass("ipin-ico-close");
                    }else if(target.hasClass("ipin-ico-checked")){
                        target.removeClass("ipin-ico-checked");
                    }else if(target.closest('.hot-major').data("act")=='want'){
                        target.addClass("ipin-ico-checked");
                    }else{
                        target.addClass("ipin-ico-close");
                    }
                    //^
                    self.collectPrams("majors",'',sheet);
                    return;
                }


                //cbox should be selected
                var selectCboxes = function(target,cboxesSelected){
                    cboxesSelected.each(function(i,item){
                        item = $(item);
                        if(!item.parent().hasClass("disabled")){
                            var actionType;
                            if(target.hasClass("ipin-ico-checked")||target.hasClass('icon-choose')){
                                actionType = 'removeClass';
                            }else{
                                actionType = 'addClass';
                            }
                            var v = item.parent().data("v");
                            var cboxSheet;
                            if( !sheet.hasClass(".js-jobMajor")){//由职业推荐专业，可同时选择 yes or no
                                cboxSheet = item.closest(".des-choose-bd"); 
                            }else{
                                cboxSheet = item.closest(".hot-major");
                            }

                            self.cboxCheck(v,actionType,cboxSheet);
                        }
                    });
                }

                if(target.parent().parent().hasClass("unlimited")){//all-checked
                    cboxesSelected = target.closest(".unlimited").siblings().find(".icon-check");
                }else if(target.parent()[0].nodeName=='DT'){//group-checked
                    cboxesSelected = target.parent().siblings("dd").find(".icon-check");
                }else{//single-checked
                    cboxesSelected = target;
                }
                selectCboxes(target,cboxesSelected);


                self.groupCboxCheck(target);
                self.allCheck(target);

                
                //update params
                var key = sheet.data("key");
                var want;
                if(!sheet.hasClass(".js-jobMajor")){
                    want = sheet.data("act");                    
                }else{
                    want = target.closest(".hot-major").data("act");
                }
               
                self.collectPrams(key,want,sheet);

                var resultSheet = sheet.find(".dec-think");
                self.renderSelectedItems(key,want,sheet,resultSheet);

                
            })
            .on('click','.click-text',function(){
                $(this).siblings('.icon-check').click();
            });

            //locSheet
            $(".js-locSheet").on("click",".dec-city li[data-v]",function(){
                var target = $(this);
                
                if(target.hasClass("active")){//remove
                    target.removeClass("active");
                    var v = target.data("v");
                    var locsWant = self.paramsCache.locs.want;
                    for(var i=0;i<locsWant.length;i++){
                        if(locsWant[i]==v){
                            locsWant.splice(i,1);
                            break;
                        }
                    }

                    var provinceWant = self.paramsCache.province.want;
                    for(var i=0;i<provinceWant.length;i++){
                        if(provinceWant[i]==v){
                            provinceWant.splice(i,1);
                            break;
                        }
                    }
                }else{//add
                    target.addClass("active").siblings("li").removeClass("active");

                    
                }
                self.watchParams();
                self.renderLoc();

            }).on("click",".js-locGroup-show",function(){
                var sheet = $(".js-locGroup");
                $('#locSheet .dec-city li:first').removeClass('active');
                if(sheet.hasClass("hide")){
                    sheet.removeClass("hide")
                    .siblings(".dec-think").addClass("hide");

                    self.renderSelectedItems("locs","",sheet,sheet.find(".dec-think"));
                    sheet.find(".dec-think dl").eq(0).find(".last-think").trigger("click");

                }
                else{
                    sheet.addClass("hide");
                    var decThink = sheet.siblings(".dec-think");
                    decThink.find('.last-think').siblings('li').length!=0 && decThink.removeClass("hide");
                }
                

            }).on("click",".des-choose-btn a",function(){
                var locs = self.paramsCache.locs;
                if(!locs.want.length){
                    self.showmsg("你太着急啦,还没有选择想去的地区呢!");
                    return;
                }
                var sheet = $(this).closest(".des-choose");
                var resultSheet = sheet.siblings(".dec-think");
                self.renderSelectedItems('locs',"",sheet,resultSheet);

                sheet.addClass("hide");
                resultSheet.removeClass("hide");
                self.toTop($('#locSheet'));
                
            }).on("click",".des-reset, .js-clean",function(){
                //$.extend(true,{},self.defaultParams.locs);
                $("#locSheet .dec-city li").removeClass("active");
                self.paramsCache.locs.want = []; 
                self.paramsCache.locs.unwant = [];

                self.paramsCache.province.want = [];
                self.paramsCache.province.unwant = []
                self.watchParams();
                self.renderLoc();
                $("#locSheet").find(".dec-city li").removeClass("active");
            });

            //majorSheet
            $(".js-majorSheet").on("click",".js-choose-type li",function(){
                var target = $(this);
                if(target.hasClass("disabled")){
                    return;
                }

                var type = this.dataset.type;
                var sheet = $(".js-"+type+"Group");

                var type = this.dataset.type;
                var sheet = $(".js-"+type+"Group");
                var key = sheet.data("key");
                


                if(sheet.hasClass("hide")){
                    sheet.removeClass("hide")
                    .siblings(".dec-think,.des-choose").addClass("hide");

                    $(this).siblings().addClass("hide");

                    self.renderSelectedItems(key,"",sheet,sheet.find(".dec-think"));
                    sheet.find(".dec-think dl").eq(0).find(".last-think").trigger("click");
                    
                }else{
                   // sheet.addClass("hide")
                    //.siblings(".dec-think").removeClass("hide");
                }
                
                

            }).on("click",".des-choose-btn a",function(){
                var sheet = $(this).closest(".des-choose");
                // if(sheet.hasClass("js-jobGroup")){
                    var jobs = self.paramsCache.jobs;
                    if(!jobs.want.length){
                        self.showmsg("你太着急啦,还没有选择想从事的职业呢!");
                        return;
                    }
                    self.getMajorFromZhineng(function(){
                        self.renderjob();
                        self.toTop($('#majorSheet'));
                    });

                // }else{
                //     var majors = self.paramsCache.majors;
                //     if(!majors.want.length){
                //         self.showmsg("你太着急啦,还没有选择推荐的专业呢!");
                //         return false;
                //     }
                //     else{
                //         var resultSheet = sheet.siblings(".dec-think");
                //         self.renderSelectedItems('majors',"",sheet,resultSheet);
                        
                //         sheet.addClass("hide");
                //         resultSheet.removeClass("hide");
                //     }
                // }
            }).on("click",".des-reset, .js-clean",function(){
                self.paramsCache.majors = $.extend(true,{},self.defaultParams.majors);
                self.paramsCache.jobs = $.extend(true,{},self.defaultParams.jobs);
                self.watchParams();
                self.renderMajor();
                $("#majorSheet").find(".js-choose-type li").removeClass("hide");
            });


            //reset all
            $(".sys-btn").on("click",function(){
                $(".des-reset").trigger("click");
            });


            //submit
            $(".desire-btn").on("click","a",function(){
                if($(this).hasClass('disabled')){
                    return;
                }
                self.createBespoke()
            });   

    	},

        toTop:function(selector,fn){
            var top = selector.offset().top;
            $('html,body').animate({
                scrollTop: top},
                200, function() {
                typeof fn == "function" && fn();
            });
        },

        wantedSwitch:function(key,want,sheet){//意向肯定与否定的切换
            var self = this;
            var forbiddenItems;
            var curSelectedItems;
            if(want=='want'){
                forbiddenItems  = self.paramsCache[key].unwant;
                curSelectedItems = self.paramsCache[key].want;
            }else{
                forbiddenItems  = self.paramsCache[key].want;
                curSelectedItems = self.paramsCache[key].unwant;
            }


            //先重置
            sheet.find(".des-choose-bd .disabled").removeClass('disabled');
            sheet.find(".des-choose-bd .ipin-ico-checked").removeClass("ipin-ico-checked");
            sheet.find(".des-choose-bd .icon-choose").removeClass("icon-choose");
            

            //禁止选中
            for(var i=0;i<forbiddenItems.length;i++){
                sheet.find('.des-choose-bd [data-v="'+forbiddenItems[i]+'"]')
                    .addClass('disabled')
                    .removeClass('ipin-ico-checked');
            }

            //已经选中
            for(var i=0;i<curSelectedItems.length;i++){
                sheet.find('.des-choose-bd [data-v="'+curSelectedItems[i]+'"] .icon-check').addClass('ipin-ico-checked');
            }

            //group-checked
            sheet.find(".des-choose-bd dl").not(".unlimited").each(function(i,dl){
                var group = $(dl);
                var liCount = group.find("dd li").length;
                var forbiddenCount = group.find("li.disabled").length;
                var checkedCount = group.find(".ipin-ico-checked").length;
                var groupCbox = group.find("dt .icon-check");
                if(liCount==forbiddenCount){
                    groupCbox.parent().addClass('disabled');
                }else if(liCount==checkedCount){
                    groupCbox.addClass('ipin-ico-checked');
                }else if(checkedCount>0){
                    groupCbox.addClass('icon-choose');
                }
            });

            //all-checked
            if(sheet.find(".unlimited").length){
               var checkedCount = sheet.find(".unlimited").siblings("dl").find(".ipin-ico-checked").length;
               var cboxCount = sheet.find(".unlimited").siblings("dl").find(".icon-check").length;
               var allCbox = sheet.find(".unlimited").find(".icon-check");
               if(checkedCount==cboxCount){
                    allCbox.addClass("ipin-ico-checked").removeClass("icon-choose");
               }else if(checkedCount>0){
                    allCbox.addClass("icon-choose").removeClass("ipin-ico-checked");
               }else{
                    allCbox.removeClass("ipin-ico-checked").removeClass("icon-choose");
               }

            }


            self.watchParams();

        },

        cboxCheck:function(v,actionType,cboxSheet){
            var self = this;

            if(v){//同一选项在面板上出现在不同分组
                var item = cboxSheet.find('li[data-v="'+v+'"] .icon-check');
                if(!item.hasClass("disabled")){
                    item[actionType]("ipin-ico-checked");   
                }
                 
            }
        },
        groupCboxCheck:function(target){ //up-flow groupCbox-checked
            var self = this;
            target.closest(".des-choose-bd").find("dl").each(function(i,dl){
                var dl = $(dl);
                var dd = dl.find("dd");
                if(dd.length){
                    var groupCbox = dd.siblings("dt").find(".icon-check");
                    var cboxCount = dd.find(".icon-check").length;
                    var checkedCount = dd.find(".ipin-ico-checked").length;
                    self.upFlowCheck(groupCbox,cboxCount,checkedCount);
                }
            });
        },
        allCheck:function(target){//up-flow allCbox-checked
            var self = this;
            if(target.closest(".des-choose-bd").find(".unlimited").length){
                var allCheckBox = target.closest(".des-choose-bd").find(".unlimited .icon-check");
                var allBoxesCount = allCheckBox.closest("dl").siblings().find(".icon-check").length;
                var allCheckedBoxesCount = allCheckBox.closest("dl").siblings().find(".ipin-ico-checked").length;
                self.upFlowCheck(allCheckBox,allBoxesCount,allCheckedBoxesCount);
            }
        },
        
        upFlowCheck:function(flowBox,allBoxesCount,checkedCount){//up-flow 
            if(allBoxesCount==checkedCount){
                flowBox.addClass("ipin-ico-checked").removeClass("icon-choose");
            }else if(checkedCount>0){
                flowBox.addClass("icon-choose").removeClass("ipin-ico-checked");
            }else{
                flowBox.removeClass("icon-choose").removeClass("ipin-ico-checked");
            }
        },

        collectRecommendMajor:function(sheet){
            var self = this;
            var want = [];
            sheet.find(".ipin-ico-checked").each(function(i,item){
                want.push(item.parentNode.dataset.v);
            });
            var unwant = [];
            sheet.find(".ipin-ico-close").each(function(i,item){
                unwant.push(item.parentNode.dataset.v);
            });

            self.paramsCache.majors.want = want;
            self.paramsCache.majors.unwant = unwant;
            self.watchParams();

        },
        collectPrams:function(key,want,sheet){
            var self = this;
            // if(sheet.hasClass("js-jobMajor")){
            //     self.collectRecommendMajor(sheet);
            //     return;
            // }

            
            var params = [];
            var temp = {};
            sheet.find("li[data-v] .ipin-ico-checked").each(function(i,item){
                var v = item.parentNode.dataset.v;
                if(!temp[v]){
                    temp[v] = true;
                    params.push(v);
                }
            });

            self.paramsCache[key][want] = params;
            self.watchParams();
        },
        renderSelectedItems:function(key,want,sheet,resultSheet){
            var self = this;
            var resultTypes;
            if(!want){
                resultTypes = ['want','unwant'];
            }else{
                resultTypes = [want];
            }

            for(var i=0;i<resultTypes.length;i++){
                var values = self.paramsCache[key][resultTypes[i]];
                var holder;
                if(resultTypes[i]=='want'){
                    holder = resultSheet.find("dl").eq(0);
                }else{
                    holder = resultSheet.find("dl").eq(1);
                }

                holder.find("li").not(".last-think,.flash").remove();
                var itemsHTML = '';
                var itemSheet = sheet.find(".des-choose-bd").not(".dec-think");
                for(var j=0;j<values.length;j++){
                    var txt = itemSheet.find('li[data-v="'+values[j]+'"]').eq(0).text();//可能界面上有重复出现
                    itemsHTML+='<li data-v="'+values[j]+'">'+txt+'<span>×</span></li>';
                }


                holder.find("ul").prepend(itemsHTML);
                holder.find("i").text('已选'+values.length);
                if(values.length){
                    holder.find("i").removeClass("hide");
                }else{
                    holder.find("i").addClass("hide");
                }
                
            }
            self.watchParams();

            
        },

        renderScore:function(){
            // var self = this;
            // var scoreInfo = self.paramsCache.scoreInfo;
            // var sheet = $("#scoreSheet");
            // var scoreType = scoreInfo.scoreType||"fraction";
            // var provid = scoreInfo.provid||this.locInfo.provId.slice(0,2);
            // sheet.find(".js-ranking-type").find('li[data-type="'+scoreType+'"]').trigger("click");
            // sheet.find("input").val('');
            // sheet.find(".use_"+scoreType).find("input").val(scoreInfo.score||'');
            // sheet.find(".menu-bd").find('li[data-v="'+provid+'"]').trigger("click");
            // sheet.find(".radio_wrap").find('a[data-v="'+scoreInfo.wenli+'"]').trigger("click");

        },
        renderLoc:function(){
            var self = this;
            var sheet = $("#locSheet");
            var resultSheet = sheet.children(".dec-think");
            self.renderSelectedItems('locs',"",sheet,resultSheet);
            var locs = self.paramsCache.locs;
            if(locs.want.length==1||locs.want.length==2){
                var locid_1 = locs.want[0];
                var locid_2 = locs.want[1];
                var matchCount = 0;
                sheet.find(".dec-city [data-loctype]").each(function(index,item){
                    var v = $(item).data("v");
                    if(v==locid_1||v==locid_2){
                        matchCount++
                    }
                });
            }

            if(matchCount!=locs.want.length&&(self.paramsCache.locs.want.length||self.paramsCache.locs.unwant.length)){
                resultSheet.removeClass("hide");
            }else{
                resultSheet.addClass("hide");
            }

            resultSheet.siblings(".des-choose").addClass("hide");

            var locItem;
            var localCity = sheet.find(".dec-city li").eq(0).data("v");
            var localProv = sheet.find(".dec-city li").eq(1).data("v");
            for(var i=0;i<self.paramsCache.locs.want.length;i++){
                if(self.paramsCache.locs.want[i]==localCity){
                    locItem = sheet.find('.dec-city li').eq(0);
                }else if(!locItem&&localProv==self.paramsCache.locs.want[i]){
                    locItem = sheet.find('.dec-city li').eq(1);
                }
            }

            locItem&&locItem.addClass("active").siblings("li").removeClass("active");
            
        },

        renderjob:function(){
            var self = this;
            var sheet = $("#majorSheet");
            var resultSheet = sheet.children(".dec-think[data-key=jobs]");
            self.renderSelectedItems('jobs',"",sheet,resultSheet);
            if(self.paramsCache.jobs.want.length||self.paramsCache.majors.unwant.length){
                resultSheet.removeClass("hide");
            }else{
                resultSheet.addClass("hide");
            }
            resultSheet.siblings(".des-choose").addClass("hide");
        },

        renderMajor:function(){
            var self = this;
            var sheet = $("#majorSheet");
            var resultSheet = sheet.children(".dec-think");
            self.renderSelectedItems('majors',"",sheet,resultSheet);
            if(self.paramsCache.majors.want.length||self.paramsCache.majors.unwant.length){
                resultSheet.removeClass("hide");
            }else{
                resultSheet.addClass("hide");
            }
            resultSheet.siblings(".des-choose").addClass("hide");
        },
        renderStrategy:function(){
            var self = this;
            var sheet = $("#strategySheet");
            var strategy = self.paramsCache.strategy;
            sheet.find('dl a').removeClass("active");
            if(strategy){
                sheet.find('dl a[data-strategy="'+strategy+'"]').addClass("active");
            }
        },

        getMajorFromZhineng:function(callback){
            //mobile.get.majors_by_jobcate
            var self = this;
            var jobs = self.paramsCache.jobs;
            var jobsStr = JSON.stringify(jobs);
            Req.getMajorsByZhineng({jobs:jobsStr},function(resp){
                if(resp.data.code=="200"){
                    var majorList = resp.data.majorList;
                    var majors = self.paramsCache.majors;
                    for(var i in majorList){
                        majors.want.push(majorList[i].major_id);
                    }
                    // self.renderMajors(majorList);
                    callback&&callback();
                }
                else{
                    alert(resp.data.msg)
                }
            });

           
        },
        renderMajors:function(majorList){
            var self = this;
            var majorPane = $(".js-jobMajor");
            var wantMajorSheet = majorPane.find(".hot-major:first").find("ul");
            var render = function(data,tpl){
                return tpl.replace(/{{(\w+?)}}/g,function(m,c){
                    return data[c];
                })
            }
            var htmlStr = '';
            var tpl = '<li data-v="{{major_id}}"><span class="icon-check"><i></i></span>{{major_name}}</li>';
            for(var i=0;i<majorList.length;i++){
                htmlStr+=render(majorList[i],tpl);
            }
            wantMajorSheet.html(htmlStr);



            var unwantMajorSheet = majorPane.find(".hot-major:last").find("ul");
            htmlStr = '';
            var untpl = '<li data-v="{{major_id}}"><span class="icon-check ipin-ico-close"><i></i></span>{{major_name}}</li>';
            

        },

        locCitySelect:function(){
            var self = this;
            var myloc = $(".js-locSheet .dec-city li.active");

            if(myloc.length){
                var unloc = myloc.siblings('[data-loctype]')
                unlocid = unloc.data("v");
                mylocid = myloc.data("v");
                
                
                if(!mylocid){//不限
                    self.paramsCache.locs.want = [];
                    self.paramsCache.locs.unwant = [];
                }else{
                    unlocid = (unlocid+'000000000000').slice(0,12);
                    mylocid = (mylocid+'000000000000').slice(0,12);
                    
                    var delidIndex = -1;
                    for(var i=0;i<self.paramsCache.locs.want.length;i++){
                        if(self.paramsCache.locs.want[i]==mylocid){
                            mylocid = "";
                        }else if(self.paramsCache.locs.want[i]==unlocid){
                            delidIndex = i;
                        }
                    }

                    if(mylocid){
                        self.paramsCache.locs.want.push(mylocid);
                    }
                    if(delidIndex>=0){
                        self.paramsCache.locs.want.splice(delidIndex,1);
                    }
                }
            }
        },

        showmsg:function(msg){
            alert(msg);
        },

        validateParams:function(){
            var self = this;
            var params = self.paramsCache;
            var msg = "";
            // var key = ["realScore","scoreRank","ysy_score","zh_score","zx_score","js_score"];
            var noScore = false;
            var score = self.avalon.score;
            if(score.prov == "33"){
                if(!score.ysy_score || !score.zh_score || !score.zx_score || !score.js_score)
                    noScore = true;
            }
            else if(!score.realScore  && !score.scoreRank){
                noScore = true;
            }
            if(noScore){
                msg = "你太着急啦,还没填写成绩或排位呢!";
            }

            if(!params.strategy){
                msg = "你太着急啦,还没选择填报策略呢!";
            }
            msg && self.showmsg(msg);
            return !msg;

        },

        createBespoke:function(){
            var self = this;
            self.locCitySelect();
            if(!self.isVIP){
                return;
            }
            if(!self.avalon.validScore(self.avalon.score)){         
                return;
            }
            if(!self.validateParams()){
                return;  
            }
            var params = {};              
            params.bespoke = JSON.stringify(self.paramsCache);
            var paramKeys = ["prov","hasScore","realScore","scoreRank","score","ty","pici"];
            if(self.avalon.score.prov=='32'){
                paramKeys = paramKeys.concat(["req_course","opt_course","req_level","opt_level"]);
            }else if(self.avalon.score.prov=='33'){
                paramKeys = paramKeys.concat(["ysy_score","zh_score","zx_score","js_score"]);

            }
            for(var i=0;i<paramKeys.length;i++){
                params[paramKeys[i]] = self.avalon.score[paramKeys[i]];
            }
            params.score_form = "";
            // console.log(params)

            var createFn = function(){
                Req.create_bespoke(params,function(response){
                    if(response.data.zyb_id){
                        // console.log(response)
                        window.location.href="/zhiyuan/wish";
                        // window.open("/zhiyuan/wish",'_blank')
                    }
                    else{
                        alert(response.data.msg)
                    }
                });
            }

            if(self.defaultScore.update_count==1){
                pin.ui.MsgBox.confirm('',"您还有 "+self.defaultScore.update_count+" 次修改成绩的机会,我们将锁定您的成绩，在8月31日之前将不可修改",function(choose){
                    if(choose=='ok'){
                        createFn();
                    }
                });
            }else if(self.defaultScore.update_count<=0){
                pin.ui.MsgBox.confirm('',"您的成绩已经锁定，将按已锁定成绩生成志愿表",function(choose){
                    if(choose=='ok'){
                        createFn();
                    }
                });
            }else{
                createFn();
            }

            

            

            

        },

        

        scorePane:function(){
            var Req = pin.request;
            var select = avalon.ui.select;

            //邀请注册
            var invite = getCfg('invite');
            if(invite){
                ipinAuth.regBox();
            }
     

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
            }else{
                req_courseCfg = jiangsuCourseCfg.req_course[getCfg("ty")];
            }
            
            var myScore = {
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


                //forjaingsu
                ysy_score:getCfg("ysy_score")||"",
                zh_score:getCfg("zh_score")||"",
                zx_score:getCfg("zx_score")||"",
                js_score:getCfg("js_score")||""
            }

            this.paramsCache.scoreInfo = myScore;
             
            var old_prov = myScore.prov;
            var old_ty = myScore.ty;

            //old code for diff score pane
           /* $("*[dt='score_diff']").show();
            $("*[dt='score_rank']").hide();*/



        /*    var scoreUI = avalon.define({
                $id:"score"
            });
        */
            var root = avalon.define({
                $id:"root",
                provShow:true,
                piciArr:[],
                
                
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
                },
                changewl:function(t,e){
                    root.score.ty = t;

                    root.score.req_courseCfg = jiangsuCourseCfg.req_course[t];
                    root.score.req_course = root.score.req_courseCfg.value;

                    //console.log(' root.score.req_course>>>', root.score.req_course,root.score.opt_course)
                    pin.cancelDefault(e);
                },
                

                show: function (){
                    console.log('show~~~~')
                },
                isPopShow: {pop1: false, pop2:false, pop3: false},
                showPop: function (idx, e){
                    e&&e.preventDefault()
                    for (var key in root.isPopShow) {
                        if (root.isPopShow.hasOwnProperty(key)) {
                            root.isPopShow[key] = (key.replace('pop','') == idx)
                        }
                    }
                },

                
                validScore:function(rootscore){
                    //provid:上海 31, 江苏 32, 浙江 33 ,海南 46
                    var myScore = rootscore.$model;
                    var provid = myScore.prov.slice(0,2);
                    var msg = '';
                    
                    if(myScore.realScore<=0&&myScore.scoreRank<=0&&provid!=33){
                        msg = '请输入您的成绩'
                    }else if(provid==33){
                        if(myScore.ysy_score>=450){
                            msg = '您输入的【语数英】成绩已超过满分，请重新输入'
                        }else if(myScore.zh_score>=450){
                            msg = '您输入的【综合】成绩已超过满分，请重新输入'
                        }else if(myScore.zx_score>=60){
                            msg = '您输入的【自选】成绩已超过满分，请重新输入'
                        }else if(myScore.js_score>=100){
                            msg = '您输入的【技术】成绩已超过满分，请重新输入'
                        }
                        
                    }else if(provid==46&&myScore.realScore>=900){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if(provid==31&&myScore.realScore>=630){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if(provid==32&&myScore.realScore>=480){
                        msg = '您输入的成绩已超过满分，请重新输入'
                    }else if($.inArray(provid*1,[31,32,33,46])==-1&&myScore.realScore>=750){
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
                                alert(r.data.msg);
                            }else{
                                console.log(r.data.data)
                                var batch = r.data.data.myscore.pici;
                                // location.href="/zhiyuan?batch="+batch;
                            }
                            
                        });
                    }


                    if( old_ty!= root.score.ty || old_prov != root.score.prov){
                        pin.ui.MsgBox.confirm('温馨提示','修改地区或者科目会丢失已保存的志愿方案',function(choose){
                            if(choose=='ok'){
                                saveFn();
                            }
                        });
                    }else{
                        saveFn();
                    }



                    pin.cancelAll(e);
                },


                fcousText:function(e){
                    $(".distb_box input").focus();
                },

                toolLink:function(e){
                    var href = $(e.target).closest("li").find("a").attr("href");
                    if(href){
                        window.location.href = href;    
                    }else{
                        var tip = $("#tipfortool");
                        var mask = $(".mask");

                        tip.find(".close,#pin_bnt_ok").on("click",function(){
                            tip.hide();
                            mask.hide();
                            pin.cancelAll(event);
                        });

                        mask.show();
                        tip.show();
                        pin.cancelAll(event);
                    }
                    

                },

                //  下面是翻页部分
                m1:0,
                m2:0,
                m3:0,
                page1:1,
                page2:1,
                page3:1,
                $totalpage:[11,3,8],
                prev:function(e){
                    var idx = +avalon(this).data("idx");
                    if(root["page"+idx]>1){
                        root["page"+idx]--;
                        root["m"+idx] += 320;
                    }
                    pin.cancelAll(e);
                },
                next:function(e){
                    var idx = +avalon(this).data("idx");
                    if(root["page"+idx] < root.$totalpage[idx-1]){
                        root["page"+idx]++;
                        root["m"+idx] -= 320;
                    }
                    pin.cancelAll(e);
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

            this.avalon = root;



            avalon.scan(document.body,[root]);

            pin.on('pageStart',function(){
                var curIndex = 0;
                var time = 800;
                var slideTime = 4000;
                var tid = setInterval(autoSlide, slideTime);

                $("#banner_ctr>a").click(function () {
                    show($(this).index());
                    window.clearInterval(tid);
                    tid = setInterval(autoSlide, slideTime);
                });
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
            })
        }
        

    };

    

    return ept;
            
});
