var IndexView = load("controller/indexView");

module.exports = {

    index: function* () {
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ['u', ""]
        ]);

        aid.setBody(yield IndexView.index(aid));
    },

   

    about: function* () {
        var aid = WebAid(this);
        aid.setBody(yield IndexView.about(aid));
    },

   
   

    yunwei:function* (cxt){
        cxt = cxt || this;
        var aid = WebAid(cxt);

        aid.setBody(yield aid.ctx.render("errorPage/yunwei"));
    },

    browser:function* (cxt){
        cxt = cxt || this;
        var aid = WebAid(cxt);

        aid.setBody(yield aid.ctx.render("errorPage/browser"));
    },

    page403:function* (ctx,str){
        ctx = ctx || this; 
        var aid = WebAid(ctx);
        aid.ctx.status = 403;
        
        var root = new Pipe();
        utilPipe.addHeadFoot2(root, aid);
        var htmlStr = yield root.Render(aid, "errorPage/403");
        if(str){
            return htmlStr
        }else{
            aid.setBody(htmlStr);
        }
        
    },

    page404: function* (cxt){
        cxt = cxt || this;
        var aid = WebAid(cxt);
        aid.setBody(yield aid.ctx.render("errorPage/404"));
    },

    page500: function* (cxt){
        cxt = cxt || this;
        var aid = WebAid(cxt);
        aid.setBody(yield aid.ctx.render("errorPage/500"));
    }

}
