define(['ux',"pipe/school/school/main.js"],function(){

    var Util = pin.util;

    pin.reg("school/school/majorInfo",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
           this.initEvent();
           if(this.json.fromSchool){
                this.searchInput();
           }
           this.eventGt();
        },
        eventGt:function(){
            var that = this;
            this.jq("#gt").click(function(){
                that.json.types='全部专业(含已停办)';
                that.reload();
                return false;
            });
        },
        initEvent:function(){
            var that = this;
            this.jq(".inline-select").each(function(){
                var k = $(this).attr('id');
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(v){
                        that.json[k]=v;
                        if( k == "province" || k == "ty" && that.json.fromSchool == false){
                            pin.fire('admitEnrollScore',{ key:[k,v]});
                        }
                        that.json['page'] = 1;
                        that.reload();
                    }
                }).getView();
            });

            pin.on('admitMajorInfo',function(e){
                that.json[e.key[0]]=e.key[1];
                that.json['page'] = 1;
                setTimeout(function(){
                    that.reload();    
                },100);                
            },1)

            this.jq('#category').click(function(e){
                var el = $(e.target).closest('li');
                if(el.length){
                    el.find('.icon').toggleClass('checked');
                    var arr = []
                    that.jq('#category .checked').each(function(){
                        arr.push($(this).next().text());
                    });
                    that.json.category = arr;
                    that.json['page'] = 1;
                    that.reload();
                }
            });

            this.jq('.marjor-page .pl').click(function(){
                if( !$(this).hasClass("noHover") ){
                    that.json.page--;
                    that.reload();
                }
            });

            this.jq('.marjor-page .pr').click(function(){
                if( !$(this).hasClass("noHover") ){
                    that.json.page++;
                    that.reload();
                }
            });

            this.jq("table tbody tr").hover(function(){
                $(this).addClass('hover')
            },function(){
                $(this).removeClass('hover')
            });

            var categoryList = this.jq('.category-list');
            var more = this.jq('.more')
            more.click(function(){
                categoryList.stop(true,true)
                if(!that.json.showMore){
                    that.json.showMore = true;
                    categoryList.animate({
                        height:categoryList[0].scrollHeight
                    },function(){
                        more.html('<i class="icon"></i>收起')
                    })
                } else{
                    that.json.showMore = false;
                    categoryList.animate({
                        height:350
                    },function(){
                        more.html('显示更多专业')
                    })
                }
            });
        },
        searchInput:function(){
            var el = this.jq('#searchInput');
            var that = this;
            var v = el.val() || '输入具体专业名称';
            el.focusText('hover',v,el.parent());
            el.keydown(function(e){
                if(e.keyCode == 13){
                    var val = $.trim($(this).val());
                    that.json.searchKey = val;
                    that.reload();
                }
            });
            el.focus(function(){
                if ( $(this).val() == "" && v != '输入具体专业名称'){
                    that.json.searchKey = "";
                    that.reload();
                }
            })
        },
        reload:function(){
            var pipeId = this.id;
            var urlData=$.extend({
                sch_id:pin.getCfg("sch_id"),
                pipeId:this.id
            },this.json);

            //if(this.json.fromSchool && this.json.types =="全部在招专业"){
            //    pipe.loadModel("/school/getSchPageMajorInfo.do",urlData);
            //} else{
                pipe.loadModel("/school/getMajorInfo.do",urlData);
            //}

        }
    }));

},'pipe/school/school/majorInfo.js')