define(['ux'],function(){

    var Util = pin.util;
    var Req = pin.request;
    var MsgBox = pin.ui.MsgBox;

    pin.reg("school/school/setEduInfo",Util.create(pin.getCls("defaultView"),{
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
                        $(this).removeClass("red-border");
                    })
                    .triggerHandler("focus")
                    
                $(this).triggerHandler("blur")
            });

            this.jq(".select").each(function(){
                pin.use("select",{
                    view:this,
                    cssNode:$(this).parent(),
                    hoverClass:"input-hover",
                    focusRemoveClass:"red-border",
                    minCol:1,
                    maxCol:1
                }).getView();
            });

            this.jq(".radio-input").each(function(){
                var allEl = $(this).find("i.radio");
                $(this).find(".radio-item").click(function(){
                    allEl.removeClass("radio-checked");
                    $(this).find("i.radio").addClass('radio-checked');
                });
            });
        },
        autoComplete:function(){
            var that = this;
            'school,major'.replace(/[^, ]+/g,function(s){
                var El = that.jq('[name="stu.'+s+'"]');
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
        getVal:function(allEl){
            var d = {};
            $(allEl).each(function(){
                var el = $(this);
                var v = el.val();
                if(v == el.data('_val')){
                    v = ""
                }
                d[el.attr('name')] = v;
            })
            return d;
        },
        send:function(){
            var that = this;
            if(that.submitlock) return;
            that.submitlock = true;
            var data = this.getVal(this.jq("input,.select"));
            var v = this.jq("[name='stu.plan'].radio-checked").attr('value');
            if(v){
                data['stu.plan'] = v;
            }
            data['stu.edu_end'] = +data['stu.edu_start'] + 4
            data['idx'] = that.json.idx;
            data['keys'] =  Object.keys( data );
            Req.setResume(data,function(r){
                if(r.isOk()){
                    that.close();
                    location.reload(1);
                } else {
                    MsgBox.alert("","保存失败，请重试或联系管理员!");
                    that.submitlock = false;
                }
            });
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
                that.send();
                return false;
            });
            this.jq('#cancel').click(function(){
                location.reload(1)
                that.close();
                return false;
            });
        }
    }));

},"pipe/school/school/setEduInfo.js");