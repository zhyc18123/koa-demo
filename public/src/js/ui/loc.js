define(["jquery","pin","ui/ui","ui/ejs","ui/tpl"],function ($,pin,ui,Tpl) {

    var Util = pin.util;
    var Req = pin.request;

    pin.reg('locUi',Util.create(pin.getCls("Base"),{
        locInput:null,
        locCallBack:function(loc_id){ console.log(loc_id) },
        needclick:true,
        onViewReady:function(){
            var that = this;
            var loc = this.locInput;
            var val = loc.val();
            var placeholder = loc.attr('placeholder');
            loc.focusText("",placeholder,loc.parent());
            loc.val(val);

            pin.use("AutoComplete",{
                inputor:loc,
                tpl:"detailsSearch",
                ulDom:loc.next('ul'),
                reqFn:Util.bind(function(searchKey,fn){
                    return this.q("/search/searchJson.do",{searchType:'loc',searchKey:searchKey,hasStat:"False"},fn);
                },Req),
                content:loc.parent(),
                needclick:that.needclick,
                minCharLength:1,
                clickIdx:function() {
                    this.needclickLock=true;
                    var idx = this.nowIdx == -1 ? 1 : this.nowIdx;
                    var el = this.ulDom.find("li:eq("+(idx-1)+")");
                    var loc_id = 0;
                    if(el.attr('value')){
                        this.inputor.val(el.html());
                        loc_id = el.attr('value');
                    } else {
                        var data = this.cache.loc && this.cache.loc[idx];
                        if(data){
                            this.inputor.val(data.loc_namecn);
                            loc_id = data.loc_id;
                        } else {
                            return false;
                        }
                    }
                    that.locCallBack(loc_id);
                },
                displayUl:function(b){
                    this.content.checkClass("input-hover",!!b);
                },
                inputorFcous:function(){
                    if(this.ulDom.find("li").length){
                        this.content.checkClass("input-hover",1);
                    }
                },
                chkData:function(){return true},
                getUlHtml:function(d){
                    if(d.loc.length){
                        return Tpl.ejs(this.tpl,d);
                    } else {
                        return '<div class="null-txt">对不起，未找到该城市</div>';
                    }
                },
                onViewReady:function () {
                    var that = this;
                    this.ulDom.click(function(e){
                        var el = $(e.target);
                        that.needclickLock = true;
                        if(el[0].tagName == 'LI'){
                            that.nowIdx = el.index();
                            that.clickIdx();
                        }
                    });
                },
                onblur:function(){
                    this.clickIdx();
                }
            });
        }
    }))

        


});