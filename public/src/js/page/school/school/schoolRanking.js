define(['base','ux'],function(){

    var Util = pin.util;

    pin.reg("school/school/schoolRanking",Util.create(pin.getCls("defaultView"),{
        getViewBefore:function(){
            if(this.json.page!=1){
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
            pin.fire("resizeFoot");
            var that = this;
            this.initEvent();
            if(this.json.page == 1){
                this.jq(".more a").cssDisplay( this.jq('table tbody tr').length >= 20 );
                //this.jq(".out-des").insertBefore('body>.foot');
            } else {
               //this.jq(".out-des").remove(); 
            }
            this.jq(".more a").unbind("click");
            this.jq('.more a').click(function(){
                that.json.page++;
                that.reload();
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
                    that.json[$(this).attr('id')]=val;
                    that.json.page=1;
                    that.reload();
                }
            });
        },
        reload:function(){
            var pipeId = this.id;
            var urlData=$.extend({pipeId:this.id},this.json);
            pipe.loadModel("/school/getschoolRankingPage.do",urlData);
            
        }
    }));

},'pipe/school/school/schoolRanking.js')