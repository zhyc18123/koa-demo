define(['jquery'],function($){
	var ga = function(){
		if(!window.ga){ return; }
		window.ga.apply(this,arguments);
	}

	if(location.pathname=="/"){//homepage ga events begin
		//================首页 pageview===============
		//recommend
		$(".form_box .form_btn").on("click",function(){
			ga('send','pageview','/recommenstar');
		});

		//homepage
		$("#banner_img").on("click","li",function(){
			var index = $(this).index();
			ga('send','pageview','/banner/'+(index+1));
		});

		//active
		$(".g-advert").on("click","li",function(){
			var index = $(this).index();
			if(index==0){
				ga('send','pageview','/active/left');
			}else if(index==1){
				ga('send','pageview','/active/right');
			}
		}).on("click",".advert-list p",function(){
			var index = $(this).index();
			ga('send','pageview','/active/'+(index+1));

		});

		//video_box
		$(".side .m-video:first").on("click",".video_box",function(){
			ga('send','pageview','/video/solve');
		});

		$(".side .m-video-box").on("click",".video_box",function(){
			var index = $(this).closest("li").index();
			if(index==0){
				ga('send','pageview','/video/XDF');
			}else if(index==1){
				ga('send','pageview','/video/zhengzhou');
			}else if(index==2){
				ga('send','pageview','/video/recommend');
			}

		});

		//tools
		$(".g-tab").find(".details-list").eq(1).on("click","li",function(){
			var index = $(this).index();
			if(index==0){
				ga('send','pageview','/career');
			}

		});

		//=================首页 ga link=========================
		$(".nav").find("a").each(function(){
		 	var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&top';
			}else{
			  	link = link+'?top';
			}

		   	$(this).attr("href",link);
		});

		$(".g-tab").find("a").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&tool';
			}else{
			  	link = link+'?tool';
			}

		   	$(this).attr("href",link);

		});

		$(".fixed-box").find("a").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&right';
			}else{
			  	link = link+'?right';
			}

		   	$(this).attr("href",link);

		});


		$(".wmzy_wrap .mainc").find(".f-more a[href='/exam/exam_bank']").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&news';
			}else{
			  	link = link+'?news';
			}

		   	$(this).attr("href",link);
		});
		$(".wmzy_wrap .mainc").find(".information .list-btn a").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&news';
			}else{
			  	link = link+'?news';
			}

		   	$(this).attr("href",link);
		});
		$(".wmzy_wrap .mainc").find(".g-tips .tips-btn a").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&news';
			}else{
			  	link = link+'?news';
			}

		   	$(this).attr("href",link);
		});
		$(".wmzy_wrap .mainc").find(".g-title .title-txt a[href='/api/rank/majList']").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&news';
			}else{
			  	link = link+'?news';
			}

		   	$(this).attr("href",link);
		});
		$(".wmzy_wrap .mainc").find(".g-title .title-txt a[href='/api/rank/majList']").each(function(){
			var link = $(this).attr("href");
			if(link.indexOf("javascript")>-1){
				return ;
			}else if(link .indexOf("?")>-1){
			   	link = link+'&news';
			}else{
			  	link = link+'?news';
			}

		   	$(this).attr("href",link);
		});


		$(".new-footer .footer-list:first a[href='/buy/product']").each(function(){
			var link = $(this).attr("href");
			link = link+'&feet';
		   	$(this).attr("href",link);
		});
		$(".side").find(".m-video .side-tt a").each(function(){
			var link = $(this).attr("href");
			link = link.split("#").join('?solve#')
			$(this).attr("href",link);
		});
		$(".side").find(".expert-txt a").each(function(){
			var link = $(this).attr("href");
			link = link.split("#").join('?teacher#')
			$(this).attr("href",link);
		});





		//================首页 ga event===============
		//naviogator
		$(".nav").on("click",".nav-app",function(){
			ga('send', 'event', '首页', 'APP下载', '顶部栏');
		}).on("click","a[href='/exam/exam_bank']",function(){
			ga('send', 'event', '首页', '名校真题', '顶部栏');
		}).on("click","a[href='/api/school']",function(){
			ga('send', 'event', '首页', '院校大全', '顶部栏');
		}).on("click","a[href='/api/school/major']",function(){
			ga('send', 'event', '首页', '专业大全', '顶部栏');
		}).on("click","a[href='/zhiyuan/bespoke']",function(){
			ga('send', 'event', '首页', '智能填报', '顶部栏');
		}).on("click","a[href='/fill']",function(){
			ga('send', 'event', '首页', '手动填报', '顶部栏');
		}).on("click","a[href='/api/score/scoreList']",function(){
			ga('send', 'event', '首页', '批次线', '顶部栏');
		}).on("click","a[href='/tongfen']",function(){
			ga('send', 'event', '首页', '同分考生去向', '顶部栏');
		}).on("click","a[href='/buy/product']",function(){
			ga('send', 'event', '首页', '商品页', '顶部栏');
		}).on("click",".btn-activate-vip a",function(){
			ga('send', 'event', '首页', '激活志愿卡', '顶部栏');
		});

		
		//tools
		$(".g-tab").on("click",".details li",function(){
			var title = $(this).find(".list-txt h3").text().trim();
			if(title){
				ga('send', 'event', '首页', title, '实用工具');
			}
		});

		$(document.body).on("click","#msgdlg_ct a[href='/activity/pingdan/download.html']",function(){
			ga('send', 'event', '首页', '按职业推荐弹窗的下载APP', '实用工具');
		});


		//zixun
		$(".wmzy_wrap .mainc").on("click",".f-more a[href='/exam/exam_bank']",function(){
			ga('send', 'event', '首页', '名校真题', '资讯栏目-名校真题');
		}).on("click",".information .list-btn",function(){
			var link = $(this).find("a").attr("href");
			if(link=="/zhiyuan/bespoke"){
				ga('send', 'event', '首页', '智能填报', '资讯栏目-填报技巧');
			}
		}).on("click",".g-tips .tips-btn",function(){
			var link = $(this).find("a").attr("href");
			if(link=="/api/rank/schList"){
				ga('send', 'event', '首页', '大学就业排行榜', '资讯栏目-院校资讯');
			}else if(link=='/ceping/index.html'){
				ga('send', 'event', '首页', '性格测试', '资讯栏目-专业资讯');
			}
		}).on("click",".g-title .title-txt a",function(){
			var link = $(this).attr("href");
			if(link=='/api/rank/schList'){
				ga('send', 'event', '首页', '大学就业排行榜', '资讯栏目-数据榜单');
			}else if(link=='/api/rank/majList'){
				ga('send', 'event', '首页', '专业就业排行榜', '资讯栏目-数据榜单');
			}

		});


		//side
		$(".side").on("click",".expert-txt a",function(){
			ga('send', 'event', '首页', '商品页', '侧边栏-专家点评');
		}).on("click",".m-video .side-tt a",function(){
			var link = $(this).attr("href");
			if(link=='/buy/product#uservideo'){
				ga('send', 'event', '首页', '商品页', '侧边栏-案例解决');
			}
		});

		//right menu
		$(".fixed-box").on("click",".buy-vip",function(){
			ga('send', 'event', '首页', '商品页', '右侧工具条');
		}).on("click",".app-down",function () {
			ga('send', 'event', '首页', 'APP下载', '右侧工具条');
		});

		//foot
		$(".new-footer .footer-list:first").on("click","li",function(){
			var link = $(this).find("a").attr("href");
			if(link=='/buy/product'){
				ga('send', 'event', '首页', '商品页', '底部栏');
			}
		}).on("click",".btn-activate-vip",function(){
			ga('send', 'event', '首页', '激活志愿卡', '底部栏');
		});





	}//homepage ga events end

	//================product&pay pageview===============
	//product
	if(location.pathname=="/buy/product"){
		$(".pro-int-details .pro-buy-btn").on("click","a",function(){
			ga('send','pageview','/buy/product/openbutton');
		});

		$("#orderBtn").on("click",function(){
			ga('send','pageview','/buy/product/pay');
		});
	}
	

	//pay success
	if(location.pathname=='/buy/success'){
		if($(".succes-ok").length){
			ga('send','pageview','/buy/product/paid');
		}
	}
	


	//================any page: register pageview===============\
	$("#reg_link").on("click",function(){
		ga('send','pageview','/regist');
	});

	/*if(document.cookie.match(/login=\w+/)){
		document.cookie = "login=''";
		ga('send','pageview','/registered'); 
	}*/





});