define(['jquery','pin','avalon','request','page/head','common/common'],function($,pin,avalon,Req,headjs) {
	var Req = pin.request;
    var isLogin = pin.getCfg("isLogin");
    var isVip = isLogin&&pin.getCfg("isVip");
    var schCount = pin.getCfg('schCount');
    var majorCount = pin.getCfg('majorCount');
    var zhiyuanCount = pin.getCfg('zhiyuanCount');
	var examCount = pin.getCfg('examCount');
    var positionCount = pin.getCfg('positionCount');

    var root = avalon.define({
        $id:"root",

        favTab:"sch",
        showFavTab:function(tab){
        	root.favTab = tab;
        	root.dataCount = root[tab+'Count'];
 
        },
        dataCount:schCount,
        schCount:schCount,
        majorCount:majorCount,
        zhiyuanCount:zhiyuanCount,
		examCount:examCount,
        positionCount:positionCount,
        removeColle:function (type,sch_id,major_id,diploma,exam_id) {
			var that = this;
			
			$(".layer").show();
			$(".popup").show();

			$(".personal-btn").one('click', '.cancel', function(event) {
				event.preventDefault();
				$(".layer").hide();
				$(".popup").hide();
				$('.personal-btn').unbind("click");
			});

			$(".personal-btn").one('click', '.del', function(event) {
				event.preventDefault();

				if (type == 'sch') {
					if(sch_id){
						Req.removeColle(sch_id,"",diploma,function(r){
							if (r.data.code == "200" && r.data.data.success) {
								root.schCount--;
								root.dataCount = root.schCount;
								$(that).parent().remove();
							}
							else{
								alert("出错啦！刷新下吧，有可能是网络不稳定")
							}
							$(".layer").hide();
							$(".popup").hide();
							$('.personal-btn').unbind("click");
						});
					}
				}else if(type == 'major'){
					if(major_id){
						Req.removeColle("",major_id,diploma,function(r){
							if (r.data.code == "200" && r.data.data.success) {
								root.majorCount--;
								root.dataCount = root.majorCount;
								$(that).parent().remove();
							}
							else{
								alert("出错啦！刷新下吧，有可能是网络不稳定")
							}
							$(".layer").hide();
							$(".popup").hide();
							$('.personal-btn').unbind("click");
						});
					}
				}else if (type == 'sch_major') {
					if(sch_id && major_id) {
						Req.removeColle(sch_id,major_id,diploma,function(r){
							if (r.data.code == "200" && r.data.data.success) {
								root.zhiyuanCount--;
								root.dataCount = root.zhiyuanCount;
								$(that).parent().remove();
							}
							else{
								alert("出错啦！刷新下吧，有可能是网络不稳定")
							}
							$(".layer").hide();
							$(".popup").hide();
							$('.personal-btn').unbind("click");
						});
					}
				}else if (type == 'exam') {
					if(exam_id) {
						Req.removeColleExam(exam_id,function(r){
							if (r.data.code == "200" && r.data.data.code == "0") {
								root.examCount--;
								root.dataCount = root.examCount;
								$(that).parent().remove();
							}
							else{
								alert("出错啦！刷新下吧，有可能是网络不稳定")
							}
							$(".layer").hide();
							$(".popup").hide();
							$('.personal-btn').unbind("click");
						});
					}
				}
			});
        }
    });

    return {
    	init:function(){
    		headjs.init();
    		avalon.scan(document.body);
    	}
    }
})
