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
			$('.tag').on('click',function(e){
				var target = $(e.target);
				var value = target.attr('value').replace('/',"_");

				that.json.params[$(target).parent().attr('id')] = value;
				that.reload();
			});
		},
		reload:function(){
			var that = this;
			that.json.params.page = 0;
			Req.getExamList(this.json.params,function(root){
				$('#newContent').html(root.data.htmlStr);
				that.initEvent();
			});
		}
	}

	return ept;
});