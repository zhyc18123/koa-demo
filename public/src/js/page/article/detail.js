define(['jquery','pin','page/head','avalon'],function($,pin,headjs,avalon) {
    var PageData = $.extend({},window.PageData);
    
	var ept = (({

        json:PageData, 
        jq:$, 
        
    	init:function(){
            this.onViewReady();
            headjs.init();
        },

		onViewReady:function(){
			var av = avalon.define({
       			 $id: "root",
        		scrollTop : function() {
        		$('html,body').animate({
        			scrollTop:0
        		})
        		return false;
        		},
        		toTopBtn:"none"
    		})
    		avalon.scan(document.body,[av]);//這是必要的

    		//scrollTop按钮的显示和隐藏
    		$(window).scroll(function(){
				if($(window).scrollTop()>60){
					av.toTopBtn = "block";
				}
				else{
					av.toTopBtn = "none";
				}
			});    

			//分享
			pin.util.share();
		}
	
	}));

	return ept;
});