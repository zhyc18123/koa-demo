var AjaxDispenser = require("./ajaxDispenser");
var Dispenser = require("./dispenser");
var CommonMiddleware = load("middleware/common");

module.exports = utilFn.urlInit({
    jsView:function(){
        this.post("/ajaxLogin",AjaxDispenser.ajaxLogin);
        this.get("/addColle",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.addColle);
        this.get("/removeColle",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.removeColle);
        this.get("/listColle",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.listColle);
        this.get("/schColle",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.schColle);
        this.get("/listSchMajor",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.listSchMajor);
        this.get("/userInfo", CommonMiddleware.chkLogin('ajax'),AjaxDispenser.userInfo);
        //this.post("/getRegVerifyCode",AjaxDispenser.getRegVerifyCode) //现在需要图形验证码，已废弃
        this.post("/checkRegVerifyCode",AjaxDispenser.checkRegVerifyCode);
        this.post("/checkImageIdentifyCode",AjaxDispenser.checkImageIdentifyCode);//校验图形验证码
        this.get("/removeColleExam",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.removeColleExam);
        this.get("/colleExam",CommonMiddleware.chkLogin('ajax'),AjaxDispenser.colleExam);
    },
    view:function() {
        this.get("/login",Dispenser.login);
        this.get("/logout",Dispenser.logout);
        this.get("/favorite",CommonMiddleware.chkLogin('ajax'),Dispenser.favorite);

        this.pay()




    },
    pay: function() {
        this.post("/sentSMS", AjaxDispenser.sentSMS);
        this.post("/checkSMS", AjaxDispenser.checkSMS);
    }
})
