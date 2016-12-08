var AccountView = load('controller/account/accountView')

module.exports = {
    ChkLogin: function* (){
        console.log('====ChkLogin====')
        if(this.url == '/account/login'){
            return
        }
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["chk_login",false,'get']
        ]);

        console.log("checkLogin")
        /*this.redirect("/");
        return false;*/
    },

    ChkVIP: function* (){
        console.log('====ChkVIP====')
        if(this.url == '/account/login'){
            return
        }
        var aid = WebAid(this);
        var isVip = utilFn.isVip(aid);
        var token = aid.ctx.session['token']||'';
        var host =aid.ctx.request.header.host;
        var vipHost = aid.ctx.state.vars.vipRedirect;
        if(isVip&&token&&vipRedirect&&host!=vipHost){
            var curPath = aid.ctx.request.url.replace(/www\.wmzy\.com/g,vipHost);
            var addr = "http://"+vipHost+'/proxy.do?callback='+encodeURIComponent(curPath)+'&_t_='+token;
            return this.redirect(addr);
        }

    },

    login:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["return_url",'']
        ]);

        aid.setBody(yield AccountView.login(aid));
    },
    logout: function* (){
        this.session = {};
        var aid = WebAid(this);
        var host = aid.ctx.request.header.host;
        aid.param = aid.keyList([
            ["callback","http://"+host+"/"]
        ]);
        console.log("logout>>>",host);
        return this.redirect("http://www.ipin.com/account/logout.do?callback=" + encodeURIComponent(aid.get('callback')));
    },

    favorite:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["t",''],
            ["s",'']
        ]);

        aid.setBody(yield AccountView.favorite(aid));
    }



}