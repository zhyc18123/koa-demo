var Nodemailer = require("nodemailer");
var Loc = load("provider/data/loc");



module.exports = {
    test:function*(){
       var Test = new ModelProxy("test");
        var rData = yield Test.test();

        console.log("test mock>>>",rData);

      

    },

    index: function* (aid) {
        //yield this.test();
       
        var rootData = {
            provName:provName,
            json:{
                score:score
            }
        };

        Util.extend(rootData.json, score);

        return yield aid.ctx.render("index",rootData);
    },

    about: function* (aid,uid) {
        var rootData = {}
        return yield aid.ctx.render("about", rootData);
    },

   

    

    collecterror:function*(aid){
        if(webConf.interfaceStatus !='online'){
            return 'interfaceStatus:'+webConf.interfaceStatus;
        }

        var uid = utilFn.getUid(aid);
        var isVip = utilFn.isVip(aid);
        var myscore = JSON.stringify(utilFn.getSession(aid,'score'));
        var userInfo = JSON.stringify(utilFn.getSession(aid,'userInfo'));
        var ip = utilFn.getUserIP(aid);
        var host =aid.ctx.request.header.host;
        var addrInfo = JSON.stringify(aid.ctx.state.vars.location);
        var errMsg = aid.get('msg');
        var title = '[浏览器端脚本报错]['+host+']javascript error message';
        var content = errMsg;
        content += '\r\n[ip]'+ip;
        content += '\r\n[addrInfo]'+addrInfo;
        content += '\r\n[uid]'+uid;
        content += '\r\n[isVip]'+isVip;
        content += '\r\n[userInfo]'+userInfo;
        content += '\r\n[userScore]'+myscore;

        //var user = "postmaster";
        //var password = "suChe$huP6ar";
        //mail_server = "smtp.service.ipin.com";
        //helo_name="service.ipin.com"
        //var fromEmail = 'noreply@service.ipin.com';

        var user = "notify@ipin.com";
        var password = "4c4b5e4dfF";
        var mail_server = "smtp.exmail.qq.com";
        var fromEmail = 'notify@ipin.com';

        var transporter = Nodemailer.createTransport({//v1.0 above do not use 'SMTP' as first param
            host: mail_server,
            port: 25,
            /*
            //name:helo_name, //helo
            tls: {
                rejectUnauthorized:false,
            },*/
            auth: {
                user: user,
                pass: password
            }
        });

        var mailOptions = {
            date: new Date(),
            from: fromEmail,
            to: 'linhuabiao@ipin.com, 727000110@qq.com,', // list of receivers
            //to: 'linhuabiao@ipin.com,727000110@qq.com,',
            subject: title,
            text:content,
            html: ('<div>'+content.replace(/[\r\n]+/g,'<br />')+'</div>').replace(/(\[\w+?\])/g,'<b>$1<\/b>') // html body
        };

        var msg = yield function(fn){
            transporter.sendMail(mailOptions, function(error, info){
                var msg='';
                if(error){
                    msg = 'sendMail fail>>>'+error;
                }

                msg = 'Message sent: ' + (info&&info.response);
                transporter.close();
                fn(error,msg);
            });
        }

        return msg+'  interfaceStatus:'+webConf.interfaceStatus;
    }
    
}
