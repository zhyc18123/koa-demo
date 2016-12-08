define(['jquery','common/scrollFixBar','page/head'],function($,scrollFixBar,headjs) {

    return {
    	isClick:false,

    	init:function(){
        headjs.init();
    		this.faqAnchor();
    		this.scrollEvent();
    		this.toTop();
            scrollFixBar($('.faq .faq-list'));
	    },

      faqAnchor:function(e){
        var that = this;
        $(".faq-list").on("click","a",function(e) {
        that.isClick = true;
            var id = $(this).attr("href").substring(1,this.length);
            var top = $('#'+id).offset().top;
            var $title = $(this);

            $('html,body').animate({
                scrollTop: top},
                200, function() {
                  setTimeout(function(){
                    that.isClick = false;
                  }, 100)
            });
            if($title.hasClass('faq-list-title')){
              if ($title.parent("li").hasClass("active")) {
                  $title.parent("li").removeClass("active");
                  $title.find("i").removeClass("ipin-ico-up2");
              } else {
                that.faqActive($title)
              }
            }
            e.preventDefault();
        });
      },

      faqActive:function($title){
          $(".active").removeClass("active");
          $(".ipin-ico-up2").removeClass("ipin-ico-up2");
          $title.parent("li").addClass("active");
          $title.find("i").addClass("ipin-ico-up2");
      },

      scrollEvent:function(){
        var $title = $('.answer-list');
        var offsetList = [];
        var that = this;
        $title.each(function() {
          offsetList.push($(this).offset().top)
        });
        that.scrollFaqActive(offsetList);

        var poll = null;
        $(window).scroll(function(){
          clearTimeout(poll);
          poll = setTimeout(function(){
            if(!that.isClick) {
              that.scrollFaqActive(offsetList);
            }
          }, 10)
        })
      },

      scrollFaqActive:function(offsetList){
        var that = this;
        var scrollTop = $('body').scrollTop() ? $('body').scrollTop():$('html').scrollTop();

        for(var i = 0, len = offsetList.length; i < len;++i){
          if(scrollTop < offsetList[0]){
            that.faqActive($(".faq-list-title").eq(0));
            break;
          }
          else if(scrollTop < offsetList[i]){
            that.faqActive($(".faq-list-title").eq(i-1));
            break;
          }
              else if(scrollTop > offsetList[len-1]){
                  that.faqActive($(".faq-list-title").eq(len-1));
                  break;
              }
              if(scrollTop + $(window).height() >= $('html').height() - 200){
                  that.faqActive($(".faq-list-title").eq(len-1));
                  break;
              }
        }
      },

      toTop:function(e){
        $('#toTop').click(function(event) {
          $('html,body').animate({
                scrollTop: 0},
                200, function() {
            });
        });
        $(window).scroll(function(){
          var scrollTop = $('body').scrollTop() || $('html').scrollTop();
          if(scrollTop > 100)
            $('#toTop').show();
          else
            $('#toTop').hide();
        })
          $(window).scroll();
      }

    }

    //ept.init();

});
