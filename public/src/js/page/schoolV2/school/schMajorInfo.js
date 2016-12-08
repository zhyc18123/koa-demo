define(["jquery","pin",'ui/ux',"page/school/school/main","request","page/head"],function($,pin,ux,main,Req){
    
    //console.log(main);
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);

    var ept = {
        jq:$,
        json:PageData,
        init:function(){
            main.init();
            this.onViewReady();
        },
         onViewReady:function(){
            this.initEvent();
            this.eventGt();
        },
        eventGt:function(){
            var that = this;
            $("#gt").click(function(){
                that.reload();
                return false;
            });
        },
        initEvent:function(){
            var that = this;
            $(".inline-select").each(function(){
                var k = $(this).attr('id');
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(v){
                        that.json.params[k]=v;
                        that.reload();
                        $().triggerHandler('blur');
                        return false;
                    }
                }).getView();
            });

            var $types = $("#types label")
            $types.click(function(e){
                var el = $(e.target);
                if(el[0].tagName == "LABEL" && !el.hasClass("selected")){
                    that.json.params.major_type = $types.index(el)
                    that.reload();
                    return false;
                }
            });

            $('#category').click(function(e){
                var el = that.jq(e.target).closest('li');
                if(el.length){
                    el.find('.icon').toggleClass('checkbox-checked');
                    var arr = []
                    that.jq('#category .checkbox-checked').each(function(){
                        arr.push(that.jq(this).parent().text().trim());
                    });
                    that.json.params.category = arr;
                    that.reload();
                }
            });

            var categoryList = $('.category-list');
            var more = $('.des-bnt')
            var showMore = false
            more.click(function(){
                categoryList.stop(true,true)
                if(!showMore){
                    showMore = true;
                    categoryList.animate({
                        height:categoryList[0].scrollHeight
                    },function(){
                        more.html('收起');
                    })
                } else{
                    showMore = false;
                    categoryList.animate({
                        height:355
                    },function(){
                        more.html('显示更多');
                    })
                }
                return false;
            });
        },
        reload:function(){
            //var urlData=$.extend({
            //    pipeId:this.id
            //}, this.json.params);
            var that = this;
            //pipe.loadModel("/school/getAllMajorInfo",urlData);
            pin.request.getAllMajorInfo(this.json.params,function(root){
                $('#schAllMajorInfo').html(root.data.htmlStr);
                that.init();
            });

        }
    }
    return ept;
})