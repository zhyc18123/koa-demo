define(['jquery','pin','request','page/head','common/common'],function($,pin,Req,headjs) {
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);

    var ept = {
        jq:$,
        json:PageData,
    	init:function(){
            headjs.init();
    		if(!this.json.isLogin){
    			ipinAuth&&ipinAuth.loginBox(location.href);
                return;
    		}

            this.initzybParams();
			this.initEvent();

    	},
        initzybParams:function(){

            var zybInfo = this.json.zybInfo;
            var params = {};
            this.zybParams = params;

            params.name = zybInfo.title;
            params.zyb_id = zybInfo.zyb_id;
            params.title = zybInfo.title;
            params.remarks = zybInfo.remarks;
            params.batch_list = zybInfo.batch_list;


            var batch = zybInfo.batch_list;
            for(var b in batch){
                var group = batch[b].group_list;
                for(var g in group){
                    var sch = group[g].zy_list;
                    var new_sch = [];
                    for(var s in sch){
                        var major = sch[s].major_list;
                        var new_major = [];
                        for(var m in major){
                            new_major.push(major[m].major_id)
                        }
                        new_sch.push({
                            sch_id:sch[s].sch_id,
                            adjust:sch[s].adjust,
                            major_list:new_major
                        });
                    }
                    group[g].zy_list = new_sch;
                }
            }
        },
        initEvent:function(){
            var self = this;
            //修改志愿表
            // self.jq(".js-modify-condition").on("click",function(){
            //     self.jq("#editbespoke,layer").removeClass("hide");
            // }).on("click",".js-y",function(){
            //     var zybid = self.jq("#zyb_switch").data("zybid");
            //     window.location.href="/zhiyuan/bespoke/"+zybid;

            //     self.jq("#editbespoke,layer").addClass("hide");
            // }).on("click",".js-n",function(){
            //     self.jq("#editbespoke,layer").addClass("hide");
            // });

            self.jq(".vol-detail-tt").on("click",function(){
                var target = self.jq(this);
                target.siblings(".vol-detail-list").slideToggle();
                target.find('.fr span').toggleClass("ipin-ico-up ipin-ico-down");
            });

            self.jq("#zyb_del_btn").on("click",function(){
                self.popmsg("",function(){

                    self.zybDel()
                    $("#popup-msg").addClass("hide");
                },function(){
                    $("#popup-msg").addClass("hide");
                })

            });

            self.jq(".edit-zyb").on("click",function(){
                self.jq(".f-hd,.volunteer-box").addClass("modify")
            });

            self.jq(".js-saveWish").on("click",function(){
                self.zybEdit();
            });

            self.jq(".download-file").on("click",function(){
                self.zybDownload();
            });


            self.jq(".vol-direction").on("click",".ipin-ico-uparrow",function(){
                var target = self.jq(this);
                var schSheet = target.closest(".vol-school-list");
                // var schName = schSheet.find(".vol-school-name h3").text();
                var schIndex = schSheet.data("schindex");
                if(schIndex==0){
                    return;
                }


                var gIndex = target.closest(".vol-school").data("gindex");
                var bIndex = target.closest(".vol-detail").data("bindex");
                var sibSch = schSheet.prev();

                self.changeIndex(bIndex,gIndex,schIndex,"up",function(){
                    schSheet.data("schindex",schIndex-1);
                    sibSch.data("schindex",schIndex);
                    var temp = schSheet.find('.vol-school-num').text();
                    schSheet.find('.vol-school-num').text(sibSch.find('.vol-school-num').text());
                    sibSch.find('.vol-school-num').text(temp);
                    schSheet.after(sibSch);
                    if(schSheet.prev().length==0){
                        schSheet.find(".ipin-ico-uparrow").addClass("hide");
                        sibSch.find(".ipin-ico-uparrow").removeClass("hide");
                    }
                    if(sibSch.next().length==0){
                        schSheet.find(".ipin-ico-droparrow").removeClass("hide");
                        sibSch.find(".ipin-ico-droparrow").addClass("hide");
                    }
                });

            }).on("click",".ipin-ico-droparrow",function(){
                var target = self.jq(this);
                var schSheet = target.closest(".vol-school-list");
                var sibSch = schSheet.next();
                if(sibSch.length==0){
                    return;
                }

                // var schName = schSheet.find(".vol-school-name h3").text();
                var schIndex = schSheet.data("schindex");
                var gIndex = target.closest(".vol-school").data("gindex");
                var bIndex = target.closest(".vol-detail").data("bindex");
                self.changeIndex(bIndex,gIndex,schIndex,"down",function(){
                    schSheet.data("schindex",schIndex+1);
                    sibSch.data("schindex",schIndex);
                    sibSch.after(schSheet);
                    var temp = schSheet.find('.vol-school-num').text();
                    schSheet.find('.vol-school-num').text(sibSch.find('.vol-school-num').text());
                    sibSch.find('.vol-school-num').text(temp);
                    if(schSheet.next().length==0){
                        schSheet.find(".ipin-ico-droparrow").addClass("hide");
                        sibSch.find(".ipin-ico-droparrow").removeClass("hide");
                    }

                    if(sibSch.prev().length==0){
                        schSheet.find(".ipin-ico-uparrow").removeClass("hide");
                        sibSch.find(".ipin-ico-uparrow").addClass("hide")
                    }

                })

            }).on("click",".ipin-ico-delete",function(){
                var target = self.jq(this);
                var schSheet = target.closest(".vol-school-list");
                var schName = schSheet.find(".vol-school-name h3").text();
                self.popmsg("你确定要把"+schName+"从志愿表中删除吗",function(){
                    var schIndex = target.closest(".vol-school-list").data("schindex");
                    var gIndex = target.closest(".vol-school").data("gindex");
                    var bIndex = target.closest(".vol-detail").data("bindex");
                    self.delSch(bIndex,gIndex,schIndex,function(){
                        var volSchool = schSheet.parent();
                        schSheet.prev().length==0 && schSheet.next().find(".ipin-ico-uparrow").addClass("hide");
                        schSheet.next().length==0 && schSheet.prev().find(".ipin-ico-droparrow").addClass("hide");
                        schSheet.remove();

                        var nums = volSchool.find('.vol-school-num');
                        var Alpha = ['A','B','C','D','E','F','G','H','I','J'];
                        nums.each(function(index, el) {
                            $(this).text(Alpha[index]);
                        });

                        volSchool.children('.vol-school-list').each(function(index, el) {
                            $(this).data("schindex",index)
                        });

                    });

                });

            });

            var alt = $('.alt').length ? $('.alt') : $('<div class="alt"></div>')
            $('body').append(alt.text("提示"));
            var altMinHeight = alt.outerHeight();

            $('.vol-school-major').on('mouseenter', 'a', function(event) {
                var self = $(this);
                alt.text(self.find('p').text()).outerHeight() > altMinHeight && alt.show();
                self.append(alt);
            })
            .on('mouseleave', 'a', function(event) {
                var self = $(this);
                alt.text(self.find('p').text()).hide();
                self.append(alt);
            });

            //popmsg
            $("#popup-msg").on("click",".js-y",function(){
                self.popmsg_yFun();
                $("#popup-msg").addClass("hide");
                $(".layer").addClass("hide");
            }).on("click",".js-n",function(){
                self.popmsg_nFun();
                $("#popup-msg").addClass("hide");
                $(".layer").addClass("hide");
            })

            //selected forbidden
            self.jq(".vol-school-list").on("mousedown",".vol-school-major",function(){
                return false;
            })

            self.jq('.volunteer').css('minHeight',$(window).height()-515)

            var aCss = {
                'position':'absolute',
                'top':'auto'
            }
            var fCss = {
                'position':'fixed',
                'top':0
            }
            $(window).on("scroll",function(){
                var node = self.jq(".volunteer")[0];
                var rect = node.getBoundingClientRect()
                var editbar = self.jq(".js-edit-bar");
                if(rect.top<=0&&editbar.css("position")!="fixed"){
                    editbar.css(fCss);
                }else if(rect.top>0&&editbar.css("position")!="absolute"){
                    editbar.css(aCss);
                }
            });

            //scrollTop按钮的显示和隐藏
            var toTop = $('.page-tool');
            $(window).scroll(function(){
                $(window).scrollTop()>60 ? toTop.show() : toTop.hide();
            });
            toTop.click(function(){
                $('html,body').animate({
                    scrollTop:0
                })
            })


            $(window).scroll();

        },
        popmsg_yFun:function(){
            $("#popup-msg").addClass("hide");
            $(".layer").addClass("hide");
        },
        popmsg_nFun:function(){
            $("#popup-msg").addClass("hide");
            $(".layer").addClass("hide");
        },
        popmsg:function(txt,yFun,nFn){
            var self = this;
            self.popmsg_yFun = yFun||self.popmsg_yFun;
            self.popmsg_nFun = nFn||self.popmsg_nFun;

            var popSheet = $("#popup-msg");
            popSheet.find(".popup-txt").text(txt);
            popSheet.removeClass("hide");
            $(".layer").removeClass("hide");


        },
        zybEdit:function(){
            var self = this;
            var title = self.jq("#zyb_name_edit").val();
            var remarks = self.jq("#zyb_marks_edit").val();
            var zyb_id = self.jq("#zyb_switch").data("zybid");

            var zybParams =this.zybParams;
            if(!title){
                alert("标题不能为空!")
                return;
            }
            else{
                zybParams.name = title;
            }
            zybParams.zyb_id = zyb_id;
            zybParams.remarks = remarks;

            self.zybSave(function(){
                self.jq(".volunteer-box .vol-tt h3").text(title);
                self.jq(".modify").removeClass("modify")
            });
        },
        delSch:function(bIndex,gIndex,schIndex,fn){
            var self = this;
            var data = self.zybParams;
            var schList = data.batch_list[bIndex].group_list[gIndex].zy_list;
            schList.splice(schIndex,1);
            typeof fn =="function" && fn();
            // self.zybSave(fn);
        },
        changeIndex:function(bIndex,gIndex,schIndex,direct,fn){
            var self = this;
            var data = self.zybParams;

            var schList = data.batch_list[bIndex].group_list[gIndex].zy_list;
            var tempSch = schList[schIndex];
            if(direct=='up'){
                if(schIndex==0){
                    return;
                }

                schList[schIndex] = schList[schIndex-1];
                schList[schIndex-1] = tempSch;

            }else if(direct=="down"){
                if(schIndex==schList.length-1){
                     return;
                }else{
                    schList[schIndex] = schList[schIndex+1];
                    schList[schIndex+1] = tempSch;
                }
            }
            typeof fn =="function" && fn();
            // self.zybSave(fn);
        },
        zybSave:function(fn){
            var self = this;
            var jsonStr = JSON.stringify(self.zybParams);
            // console.log(jsonStr)

            Req.zybSave({"zybInfo":jsonStr},fn);
        },
        zybDel:function(){
            var zybid = this.zybParams.zyb_id;

            Req.zybDel({zybid:zybid},function(){
                window.reload()
            });
        },
        zybDownload:function(){
            //神奇地下载文件了,而location.href没变
            window.location.href = "/zhiyuan/download/"+this.zybParams.zyb_id+'/完美志愿_'+this.zybParams.title+".pdf";
        }


    }

    return ept;
});
