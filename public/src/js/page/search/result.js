define(['jquery','pin','request','ui/ejs','page/head','common/common'],function($,pin,Req,TPL,headjs){

    var Util = pin.util;
    var PageData = $.extend({},window.PageData);

    // pin.reg("search/result",Util.create(pin.getCls("defaultView"),{

    var ept = (({

        json:PageData, 
        jq:$, 
        
        init:function(){
            this.onViewReady();
            headjs.init();
        },

        onViewReady:function(){
            this.initEvent();
            this.params.searchKey = this.json.searchKey;
            this.params.searchType = this.json.searchType;
        },

        filterMenu:$('.filter .filter-item'),
        ajaxContainer:$('#pipe_result .result ul'),
        params:{
            pageSize:10,
            canAjaxMore:true,
            searchKey:'',
            searchType:'',
            pageNum:1,
            city_filter_id:"",
            school_type_filter_id:"",
            school_grade_tag_filter_id:"",
            major_category_filter_id:"",
            major_diploma_filter_id:""
        },
        defaultParams:{},

        initEvent:function(){
            var self = this;

            self.defaultParams = $.extend(true,{},self.params);
            self.initFilterId();

            self.filterMenu.on('click','.item',function(){
                var $this = $(this);
                if($this.hasClass('more')){
                    $this.siblings('div').slideToggle();
                    $this.find('.icon').toggleClass('co ex');
                    var text = $this.find('.icon').hasClass('ex') ? '收起':'展开';
                    $this.find('.name').text(text);
                }
                else{
                    var filterId = $this.closest('.filter-item').data('id');
                    if(!$this.data('id')){
                        if($this.hasClass('hover')){
                            return;
                        }
                        self.highligtMenuItem($this);
                        self.selectAll(filterId,$this.closest('.filter-item'));
                    }
                    else{
                        var str = "";
                        var size = 0;
                        self.highligtMenuItem($this);

                        $this.closest('.filter-item').find('.item').each(function(){
                            if($(this).hasClass('hover')){
                                str += (str.length ? ","+$(this).data('id'):$(this).data('id'));
                                size += (+$(this).find('.rs').text());
                            }
                        })

                        if(str){
                            self.params[filterId] = str;
                            self.params.pageSize = size;
                        }
                        else{
                            self.selectAll(filterId,$this.closest('.filter-item'));
                        }
                    }

                    self.params.pageNum = self.defaultParams.pageNum;
                    self.ajaxLoad(self.params,function(data){
                        self.replaceResult(data);
                    });
                }

            })
            .on('click','.item-hd',function(){

                $(this).siblings('ul').slideToggle();
                $(this).children('.icon').toggleClass('up down');
            })


            $(window).scroll(function(){
                if(self.params.searchType!="all" && self.params.canAjaxMore){
                    var scrollTop = $('body').scrollTop() || $('html').scrollTop();
                    var windowHeight = $(window).height();
                    if(scrollTop + windowHeight >= $('body').height() - 200){
                        self.params.pageNum++;
                        self.ajaxLoad(self.params,function(data){
                            self.appendResult(data);
                        });
                    }
                }
            })

            var minHeight = $(window).height() - $('.head').outerHeight() - $('.new-footer').outerHeight();
            $('.search-main').css('minHeight',minHeight);

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

        },

        initFilterId:function(){
            var self = this;
            self.filterMenu.each(function(){
                var text = $(this).children('.item-hd').text();
                console.log(text)
                switch (text) {
                    case "地区选择":
                        $(this).data('id','city_filter_id');
                        break;
                    case "类型选择":
                        $(this).data('id','school_type_filter_id');
                        break;
                    case "等级选择":
                        $(this).data('id','school_grade_tag_filter_id');
                        break;
                    case "分类选择":
                        $(this).data('id','major_category_filter_id');
                        break;
                    case "学历选择":
                        $(this).data('id','major_diploma_filter_id');
                        break;
                    default:
                        break;
                }
            })

        },

        highligtMenuItem:function(item) {
            var self = this;
            if(!item.data('id')){
                item.closest('.filter-item').find('.item').each(function(){
                    $(this).removeClass('hover').children('.icon').removeClass('checked')
                })
                item.addClass('hover').children('.icon').addClass('checked');
            }
            else{
                item.closest('.filter-item').find('.item').eq(0).removeClass('hover').children('.icon').removeClass('checked');
                item.toggleClass('hover').children('.icon').toggleClass('checked');
            }
        },

        selectAll:function(filterId,filterItem){
            var self = this;
            self.highligtMenuItem(filterItem.find('.item').eq(0));
            self.params[filterId] = "";
            self.params.pageSize = self.defaultParams.pageSize;
            self.params.canAjaxMore = self.defaultParams.canAjaxMore;
        },

        ajaxLoad:function(params,callback){
            var self = this;
            Req.searchMoreResult(params, function (fb) {
                if(fb.data.code == "200"){
                    typeof callback == "function" && callback(fb.data.data);
                    self.params.canAjaxMore = fb.data.data.total_page <= self.params.pageNum ? false : true;
                }
                else{
                    alert(fb.data.msg);
                }
            })
        },

        appendResult:function(data){
            var self = this;
            var tpl = {};
            if(self.params.searchType == 'sch'){
                tpl = self.schTpl;
            }
            else if(self.params.searchType == 'major'){
                tpl = self.majorTpl;
            }
            else if(self.params.searchType == 'sch_major'){
                tpl = self.schMajorTpl;
            }
            var html = TPL.ejs(tpl,data);
            self.ajaxContainer.append(html);
        },

        replaceResult:function(data){
            var self = this;
            var tpl = {};
            if(self.params.searchType == 'sch'){
                tpl = self.schTpl;
            }
            else if(self.params.searchType == 'major'){
                tpl = self.majorTpl;
            }
            else if(self.params.searchType == 'sch_major'){
                tpl = self.schMajorTpl;
            }
            var html = TPL.ejs(tpl,data);
            self.ajaxContainer.html(html);
        },

        schTpl:[
            '<%  var sch = data.sch_list;',
            '    if (sch.length > 0) {',
            '    for(var i = 0,len = sch.length; i < len; ++i){',
            '%>',
            '    <li>',
            '        <a class="company-name"  href="/api/school/<%=sch[i].school_id%>.html?diploma=<%=sch[i].school_diploma_id==7?7:5%>"><%=sch[i].school_name%></a>',
            '        <div class="ind">院校类别：<%=sch[i].school_type_name%></div>',
            '    </li>',
            '<% }} %>'
        ].join(''),

        majorTpl:[
            '<%  var major = data.major_list;',
            '    for(var i = 0,len = major.length; i < len; ++i){',
            '%>',
            '    <li>',
            '        <a class="company-name"  href="/api/major/<%=major[i].major_id%>.html?diploma=<%=major[i].major_diploma_id%>"><%=major[i].major_name%></a>',
            '        <div class="ind">专业类别：<%=major[i].major_category_name%><%= major[i].major_diploma_name%></div>',
            '    </li>',
            '<% } %>'
        ].join(''),

        schMajorTpl:[
            '<%  var schMajor = data.schmajor_list;',
            '    for(var i = 0,len = schMajor.length; i < len; ++i){',
            '%>',
            '    <li>',
            '        <a class="company-name"  href="/api/school-major/<%=schMajor[i].school_id%>-<%=schMajor[i].major_id%>.html?diploma=<%=schMajor[i].major_diploma_name=="本科"?7:5%>"><%=schMajor[i].sch_major_name%></a>',
            '        <div class="ind">院校类别：<%=schMajor[i].school_type_name%></div>',
            '    </li>',
            '<% } %>'
        ].join('')


    }));

    return ept;


});
