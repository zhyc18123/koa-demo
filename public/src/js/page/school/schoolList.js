define(['jquery','pin','ui/ux','request','page/head'],function($,pin,ux,Req,headjs){
    var getCfg = pin.getCfg;
    var PageData = $.extend({},window.PageData);

    var ept =  {
        json:PageData,
        jq:$,
        init:function(){
            this.getViewBefore();
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
            this.initEvent();
            this.searchInput();
            this.searchBtn();
            var that = this;
            if(this.json.params.page == 1){
                this.jq(".more a").cssDisplay( this.jq('table tbody tr').length >= 20 );
            }
            this.jq(".more a").unbind("click");
            this.jq('.more a').click(function(){
                that.json.params.page = ++that.json.params.page
                that.reload(true);
                return false;
            });
        },
        initEvent:function(){
            var that= this;
            if(this.json.params.page == 1){
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
                        that.json.params[$(this).attr('id')]=val[0];
                        if( $(this).attr('id') == "diploma"){
                            that.json.params['major_second_category_filter'] = ''
                            that.json.params['major_filter'] = ''
                        }
                        that.json.params.page=1;
                        that.reload(false);
                    }
                });
                this.jq(".base-form .select-node [id]").each(function(){
                    var el = $(this);
                    var obj = pin.use("select",{
                        view:el[0],
                        cssNode:el.parent(),
                        hoverClass:"input-hover",
                        multiple:false,
                        nullTxt:'全部',
                        maxCol:7,
                        onchange:function(val){
                            var strId = $(el).attr('id');
                            if( strId == "major_second_category_filter"){
                                that.json.params["major_filter"] = ''
                            }
                            that.json.params[$(el).attr('id')]=val
                            that.json.params.page=1;
                            that.reload(false);
                        }
                    })
                    obj.getView();
                    obj.val(obj.val());
                });
            }

            if(window._bd_share_main){
                window._bd_share_main.init();
            }
            window.getShare = function(cmd,config){};
            pin.util.share({
                "common":{
                    "bdSnsKey":{},
                },
                "share":[{
                    'bdUrl':getCfg('bdUrl')||location.href,
                    "bdText":getCfg('text'),
                    "bdPic":getCfg('bdPic')
                },{
                    "tag":"invite-share",
                    'onBeforeClick':function(cmd,config){ return window.getShare(cmd,config);}
                }]
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
                    that.json.params.sch_name_pattern = val;
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
                that.json.params.sch_name_pattern = val;
                that.json.params.page=1;
                that.reload(false);
            });
        },
        reload:function(isMore){
            var pipeId = this.id;

            // 如果是专科就用薪酬排行
            if (this.json.params.diploma == '5') {
                this.json.params.sort_by = 'xinchou'
            } else {
                this.json.params.sort_by = 'zonghe'
            }
            var that = this;
            Req.getSchList(this.json.params,function(root){
                if(isMore){
                    $('#tbody').append($(root.data.htmlStr).find("#tbody").html());
                }else{
                    $('.rank').html(root.data.htmlStr);
                    that.init();
                }
                if(root.data.hasMore){
                    $('.more').show();
                }else{
                    $('.more').hide();
                }
            });

        }
    }

    return ept;
});
