define(["jquery","pin","common/pinData","page/head",'request',"ui/tpl","widget/score","widget/select",'common/common'],
    function($,pin,pinData,headjs,Req,TPL,scoreUi) {
    var Util = pin.util;
    var isVip = pin.getCfg("isVip");
    var myscore = pin.getCfg('myscore');

    var ept = {
        score:null,
    	init:function(){
            headjs.init();
    		this.initEvent();
    		this.initSearchEvent();

            function notVip(){
                /*pin.ui.MsgBox.alert("","开通VIP会员即可使用录取概率预测",function(){
                    window.location.href="/buy/product";
                })*/

                $("#layer-mask").removeClass("hide")
                $(".pop-enroll").removeClass("hide");
                $(".pop-enroll .pop-close").on("click",function(){
                    window.location.href="/buy/product";
                });
            }

            
            if(!isVip){
                notVip();
            }
    	},
    	initEvent:function(){
    		var self = this;
    		self.showScore = scoreUi(myscore,function(_score){
    			self.score = _score;
    			var myscore = (_score.prov+"" == "33")? (_score.ysy_score>>0) + (_score.js_score>>0) + (_score.zh_score>>0) +(_score.zx_score>>0) : _score.realScore;
    			var that = $(this);
    			var showScore = $('.por-score');
    			var scorPane = $('.win-pop .posway');
                var text = "";
                if (!_score.hasScore) {
                    text = "<span style='color:#828282;'>"+scorPane.find('.clearfix .dropdown .menu-hd:first').text().slice(2)+scorPane.find('.radio_wrap .checked').text()+"考生</span><span>第"+_score.scoreRank+"名</span>"
                }else {
                    text = "<span style='color:#828282;'>"+scorPane.find('.clearfix .dropdown .menu-hd:first').text().slice(2)+scorPane.find('.radio_wrap .checked').text()+"考生</span><span>"+myscore+"分</span>"
                }
    			showScore.find('.result-score .fl').html(text);
    			showScore.find('.result-score').show();
    			showScore.find('.add').hide();
    			self.permit();
    			self.showScore.display=false;
            });

            $('.pro-box').on('click', '.pro-list .addbtn,.pro-list .modify', function(event) {
    			self.showScore.display=true;
            });
    		if (myscore.hasScore || myscore.infoType) {
                self.score = myscore;
            }
    	},

    	$searchBox: $('.por-score .inschool'),
        $searchBtn: $(".por-score .icon-search"),
        $dropList: $(".por-score .dropdown-box"),

        initSearchEvent:function(){
            var self = this;

            //autocomplete
            self.$searchBox.on("blur",function(){
                setTimeout(function(){
                    self.hideDropList();
                }, 300);
            }).on("focus",function(){
                if(!!self.$dropList.children().length){
                    self.showDropList();
                }
                else{
                    var val = $.trim(self.$searchBox.val());
                    self.autoSearch(val,"all", function(data){
                        self.showResult(data)
                    });
                }
            }).keyup(function(e){
                var val = $.trim(self.$searchBox.val());
                if(e.key =="Enter" || e.keyCode==13){
                    var link = self.$dropList.find('li.hover a');
                    link.length && self.fillInput(self.$dropList.find('.hover span'));
                }
                else if(e.key =="ArrowDown" || e.keyCode==40){
                    var list = self.$dropList.find('li');
                    var highlighter = self.$dropList.find('li.hover');
                    var nextItem = !highlighter ? self.$dropList.find('li').eq(0):list.eq(list.index(highlighter)+1);
                    self.highlightItem(nextItem,'hover');
                }
                else if(e.key =="ArrowUp" || e.keyCode==38){
                    var list = self.$dropList.find('li');
                    var highlighter = self.$dropList.find('li.hover');
                    var previousItem = !highlighter ? self.$dropList.find('li').eq(0):list.eq(list.index(highlighter)-1);
                    self.highlightItem(previousItem,'hover');
                }
                else{
                    self.autoSearch(val,"all", function(data){
                        self.showResult(data)
                    });
                }
                self.permit();

            });

            //hightlight
            self.$dropList.on("mouseenter","li",function(){
                self.highlightItem($(this),'hover');
            })
            .on('click', 'li', function(event) {
                self.fillInput(self.$dropList.find('.hover span'));
                self.permit();
            });;

            self.$searchBtn.on('click',function(){
                self.fillInput(self.$dropList.find('.hover span'));
            });


            $('.go-forecast').click(function(event) {
            	self.isSchoolExist() && self.goForecast(function(data){
	            	self.forecastResult(data)
	            });
            });

            $('.pro-result').on('mouseenter', '.tohover', function(event) {
            	$('.float-tips').fadeIn(200);
            })
            .on('mouseleave', '.tohover', function(event) {
            	$('.float-tips').fadeOut(200);
            });

        },

        permit:function(){
        	var self = this;
        	if($('.por-score').find('.result-score').css('display')=="block" && !!self.$searchBox.val()){
				$('.go-forecast').addClass('permit');
				return true;
			}
			else{
				$('.go-forecast').removeClass('permit')
				return false;
			}
        },

        isSchoolExist:function(){
        	var self = this;
        	var schList = self.$dropList.find('span');
        	var match = false;

        	schList.each(function(i, item) {
        		if(schList.eq(i).text()==self.$searchBox.val()){
                    self.score.sch_id = schList.eq(i).data('id');
                    self.score.diploma = schList.eq(i).data('diploma');
	        		match = true;
        		}
        	});
        	!match && alert("你输入的学校不存在喔,请从列表里面选,或者输入学校全称吧")
            return match;
        },

        goSearch:function(searchKey,searchType,url){
            var self = this;
            self.xhr&&self.xhr.abort();

            var url = url || '/api/search/search.do';
            var self = this;
            var searchKey = searchKey||$.trim(self.$searchBox.val());
            var searchType = searchType||$(self.field).data('searchType')||'all';
            if(searchKey.length<2){
                return;
            }
            window.open(url+'?searchType='+searchType+'&searchKey='+searchKey,'_blank');
        },
        goForecast:function(fn){
        	var self = this;
           
        	Req.recruitForcast(self.score,function(resp){
                // console.log(resp)
                if(resp.data.code == "200"&&resp.data.data.code==0){
                	fn(resp.data.data);
                }
                else{
                	alert(resp.data.msg)
                }
            });
        },

        forecastResult:function(data){
        	var self = this;
        	var showScore = $('.por-score').find('.result-score .fl span');
        	var title = "";
            if (!self.score.hasScore) {
                title = showScore.eq(0).text()+'，'+showScore.eq(1).text()+'，推荐报考'+pinData.PICINAME[self.score.pici]+"，报考 <a target='_blank' href='/api/school/"+ self.score.sch_id +".html?diploma="+self.score.diploma+"'><span>"+self.$searchBox.val()+"</span></a>";
            }else {
                title = showScore.eq(0).text()+'，'+showScore.eq(1).text()+'，推荐报考'+pinData.PICINAME[self.score.pici]+"，报考 <a target='_blank' href='/api/school/"+ self.score.sch_id +".html?diploma="+self.score.diploma+"'><span>"+self.$searchBox.val()+"</span></a>";
            }
        	var pro =  "<span class='tohover'>"+self.probailityText(data.safe_ratio)+"<span class='icon-help'></span></span>";
        	var safe_ratio = Math.round(data.safe_ratio*100) > 10 ? Math.min(99,Math.round(data.safe_ratio*100)) + "<span>%</span>" : "<10<span>%</span>";
        	var minScore = data.toudang_score >=0 ? data.toudang_score + "<span>分</span>": "<span>-</span>"
        	var year = data.toudang_year >= 0 ? data.toudang_year+"年录取最低分" : "-";
        	var toSee = "你也可以查看<span>"+self.$searchBox.val()+"</span>及其各专业在"+$('.win-pop .posway').find('.clearfix .dropdown .menu-hd:first').text().slice(2)+"历年的录取平均分、<br>取最低分及招生人数等。<a href='/api/school-score/"+ self.score.sch_id +".html?diploma="+self.score.diploma+"' target='_blank'>立即查看</a>"
            var resultText = self.resultText(data.safe_ratio);
            var showBlock = $('.pro-result');
            self.$searchBox.val('');
        	showBlock.find('.title').html(title);
        	showBlock.find('.pro-details h1').html(pro);
        	showBlock.find('.probabilityFill').html(safe_ratio);
        	showBlock.find('.scoreFill').html(minScore).siblings('p').text(year);
        	showBlock.find('.pro-details-txt').html(toSee);
        	showBlock.find('.float-tips p').html(self.explain(self.probailityText(data.safe_ratio)));
            showBlock.find('.pro-result-txt .txt').html(resultText);
        	$('.pro-fill').hide();
        	showBlock.show();
        },

        fillInput:function(item){
        	var self = this;
        	self.$searchBox.val($.trim(item.text())).data('id',item.data('id'))
        	self.hideDropList();
        	self.permit()
        },

        probailityText:function(probaility){
	        var text = ""
	        probaility = probaility*100
	        if(probaility < 50) {
	            text = "难录取"
	            return text
	        } else if(probaility >= 50 && probaility < 80) {
	            text = "可冲击"
	            return text
	        } else if(probaility >= 80 && probaility < 98) {
	            text = "较稳妥"
	            return text
	        } else {
	            text = "可保底"
	            return text
	        }
	    },

        resultText:function(probaility){
	        var text = ""
	        probaility = probaility*100
	        if(probaility < 50) {
	            text = "根据我们的分析，你与这所学校几乎无缘了 : (<br>但不要气馁，我们已经为你找到了其它更适合你的学校。"
	            return text
	        } else if(probaility >= 50 && probaility < 80) {
	            text = "你报这所学校有风险，报志愿可不是冒险的好时候！<br>我们已经为你准备了很多更稳妥的学校。"
	            return text
	        } else if(probaility >= 80 && probaility < 98) {
	            text = "你填报这所学校是比较稳妥的，但只填报一所不够哦！<br>我们已经为你准备了更多适合你的学校。"
	            return text
	        } else {
	            text = "你上这所学校真是浪费分数啦！每一分都来之不易，切勿浪费！<br>我们已经为你找到了好多一分也不浪费的学校。"
	            return text
	        }
	    },

	    explain:function(text){
	    	var msg = "";
	    	switch (text) {
	    		case "可冲击":
	    			msg = "可冲击解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率在50%-80%时，则为可冲击";
	    			break;
	    		case "较稳妥":
	    			msg = "较稳妥解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率在80%-98%时，则为较稳妥";
	    			break;
	    		case "可保底":
	    			msg = "可保底解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率大于98%时，则为可保底";
	    			break;
	    		case "难录取":
	    			msg = "难录取填报解释：录取概率取决于 您的排名 和 该校的计划招生人数：<br/>• 排名相比平均录取排名越高，录取概率越大<br/>• 该校的计划招生人数越多，录取概率越大<br/>当录取概率小于50%时，则为难录取";
	    			break;
	    		default:
	    			break;
	    	}
	    	return msg;
        },

        showDropList:function(){
            this.$dropList && this.$dropList.show();
        },

        hideDropList:function(){
            this.$dropList && this.$dropList.hide();
        },

        highlightItem:function($item,hightlightClass){
            this.$dropList.find('li').removeClass(hightlightClass);
            $item.addClass(hightlightClass);
        },
        xhr:null,
        autoSearch:function(searchKey,searchType,fn){
            var self = this;
            if(searchKey.length<2){
                return;
            }

            self.xhr&&self.xhr.abort();
            self.xhr = Req.autoSearch({
                searchKey:searchKey,
                searchType:searchType||'sch'
            },function(resp){
                resp.data.code == "200" &&  fn(resp.data.data);
            });

            return self.xhr;
        },

        showResult:function(data){
            var self = this;
            if(!data.sch && !data.major){
                self.hideDropList();
                self.$dropList.html('');
                return;
            }

            var html = TPL.ejs(self.dropListTpl,data)
            self.$dropList.html(html);
            self.showDropList();
        },

        dropListTpl:[
            '<% var result = data.sch.sch_list; if(!!result && result.length){ %>',
            '       <ul>',
            '<%     for(var i=0;i<result.length;i++){ %>',
            '           <li><a href="javascript:;">',
            '           <% var diploma = result[i].school_diploma_id;',
            '            diploma = diploma == "本科" ? 7 : diploma == "专科" ? 5 : diploma;%>',
            '               <span data-id="<%=result[i].school_id%>" data-diploma="<%=diploma%>"><%=result[i].school_name%></span>',
            '           </a></li>',
            '<%     } %>',
            '       </ul>',
            '<%}%>'
        ].join('')

    };

    return ept;

});
