define(["jquery","pin","request",'page/head','common/fixBottom',"common/common"],function($,pin,Req,headjs) {
    

    var ept={
        init:function(){
            headjs.init();
            this.initEvent();
        },
        isMe:pin.getCfg('isMe'),
        initEvent:function(){
            var self = this;

            var unresonable = $('.zy_table_box .unreasonable').length;
            var resonable = $('.zy_table_box .unreasonable').length;

            var analyse = unresonable ? '<div class="other_txt">你有 <span class="cf66">'+unresonable+'</span> 组志愿存在 <i class="cha_icon"></i> <span class="cf66">不合理</span>的情况。（详情看下方）</div>'
                                : '<div class="other_txt">恭喜你!你填报的志愿非常<i class="gou_icon"></i><span class="resonable">合理</span>!</div>';

            if(resonable){
                $('.successList_box .js_txt').html(analyse);
            }
            


            var alt = $('.alt').length ? $('.alt') : $('<div class="alt"></div>')
            $('body').append(alt.text("提示"));
            
            var altMinHeight = alt.outerHeight();

            $('.zy_table_box').on('mouseenter', '.major_td', function(event) {
                var self = $(this);
                alt.text(self.children(".td_wrap").text()).outerHeight() > altMinHeight && alt.show();
                self.append(alt);
            })
            .on('mouseleave', '.major_td', function(event) {
                var self = $(this);
                alt.text(self.children(".td_wrap").text()).hide();
                self.append(alt);
            })
            .on('click', '.rs_num', function(event) {
                var self = $(this);
                self.children('.row_icon').length > 0 && self.closest('.td_wrap').toggleClass('show');
            });

            //修改志愿表
            $('.zyb_group').on('click', '.edit_all_btn', function(event) {
                if(!self.isMe){
                    alert("你没有权限")
                    return;
                }
                var $this = $(this);
                var batch = $this.closest('.zyb_group').data("batch");
                var group = $this.closest('.zyb_group').data("group");
                window.location.href="/fill?batch="+batch + "&g_idx=" + group;

            })
            .on('click', '.edit_btn', function(event) {
                if(!self.isMe){
                    alert("你没有权限")
                    return;
                }
                var $this = $(this);
                var batch = $this.closest('.zyb_group').data("batch");
                var group = $this.closest('.zyb_group').data("group");
                var school = $this.data("school");
                window.location.href="/fill?batch="+batch + "&g_idx=" + group +"&sch_idx="+school;
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
        }
    };

   return ept;

});