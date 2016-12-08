define(["jquery","pin","avalon","request",'page/head','common/fixBottom',"common/common"],function($,pin,avalon,Req,headjs) {

    var isLogin = pin.getCfg("isLogin");
    var isVip = isLogin&&pin.getCfg("isVip");
	var zybCount = pin.getCfg("zybCount");

    var root = avalon.define({
        $id:"root",

        zybCount:zybCount,
        addBtnState:false,
        showAddBtn:function(e){
			e.stopPropagation();
        	root.addBtnState = !root.addBtnState;
        },
		hideAddBtn:function(e){
			e.stopPropagation();
			if (root.addBtnState) {
				root.addBtnState = !root.addBtnState;
			}
        }


    });
	$(".vol-edit").on('click', '.del-zyb', function(event) {
		var zybid = $(this).data("zyb_id");
		var title = $(this).parent().parent().text();
		var $this = $(this);
		$(".vol-pop h1 b").text(title.split(/\s+/)[1]);
		console.log($(this).parents("li").index());
		$(".layer").show();
		$(".popup").show();
		$(".personal-btn").one('click', '.del', function(event) {
			event.preventDefault();
			if(zybid){
				Req.zybDel({zybid:zybid},function(r){
					if(r.reqData&&r.reqData.zybid){
						$this.parents("li").remove();
						$(".layer").hide();
						$(".popup").hide();
					}
				});
			}
		});
		$(".personal-btn").one('click', '.cancel', function(event) {
			event.preventDefault();
			$(".layer").hide();
			$(".popup").hide();
		});
	});

    
    return {
    	init:function(){
    		headjs.init();
    		avalon.scan(document.body);

    	}
    }
});
