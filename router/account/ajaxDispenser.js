var Account = load("controller/account/account");
var Zhiyuan = load("controller/zhiyuan/zhiyuan");
var AccountData = load("provider/account/accountData");
var Request = require("request");

module.exports = {
    chkLogin: function (fn){
        return function*(){
            var aid = WebAid(this);
            var uid = yield Account.getUid(aid);
            if(uid === false){
                aid.setBody(utilFn.returnJsBody({msg:"need login"},401))
            } else {
                yield fn(aid,uid);
            }
        }
    },

    login: function* (aid,token){
        console.log("token >>>",token)
        var rv = yield Account.validate_token(token);
        console.log("===Account.validate_token >>> ",rv)

        if(rv.uid!=0){
            aid.ctx.session.token=token
            aid.ctx.session.userInfo=rv;
            aid.ctx.session.userInfo.login_time = Date.now();

            //set pagevars
            aid.ctx.state.vars.authorization.userInfo = aid.ctx.session.userInfo;
            aid.ctx.state.vars.authorization.isLogin = aid.ctx.session.userInfo.uid>0;
            aid.ctx.state.vars.authorization.isVip = utilFn.isVip(aid);

            // write token to mark login status for sending of ga pageview
            aid.ctx.cookies.set('login', 'login', {
                httpOnly: false,
                maxage: 3000 * 10,
                domain: 'wmzy.com'
            });

            // after login reload Vip info
            yield module.exports.reloadVip(aid);
                       

            //加载score;
            var score = yield Account.load_score(aid,rv.uid);
            aid.ctx.session["score"] = score||undefined;


            //加载zhiyuan
            if(aid.ctx.session['newuser']!=1){
                var rv = yield Zhiyuan.load_zhiyuan(aid,rv.uid);
                if(rv){
                    aid.ctx.session["zhiyuan"] = rv.zhiyuan;
                }
            }

        }
    },

    //重新加载vip信息
    reloadVip: function* (aid) {
        var uid = utilFn.getUid(aid)
        var rv= {};
        if (uid) {
            rv = yield AccountData.user_binded_card_info(uid,aid)
            console.log('=========reloadVip>>>',rv)

            var tryTimes = 10;
            while(rv.code == 10004&&tryTimes){//maybe fail to get vipInfo,retry
                console.log("reloadVip retryTimes>>>",tryTimes)
                rv = yield AccountData.user_binded_card_info(uid,aid);
                tryTimes--
            }

        }

        return rv;

    },

    ajaxLogin:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["card_no", '','post'],
            ["card_pwd", '','post'],
            ["login_type",'mobile','post']
        ]);
        var card_no = aid.get('card_no');
        var card_pwd = aid.get('card_pwd');
        var login_type = aid.get('login_type');
        var channel = 'pc';
        if((/^1\d{10}$/).test(card_no)){
            login_type = 'mobile';
        }

        var rv = yield AccountData.loginInfo(card_no, card_pwd,login_type,channel);
        

        if(rv.code == 0){
            rv.msg = '登录成功';
            var token = rv.token;
            rv.token = 'login success';
            yield module.exports.login(aid,token);

        }else{
            var err = {
                "11101":"卡号格式错误",
                "11102":"卡号不存在",
                "11103":"卡号和密码不匹配", 
                "11104":"卡号已经被激活过了",    
                "11105":"卡号过期",
                "11201":"账号不存在",    
                "11202":"验证码错误",
                "11203":"账号密码不匹配"
            }
            rv.msg = err[rv.code]||'登录失败';
        }

        aid.setBody(utilFn.returnJsBody(rv, rv.code == 0?200:401));

    },



    addColle: function* (){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["sch_id",""],
            ["major_id",""],
            ["diploma",7]
        ]);
        var data = yield Account.addColle(aid,utilFn.getUid(aid));
        aid.setBody(utilFn.returnJsBody(data))
    },

    removeColle: function* (){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["sch_id",""],
            ["major_id",""],
            ["diploma",7]
        ]);
        console.log("removeColle")
        var data = yield Account.removeColle(aid,utilFn.getUid(aid));
        aid.setBody(utilFn.returnJsBody(data))
    },

    removeColleExam: function* (){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["exam_id",""]
        ]);
        console.log("removeColleExam")
        var data = yield Account.removeColleExam(aid,utilFn.getUid(aid));
        aid.setBody(utilFn.returnJsBody(data))
    },

    colleExam: function* (){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["exam_id",""]
        ]);
        console.log("colleExam")
        var data = yield Account.colleExam(aid,utilFn.getUid(aid));
        aid.setBody(utilFn.returnJsBody(data))
    },

    listColle: function* (aid,uid){
        var data = yield Account.listColle(aid,uid);
        aid.setBody(utilFn.returnJsBody(data))
    },

    schColle: function* (aid,uid){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ["sch_id",""],
            ["diploma",7],
            ["pici",'bk1']
        ]);
        var data = yield Account.schColle(aid,uid);
        aid.setBody(utilFn.returnJsBody(data))
    },

    listSchMajor: function* (aid,uid){
        aid.param = aid.keyList([
            ["sch_id",""],
            ["diploma",7]
        ]);
        var data = yield Account.listSchMajor(aid,uid);
        aid.setBody(utilFn.returnJsBody(data))
    },

    userInfo: function* (){
        var aid = WebAid(this);
        // var uid = yield Account.getUid(aid);
        var userInfo = aid.ctx.session['userInfo']
        if(userInfo){
            this.status = 200
            this.body = userInfo
        } else {
            this.status = 304
        }
    },

    sentSMS: function* () {
        const aid = WebAid(this)
        aid.param = aid.keyList([
            ['mobile', '', 'post'],
            ['exist', '', 'post']
        ])
        var data = yield AccountData.sentSMS(aid.get('mobile'), true)
        if (data.result != 'success')
            data = yield AccountData.sentSMS(aid.get('mobile'), false)
        var rv = {code: 304}
        if (data.result == 'success') {
            rv.code == 200
        }
        aid.setBody(utilFn.returnJsBody(rv))
    },

    checkSMS: function* () {
        const aid = WebAid(this)
        const uid = yield Account.getUid(aid)
        const ip = aid.ctx.req.connection.remoteAddress
        aid.param = aid.keyList([
            ['mobile', '', 'post'],
            ['auth_code', '', 'post'],
            ['buy_count', 1, 'post']
        ])
        var data = yield AccountData.checkSMS(aid.get('mobile'), aid.get('auth_code'))
        console.log('======== auth_code data', data)
        if (data.code == 0) {
            var payLinkData = yield AccountData.getWxGroupPayLink(uid, ip, aid.get('buy_count'), aid.get('mobile'))
            console.log('======== gropu pay lonk data', payLinkData)
            if (payLinkData.code == 0) {
                return aid.setBody(utilFn.returnJsBody(payLinkData, 200))
            }
        }
        return aid.setBody(utilFn.returnJsBody({}, 304))
    },

    getRegVerifyCode:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ['mobile', '', 'post'],
            ['clientmark','','post']
        ]);

        var output={};
        var clientmark = aid.get('clientmark');
        var mobile = aid.get('mobile');

        if(clientmark!=aid.ctx.session['clientmark']){
            output.code='500';
            output.msg='验证码发送失败';
        }else{
            var existStat = yield AccountData.checkAccount(mobile);
            if(existStat.uid==0){
                var rv = yield AccountData.sentSMS(mobile,false);
                output.code = rv.result=='success'?'1':'500';
                output.msg= output.code==1?'验证码发送成功':'验证码发送失败';
            }else{
                output.code='2';
                output.msg='该账号已存在，请登录';
            }
        }

        return aid.setBody(utilFn.returnJsBody(output, 200));
    },
    checkRegVerifyCode:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ['mobile', '', 'post'],
            ['verify','','post'],
            ['clientmark','','post']
        ]);

        var mobile = aid.get('mobile');
        var verify = aid.get('verify');
        var clientmark = aid.get('clientmark');
        var output={};

        if(clientmark!=aid.ctx.session['clientmark']||verify.length!=6){
            output.code='500';
            output.msg='验证码校验失败';
        }

        var existStat = yield AccountData.checkAccount(mobile);
        if(existStat.uid==0){
            var rv = yield AccountData.createAccount(mobile,verify);
            if(rv.code==0&&rv.uid>0){
                aid.ctx.session['newuser'] = 1;
                aid.ctx.session['token'] = rv.token;

                output.code = '1';
                output.msg= '验证码校验成功';
                output.token = rv.token;
                output.uid = rv.uid;
                yield module.exports.login(aid,rv.token);


            }else{
                output.code = '500';
                output.msg= '验证码校验失败';
            }

        }else{
            output.code='2';
            output.msg='该账号已存在，请登录';
        }

        return aid.setBody(utilFn.returnJsBody(output, 200));

    },

    checkImageIdentifyCode:function*(){
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ['mobile', '', 'post',true],
            ['code','','post',true],
            ['act','reg','post']
        ]);
        var mobile = aid.get('mobile');
        var code = aid.get('code');
        var act = aid.get('act');

        var uri = "http://www.ipin.com/account/checkImageIdentifyCode.do?code="+code+"&phone="+mobile+"&act="+act+"&_="+Date.now();
        var options = {
            url: uri,
            method:'GET',
            headers: {
                'host':aid.ctx.req.headers.host,
                'origin':aid.ctx.req.headers.origin,
                'User-Agent': aid.ctx.req.headers['user-agent']
            }
        }

        var rv = yield function(fn){
            Request(options,function(error, response, body){
                fn(error,body)
            });
        }

        return aid.setBody(rv);
        
    }

}
