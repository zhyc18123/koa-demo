define(["jquery","pin",'plugins/loadAuth','request',"ui/tpl","ui/ux","common/common"],function($,pin,LoadAuth,Req,TPL,ui_noop,common) {
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    var Req = pin.request;

    pin.cfg = PageData; // 修复pin.cfg不存在 
    //一般来说  "jquery","pin","ui/ux","common/common" 四个模块都是需要加载的, ux , common 两个模块一般不需要主动调用，可以放在最后
    //define(['jquery','base/jqext.js',"base/base.js" ],function(){ 这三个模块都改为都改为 define(['jquery','pin' ],function($,pin){
    //pin.log 都改为 console.log
    //pin.ux.share  百度分享改为 pin.util.share 
    //pin.reg("head",Util.create(pin.getCls("defaultView"),{
    var ept = (({ // 替代 pin.reg("head",Util.create ... 
        json:PageData, //修复 this.json 不存在,PageData 即后端输出到模板的json数据
        jq:$, //修复 this.jq 不存在,留意 this.jq 在页面某个范围选择元素， $在整个页面选择元素，可能会选到额外多的元素，可能需要修改选择器,这是这次改版很可能出BUG的地方
        init:function(){// 调用本模块后，执行 init 方法,
            //pin.fire("pageStart")  里面的代码都可以封装成函数放到这里调用
            //pin.fire("head",PageData); 这样执行可以触发 pin.reg("head") 注册的事件，但是不再推荐使用
            this.onViewReady();//如果有onViewReady方法，放到这里调用 
        }, 
       
        onViewReady:function(){
            console.log("==headjs onViewReady=======")

            if(!this.json.isVip&&location.host=='vip.wmzy.com'){
                window.location.href="http://www.wmzy.com/account/logout?callback="+encodeURIComponent("http://www.wmzy.com/")
                return;
            }


            pin.cfg.isLogin = this.json.isLogin
            this.jq("#login_link").click(function(){
                ipinAuth.loginBox(location.href);
                return false;
            });
            this.jq("#reg_link").click(function(){
                ipinAuth.regBox();
                return false;
            });
            this.jq("#pwd_link").click(function(){
                ipinAuth.pwdBox();
            });
            this.jq("#logout_link").click(function(){
                window.location.href='/account/logout?callback='+encodeURIComponent(location.protocol+'//'+location.host);
            });

            if(this.json.showSetRole){
                ipinAuth.setRole({});
            }




            this.toolEvent();
            pin.on("needLogin",function(e){//@see pinload chkLogin
                var url = "";
                switch(e.t){
                    case 'zhiyuan':
                        url = "/zhiyuan";
                }
                ipinAuth.regBox(url);
            });
            
            this.initSearchEvent();
           
            if(location.hostname.indexOf('eol')>-1){
                 this.eol();
            }



        },


        mvc:function(){
            return {}
        }, 
        

        toolEvent:function(){
            var timeId = 0;
            this.jq(".user_box").hover(function(){
                $(this).addClass("user_box_show");
                clearTimeout(timeId)
            },function(){
                var that = this;
                timeId = setTimeout(function(){
                    $(that).removeClass("user_box_show");
                },200);
            });
            this.jq(".nav_list .xl_block").hover(function(){
                $(this).addClass("link_block_show")
            },function(){
                $(this).removeClass("link_block_show")
            });
        },
        eol:function(){//http://gkcx.eol.cn
            this.jq(".div_dfz").click(function(){
                $(".df_t").removeClass('hide')
                return false;
            });
            this.jq(".div_dfz_close").click(function(){
                $(".df_t").addClass('hide')
                return false;
            });
            $(document).click(function(){
                $(".df_t").addClass('hide');
            });
            this.jq(".tabs_01").click(function(e) {
                e.stopPropagation();
                if(!$(this).hasClass('tag_01')) {
                    $('.tag_01').removeClass('tag_01');
                    $(this).addClass('tag_01');
                    $(".contenttabs_01").eq($(this).index()).removeClass('hide').siblings().addClass('hide');
                }
            });
            this.jq("#qr").mouseover(function() {
                $(".weixin").show();
            }).mouseout(function() {
                $(".weixin").hide();
            });;
            $(window).scroll(function(){
                var top = $('body').scrollTop() || $('html').scrollTop();
                if(top > 400){
                    $("#bottom_ad_front").hide();
                }else {
                    $("#bottom_ad_front").show();
                }
            });
        },




        $searchBox: $('#searchArea .js-searchBox'),
        $searchBtn: $("#searchArea .js-searchBtn"),
        $dropList: $("#searchArea .js-dropdownBox"),
        // searchURLrl:

        initSearchEvent:function(){
            var self = this;

            //autocomplete
            self.$searchBox.on("blur",function(){
                setTimeout(function(){
                    self.hideDropList();
                    self.$dropList.empty();
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
                    link.length ? window.location.href = link.attr('href'): self.goSearch(val);
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

            });

            //hightlight
            self.$dropList.on("mouseenter","li",function(){
                self.highlightItem($(this),'hover');
            });

            self.$searchBtn.on('click',function(){
                self.goSearch($.trim(self.$searchBox.val()));
            });
        },

        clearSearchKey:function(searchKey){
            searchKey = searchKey.replace(/[<>#$&;,|%*\\\/]/g,'');
            return searchKey;
        },

        goSearch:function(searchKey,searchType,url){
            var self = this;
            self.xhr&&self.xhr.abort();

            var url = url || '/api/search/search.do';
            var self = this;
            var searchKey = searchKey||$.trim(self.$searchBox.val());
            clearSearchKey = self.clearSearchKey(searchKey);
            var searchType = searchType||$(self.field).data('searchType')||'all';
            if(searchKey.length<2){
                return;
            }
            window.open(url+'?searchType='+searchType+'&searchKey='+searchKey,'_blank');
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
            if(searchKey.length==0){
                self.hideDropList();

            }else if(searchKey.length<2){
                return;
            }

            self.xhr&&self.xhr.abort();
            self.xhr = Req.autoSearch({
                searchKey:searchKey,
                searchType:searchType||'all'
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
            '<% var key = data.searchKey;',
            '   function highlight(a){',
            '     return a.replace(new RegExp(key),"<span>"+key+"</span>");',
            '   }%>',
            '<% var result = data.sch.sch_list || []; var len = result.length; if(len){ %>',
            '       <div class="type_item">学校</div><ul>',
            '<%     for(var i=0;i<len;i++){ %>',
            '           <li><a href="/api/school/<%=result[i].school_id%>.html?diploma=<%=result[i].school_diploma_id==7?7:5%>"><%=highlight(result[i].school_name)%></a></li>',
            '<% var sch_major = data.sch_major.schmajor_list || []; var len = sch_major.length; if(len){ %>',
            '<%     for(var j=0;j<len;j++){ %>',
            '<%         if(result[i].school_id == sch_major[j].school_id){ %>',
            '           <li><a href="/api/school-major/<%=sch_major[j].school_id%>-<%=sch_major[j].major_id%>.html?diploma=<%=sch_major[j].major_diploma_name=="本科"?7:5%>">- <%=highlight(sch_major[j].sch_major_name.split(" ")[1])%></a></li>',
            '<%     }}}} %>',
            '       </ul>',
            '<%}%>',
            '<% var result = data.sch_major.schmajor_list || []; var len = result.length; if(len && data.sch.sch_list && !data.sch.sch_list.length){ %>',
            '       <div class="type_item">学校</div><ul>',
            '           <li><a href="/api/school/<%=result[0].school_id%>.html?diploma=<%=result[0].major_diploma_name=="本科"?7:5%>"><%=highlight(result[0].sch_major_name.split(" ")[0])%></a></li>',
            '<%     for(var i=0;i<len;i++){ %>',
            '           <li><a href="/api/school-major/<%=result[i].school_id%>-<%=result[i].major_id%>.html?diploma=<%=result[i].major_diploma_name=="本科"?7:5%>">-<%=highlight(result[i].sch_major_name.split(" ")[1])%></a></li>',
            '<%     } %>',
            '       </ul>',
            '<%}%>',
            '<% var result = data.major.major_list || []; var len = result.length; if(len){ %>',
            '       <div class="type_item">专业</div><ul>',
            '<%     for(var i=0;i<len;i++){ %>',
            '           <li><a href="/api/major/<%=result[i].major_id%>.html?diploma=<%=result[i].major_diploma_id%>"><%=highlight(result[i].major_name)%></a></li>',
            '<%     } %>',
            '       </ul>',
            '<%}%>'
        ].join('')

    }));

    

    return ept;

});
