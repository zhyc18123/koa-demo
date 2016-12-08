define(["jquery","pin","request"],function ($,pin,Req) { //本废弃的模块临时作为公用模块

    var nextPage = function (){//学校、专业 下一项导航
        try{
            console.log('进入下一项 link init')
            var $nav = $('.sch-nav');
            var $list= $nav.find('li');
            var $curr = $nav.find('.selected');
            var idx = $list.index($curr);
            var $next = $('.sch-next');
            if (idx >= $list.length -1) {
                return $next.hide();
            }
            var $nextLink = $list.eq(idx + 1).find('a');
            var nextUrl = $nextLink.attr('href');
            var nextTxt = $nextLink.text();
            $next.attr('href', nextUrl).html('进入下一项: ' + nextTxt + '<i class="icon"></i>');
        }catch(err){}
    }

    return {
        init:function(){
             nextPage();
             this.initEvent();
        },
        initEvent:function(){
             var oA =  $('.line a');
             var sch_id = oA.attr('sch-id');
             var major_id =oA.attr('major-id');
             var diploma =oA.attr('diploma');

             oA.on('click',function(e){
                var cls = oA.attr('class');
                if(cls == "colle"){
                    Req.addColle(sch_id,major_id,diploma,function(r){
                        if(r.isOk()){
                            oA.addClass('colled').removeClass('colle')
                            oA.html('<i class="icon"></i>已收藏');                    
                        }
                    })
                }else if( cls == "colled"){
                    Req.removeColle(sch_id,major_id,diploma,function(r){
                        if(r.isOk()){
                            oA.addClass('colle').removeClass('colled')
                            oA.html('<i class="icon"></i>收藏');
                        }
                    })
                }
            });
        }
    }
    
})