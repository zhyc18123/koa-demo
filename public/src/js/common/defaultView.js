define(['jquery','pin','avalon'],function($,pin,avalon){

    pin.reg("defaultView",pin.util.create({
        jsMvc:true,
        innerViewReady:$.noop,
        getViewBefore:$.noop,
        onViewReady:$.noop,
        vmBind:$.noop,
        mvc:$.noop,
        destroy:$.noop,
        getView:function(){
            var $ = jQuery;
            if(pin.isJsModel || this.delay || pin.getCfg("outputModel") == "script"){
                var v = [];
                for(var i=0,len=this.view.length;i<len;i++){
                    if(this.view[i].nodeType == 1){
                        v.push(this.view[i])
                    }
                }
                this.view = $(v);
                this.view.attr("id",this.id);
                $("#"+this.id).replaceWith(this.view);
            } else {
                this.view = $("#"+this.id)
            }
        },
        init : function(opt){
            $.extend(this,opt);
            this.getViewBefore();
            this.getView();
            this.innerViewReady();
            //$.extend(this,pipe.pipVar(this.id));
            if(this.jsMvc){
                this.avalonDefine();
            }
            this.onViewReady();
            this.jsMvc && (this.getVm()._ready = true);
        },
        jq :function(sel){
            var  view = jQuery(this.view);
            return sel?view.find(sel):view;
        },
        avalonDefine:function(){
            var that = this;
            var allVmAttr = $.extend({
                $id:that.id,
                $pipe:that,
                _ready:false
            },that.mvc()||{});

            var vm = avalon.define(allVmAttr);
            this.vmBind(vm);
            console.log("this.vmBind>>>",that.id);
            var root = this.getVmFormId("root");
            var vms = [vm];
            root && vms.push(root);

            console.log("avalonDefine", vm )
            avalon.scan(that.view[0],vms);
            
        },
        getVmFormId:function(id){
            if(avalon.vmodels[id]){
                return avalon.vmodels[id]
            } else {
                if(id!="root"){
                    throw Error("not Found vm["+id+"]")
                }
            }
        },
        getVm:function(){
            if(avalon.vmodels[this.id]){
                return avalon.vmodels[this.id]
            } else {
                throw Error("not Found vm")
            }
        },
        _destroy:function(){
            if(this.jsMvc){
                delete avalon.vmodels[this.id]
                avalon.removeSubscribers && avalon.removeSubscribers();
            }
            this.destroy();
            delete this.view;
        }
    }));

    return pin.getCls("defaultView");
});