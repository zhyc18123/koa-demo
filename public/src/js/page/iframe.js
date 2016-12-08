define(["jquery",'page/head'],function($,headjs) {

    var ept = {
        init:function(){
            
            headjs.init();

            var son = document.getElementById('son') || document.getElementsByTagName('iframe')[0]
            // 同步title
            if (son) {
                son.onload = function() {
                    $('title').text(son.contentDocument.title)
                }
             }
        }
    }

    return ept;
});
