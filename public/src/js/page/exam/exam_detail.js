define(['jquery','pin','page/head','request'],function($,pin,headjs,Req){
	var PageData = $.extend({},window.PageData);
	
	var ept = {
		json:PageData,
		init:function(){
			headjs.init();
			this.initEvent();
		},
		initEvent:function(){
			var that = this;
			$('.f-mr80 a').on('click',function(){
				var target = $(this);
				if(!that.json.isLogin){
					$("#login_link").trigger("click")
				}else{
					var exam_id = $('.f-mr80 a').attr('exam-id');
					var tx = $('.f-mr80 p').html();
					var num = tx.substring(tx.indexOf(' ')+1);

					if(target.hasClass('active')){
						Req.removeColleExam(exam_id,function(resp){
							if(resp.data.code == 200){
								target.removeClass('active');
								//alert(num)
								$('.f-mr80 p').html('收藏 '+ --num);
							}
						});
					}else{

						Req.colleExam(exam_id,function(resp){
							if(resp.data.code == 200){
								target.addClass('active')
								//alert(num)
								$('.f-mr80 p').html('已收藏 '+ ++num);
							}
						});
					}


				}			
			});

			$('#download').on('click',function(e){
				if(!that.json.isLogin){
					$("#login_link").trigger("click")
					e.preventDefault();
				}
			});
			
			//分享
			pin.util.share();
		}
	}

	return ept;
});