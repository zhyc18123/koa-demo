define(["ux","highstock"],function(){
    var Util = pin.util;
    var Req = pin.request;

    pin.on("pageStart",function(){
        var compare = {
            init:function(){
                this.initSearch();
                this.initEvent();
                this.initNav();
            },
            initEvent:function(){
                $(".head-input>li").live('click',function(){
                    var compareModel = pipe.getModFromTpl("compare");
                    var el = $(this);
                    var v = el.attr('v');
                    if(el.hasClass('selected')){
                        pin.util.arrayRemove(compareModel.json.selIds,v);
                        el.removeClass('selected');
                        el.find('div').html('<i class="checkbox"></i>加入对比');
                    } else {
                        if(compareModel.json.selIds.length == 4){
                            pin.ui.MsgBox.alert("","最多只能同时对比四所学校，您可以取消不需要对比的学校再重新勾选");
                            return false;
                        }
                        compareModel.json.selIds.push(v);
                        el.addClass('selected');
                        el.find('div').html('<i class="checkbox"></i>取消对比');
                    }
                    compareModel.reload();
                    return false;
                });
                $(".head-input>li .remove").live('click',function(){
                    var compareModel = pipe.getModFromTpl("compare");
                    var v = $(this).parent().attr('v');
                    compareModel.removeItem(v);
                    $(this).parent().remove();
                    if( $(".head-input>li").length != 12 ){
                        $(".head-input .input").cssDisplay(1)
                    }
                    return false;
                });
            },
            addLi:function(id,name,hasSelect){
                var el = $('<li v="'+id+'">'+name+'<i class="sch-sel"></i><a class="remove" href="#"></a><div><i class="checkbox"></i>加入对比</div></li>')
                $(".head-input .input").before(el);
                if(hasSelect){
                    el.addClass('selected');
                    el.find('div').html('<i class="checkbox"></i>取消对比');
                }
            },
            initSearch:function(){
                var that = this;
                pin.use("Base",{
                    context:true,
                    view:$(".head-input .input")[0],
                    hoverClass:'input-hover',
                    search:{
                        "searchType":'sch',
                        "form":'sch',
                        "idKey":'sch_id+\'__\'+(pin.util.arrayIndexOf(data.sch[i].sch_grade||[],"本科")==-1?5:7)',
                        "nameKey":'sch_name',
                        "hasStat":true
                    },
                    onViewReady:function(){
                        var el = this.jq();
                        var that = this;
                        var search = this.search;
                        pin.use("AutoComplete",{
                            inputor:this.jq("input"),
                            tpl:'<% for(var i=0;i<data.'+search.form+'.length;i++){ %><li jd="<%=data.'+search.form+'[i].'+search.idKey+'%>"><%=data.'+search.form+'[i].'+search.nameKey+'%></li><%}%>',
                            ulDom:this.jq("ul"),
                            reqFn:Util.bind(function(searchKey,fn){return this.q("/search/searchJson.do",{searchKey:searchKey,searchType:search.searchType,"hasStat":search.hasStat},fn);},Req),
                            content:this.jq(),
                            displayUl:function(b){
                                this.content.checkClass(that.hoverClass,b);
                            },
                            clickIdx:function(){
                                if( this.nowIdx != -1 ){
                                    that.selectItem( this.ulDom.find("li").eq(this.nowIdx) )
                                }
                            }
                        });
                        this.jq("ul").click(function(e){
                            if(e.target.tagName == 'LI'){
                                that.selectItem(e.target);
                                return false;
                            }
                        });
                    },
                    selectItem:function(el){
                        var selectId = $(el).attr('jd');
                        var val = $(el).text();
                        var compareModel = pipe.getModFromTpl("compare");
                        var rv = compareModel.addItem(selectId,val);
                        $(".head-input .input input").val('');
                        if(rv){
                            var hasSelect = false;
                            if(compareModel.json.selIds.length <4){
                                compareModel.json.selIds.push(selectId);
                                compareModel.reload();
                                hasSelect = true;
                            }
                            that.addLi(selectId,val,hasSelect);
                            $(".head-input .input").removeClass('input-hover');
                        }
                        $(".head-input .input").cssDisplay( $(".head-input>li").length != 12 )
                    }
                }).getView();
            },
            initNav:function(){
                //var pageTop = $(".compare-body").offset().top;
                var row = $(".compare-row:gt(2)");
                var arr = [];
                row.each(function(){
                    arr.push($(this).offset().top);
                });
                var allLi =  $(".compare-nav li");

                function setNavI(idx){
                    allLi.removeClass('cur');
                    allLi.eq(idx).addClass('cur');
                }
                allLi.click(function(){
                    var idx = $(this).index();
                    if(idx == 4) idx--;
                    $(window).scrollTop(arr[idx]-110);
                })
                $(window).scroll(function(){
                    var st = $(window).scrollTop();
                    var i = 0;
                    if(st > arr[0]){
                        for(var len=arr.length-1;i<len;i++){
                            if( arr[i] > st && st <= arr[i+1] ){
                                break;
                            }
                        }
                    }
                    setNavI(i);
                    var schoolName = $(".compare-body .school-name");
                    if(st > arr[0]){
                        schoolName.eq(0).addClass('compare-row-fixed')
                        schoolName.eq(1).cssDisplay(1)
                    } else {
                        schoolName.eq(0).removeClass('compare-row-fixed')
                        schoolName.eq(1).cssDisplay(0)
                    }
                });
            }
        };
        pin.on('removeSelectItem',function(e){
            $(".head-input>li[v='"+e.ids+"']").removeClass('selected');
        });
        compare.init();
    });

},"pipe/schoolV2/compare.js");