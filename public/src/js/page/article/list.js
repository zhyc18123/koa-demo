define(function(){ 

    var av = avalon.define({
        $id: "root",
        arr : ["1", '2', "3", "4"],
        selected : ["2", "1"],
        checkAllbool : false,
        scrollTop : function() {
            $('html,body').animate({
                scrollTop:0
            })
            return false;
        },
        toTopBtn:"none"
    })
    avalon.scan(document.body,[av]);//這是必要的

    //scrollTop按钮的显示和隐藏
    $(window).scroll(function(){
        if($(window).scrollTop()>60){
            av.toTopBtn = "block";
        }
        else{
            av.toTopBtn = "none";
        }
    });    

    //百度分享
    pin.ux.share();

    
})