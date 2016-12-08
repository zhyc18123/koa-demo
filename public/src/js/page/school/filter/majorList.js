define(["jquery","pin",'request','page/head'],function($,pin,Req,headjs){

    var Util = pin.util;
    var PageData = $.extend({},window.PageData);
    pin.cfg = PageData;
    // pin.reg("school/filter/majorList",Util.create(pin.getCls("defaultView"),{
    
    var ept = (({

        json:PageData, 
        jq:$, 
        
        init:function(){
            this.onViewReady();
            headjs.init();
        },

        getViewBefore:function(){
            if(this.json.params.page!=1){
                this.getView = $.noop;
                var nowtr = this.jq("table tbody tr");
                $("#"+this.id+" table tbody").append(nowtr);
                $('.more a').cssDisplay(nowtr.length == 20);
                this.view = $("#"+this.id);
            } else {
                $('.more a').cssDisplay(1);
            }
        },
        onViewReady:function(){
            // pin.fire("resizeFoot");
            this.initEvent();
            this.searchInput();
            this.searchBtn();
            var that = this;
            if(this.json.params.page == 1){
                this.jq(".more a").cssDisplay( this.jq('table tbody tr').length >= 20 );
            }
            this.jq(".more a").unbind("click");
            this.jq('.more a').click(function(){
                that.json.params.page++;
                that.reload(true);
                return false;
            });
        },
        initEvent:function(){
            var that= this;
            this.jq(".base-form .bd").unbind("click");
                this.jq(".base-form .bd").click(function(e){
                    var target = $(e.target);
                    var type = $(this).attr('type');

                    if(target.hasClass('tag')){
                        var val = [];
                        target.checkClass('tag-hover',!target.hasClass('tag-hover'));
                        if(target.attr('all')){
                            if(target.hasClass('tag-hover')){
                                target.closest('.bd').find('.tag-hover').removeClass('tag-hover');
                                target.addClass('tag-hover');
                            } else {
                                target.addClass('tag-hover');
                                return;
                            }
                            val = [];
                        } else {
                            if( type == 'radio' ){
                                if( !target.hasClass('tag-hover') ){
                                    target.addClass('tag-hover');
                                    //当前已经选中;
                                    return;
                                }
                                $(this).find('.tag').removeClass('tag-hover');
                                target.addClass('tag-hover');
                            }
                            target.closest('.bd').find('[all]').removeClass('tag-hover');
                            $(this).find('.tag-hover').each(function(){
                                var v = $(this).attr('value');
                                if(v){
                                    val.push(v);
                                } else {
                                    val.push($(this).text())
                                }
                            });
                        }
                        that.json.params[$(this).attr('id')] = val.length ? val[0].trim() : '';
                        if( $(this).attr('id') == "diploma"){
                            that.json.params['major_category'] = []
                        }
                        that.json.params.page=1;
                        that.reload(false);
                    }
                });
        },
        searchInput:function(){
            var el = this.jq('#searchInput');
            var that = this;
            /*var v = el.val() || '输入具体学校名称';
            el.focusText('hover',v,el.parent());*/
            el.keydown(function(e){
                if(e.keyCode == 13){
                    var val = $.trim($(this).val());
                    that.json.params.searchKey = val;
                    that.json.params.page=1;
                    that.reload(false);
                }
            });
        },
        searchBtn:function(){
            var el = this.jq('#searchBtn');
            var that = this;
            el.click(function(e){                
                var val = $.trim(that.jq('#searchInput').val());
                that.json.params.searchKey = val;
                that.json.params.page=1;
                that.reload(false);
            });
        },

        reload:function(isMore){

            Req.getMajorList(this.json.params,function(rootData){

                var htmlStr = rootData.data.htmlStr;

                var tbodyStr = $(rootData.data.htmlStr).find("#tbody").html();

                if(isMore){
                    $('#tbody').append(tbodyStr);
                }else{
                    $('.rank').html(htmlStr);
                }

                if(rootData.data.hasMore){
                    $('.more').show();
                }else{
                    $('.more').hide();
                }
            })
        }
    }));

    return ept;
});
