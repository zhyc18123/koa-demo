var Dispenser = load("router/dispenser");
var AjaxDispenser = load("router/ajaxDispenser");



module.exports = utilFn.urlInit({
    jsView:function(){
        this.get("/getAddr",AjaxDispenser.getAddr);
        this.post("/collecterror",AjaxDispenser.collecterror);
    },
    view:function() {
        this.get("/",Dispenser.index);
       
        this.get("/about.html",Dispenser.about);
        
    },
   
    subDir:function() {
        


        //load("router/account/url")("/account", this.app);
        
    }
})
