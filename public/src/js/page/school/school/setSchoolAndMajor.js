define(['ux'],function(){

    var Util = pin.util;
    var Req = pin.request;

    pin.reg("school/school/setSchoolAndMajor",Util.create(pin.getCls("defaultView"),{
        onViewReady:function(){
            var that = this;
            this.jq(".close").click(function(){
                that.close();
                return false;
            });
            this.tips();
            this.bntArea();
            this.autoComplete();
            this.initEvent();
        },
        initEvent:function(){
            this.jq("input:text").each(function(){
                var val = this.getAttributeNode('value') ? this.getAttributeNode('value').value : $(this).val();
                $(this)
                    .focusText("input-hover",val,$(this).parent()).
                    focus(function(){
                        $(this).parent().removeClass("red-border");
                    })
                    .triggerHandler("focus")
                $(this).triggerHandler("blur")
            });
        },
        getData:function(){
            var d = {};
            var allEl = this.jq("input");
            var f = true;
            $(allEl).each(function(){
                var el = $(this);
                var v = el.val();
                if(!v){
                    el.parent().addClass('red-border');
                    f = false;
                }
                d[el.attr('name')] = v;
            })

            return f ? d : f;
        },
        autoComplete:function(){
            var that = this;
            'school,major'.replace(/[^, ]+/g,function(s){
                var El = that.jq('[name="'+s+'"]');
                pin.use('AutoComplete',{
                    inputor:El,
                    tpl:"detailsSearch",
                    ulDom:El.parent().find(".auto-complete"),
                    reqFn:Util.bind(Req['search_'+s],Req),
                    clickIdx:function(){
                        var idx = this.nowIdx == -1 ? 0 : this.nowIdx;
                        El.val(this.ulDom.children().eq(idx).html());
                        this.ulDom.html('');
                        El.blur();
                    },
                    displayUl:function(b){
                        this.ulDom.cssDisplay(b)
                    },
                    onViewReady:function(){
                        var that = this;
                        this.ulDom.click(function(e){
                            var el = $(e.target);
                            if(el[0].tagName == 'LI'){
                                El.val(el.html());
                                that.ulDom.html('');
                            }
                        });
                    }
                });
            })
        },
        close:function(){
            var el = this.jq();
            if(el.closest('.edu-info').hasClass('edu-info')){
                el = el.closest('.edu-info');
            }
            el.cssDisplay(0);
        },
        tips:function(){
            var tid = 0;
            var that = this;
            var tipsEl = that.jq('.tips');
            function hide(){
                tipsEl.cssDisplay(0);
            }
            this.jq(".tips-txt").hover(function(){
                tipsEl.cssDisplay(1);
                clearTimeout(tid);
            },function(){
                tid = setTimeout(hide,200);
            });
            tipsEl.hover(function(){
                clearTimeout(tid);
            },function(){
                tid = setTimeout(hide,200);
            });
        },
        bntArea:function(){
            var that = this;
            this.jq('#ok').click(function(){
                var d = that.getData();
                if( d!= false){
                    var urlData=$.extend({pipeId:that.id},d);
                    pipe.loadModel("/account/setLastSchool.do",urlData);
                }
                return false;
            });
            this.jq('#cancel').click(function(){
                that.close();
                return false;
            });
        }
    }));

},"pipe/school/school/setSchoolAndMajor.js");