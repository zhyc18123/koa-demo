define(["jquery","pin","avalonGetModel"], function($,pin,avalon) {
    var widget = avalon.ui["page"] = function(element, data, vmodels){


    var tpl ={
        "pageTpl1": ['<div class="mod-page" ms-if="maxPage>1">',
                '    <a href="#" rel="prev" title="上一页" class="prev" ms-if="page>1" ms-click="_goPage(page-1,$event)">&lt;</a> ',
                '    <a href="#" ms-repeat-el="pageRang" ms-click="_goPage(el,$event)" ms-attr-title="el==page?\'已经是当前页\':(\'第\'+el+\'页\')" ms-class="current:el==page">{{el}}</a> ',
                '    <a href="#" rel="next" title="下一页" ms-click="_goPage(page+1,$event)"  class="next" ms-if="page<maxPage">&gt;</a>',
                '</div>'].join(''),

        "pageTpl2":['<div class="page" ms-if="maxPage>1">',
                    '    <div class="gb_pages">',
                    '        <div class="gb_page_con">',
                    '            <a class="gb_page_prev" href="#" title="上一页" ms-if="page>1" ms-click="_goPage(page-1,$event)">&lt;</a> ',
                    '            <a href="#" ms-repeat-el="pageRang" ms-click="_goPage(el,$event)" ms-attr-title="el==page?\'已经是当前页\':(\'第\'+el+\'页\')" ms-class="gb_page_cur:el==page">{{el}}</a>',
                    '            <a title="下一页" href="#" class="gb_page_next" ms-click="_goPage(page+1,$event)" ms-if="page<maxPage">&gt;</a> ',
                    '        </div>',
                    '    </div>',
                    '</div>'].join(''),
        "pageTpl3":['<div class="gb_pages" ms-if="maxPage>1">',
                    '    <div class="gb_page_con">',
                    '        <a title="首页" href="#" class="gb_page_first" ms-click="_goPage(1,$event)" ms-if="maxPage>2">首页</a> ',
                    '        <a title="上一页" href="#" class="gb_page_prev" ms-if="page>1" ms-click="_goPage(page-1,$event)">上一页</a>',
                    '        <a href="#" ms-repeat-el="pageRang" ms-click="_goPage(el,$event)" ms-attr-title="el==page?\'已经是当前页\':(\'第\'+el+\'页\')" ms-class="gb_page_cur:el==page">{{el}}</a>',
                    '        <a class="gb_page_next" href="#" title="下一页" ms-click="_goPage(page+1,$event)" ms-if="page<maxPage">下一页</a> ',
                    '        <a title="末页" href="#" class="gb_page_last" ms-click="_goPage(maxPage,$event)" ms-if="maxPage>2">末页</a> ',
                    '    </div>',
                    '</div>'].join('')

        };

    var innerHtml = tpl[data.pageOptions.$pagetpl]

    var changeFn = (element.msData["ms-onchange"] || "").trim();
    var maxPageStr = (element.msData["ms-maxpage"] || "").trim();
    var curPageStr = (element.msData["ms-curpage"] || "").trim();
    var setPageFnStr = (element.msData["ms-setpage"] || "").trim();
    var el = $(innerHtml);
    $(element).after(el);
    $(element).remove();
    element = el[0];
    data.element = element;

    var vmodel = avalon.define(data.pageId, function(vm) {
        avalon.mix(vm, data.pageOptions);
        vm.pageRang=[];
        vm._setPageRang=function(){
            var page = vm.page;
            var maxShowPage = vm.$maxShowPage;
            var totalPage = vm.maxPage;
            var minp = 0, maxp=0;
            var halfMaxShowPage = parseInt(maxShowPage / 2);
            if (totalPage <= maxShowPage) {
                minp = 0;
                maxp = totalPage;
            } else {
                if( page <= halfMaxShowPage ){
                    minp = 0;
                    maxp = maxShowPage;
                } else if (page < totalPage-halfMaxShowPage ){
                    maxp = page + halfMaxShowPage;
                    minp = page - (maxShowPage - halfMaxShowPage);
                } else {
                    minp = totalPage - maxShowPage - 1;
                    maxp = totalPage;
                }
            }
            var rv = [];
            for(var i = 0; i < maxp-minp; i++ ){
                rv[i] = i + minp + 1;
            }
            vm.pageRang.clear();
            vm.pageRang.pushArray(rv);
        }
        vm._goPage = function(p,e){
            if(vm.page!=p && vm.onChange(p) != false){
                vm.page = p;
                vm._setPageRang();
            }
            pin.cancelDefault(e);
        }
        vm.$init=function(){
            vm._setPageRang();
            var fnModel;
            if (changeFn && (fnModel = avalon.getModel(changeFn, vmodels))) {
                vm.onChange = function(p){
                    return fnModel[1][fnModel[0]](p,fnModel[1]);
                } ;
            }
            var maxPageModel;
            if (maxPageStr && (maxPageModel = avalon.getModel(maxPageStr, vmodels))) {
                maxPageModel[1].$watch(maxPageModel[0], function(newValue) {
                    console.log("maxPage>>>",newValue)
                    vmodel.maxPage = newValue;
                    vmodel.page = 1;
                    vmodel._setPageRang();
                });
            }

            
            var curPageModel;   
            console.log("curPageStr>>>",curPageStr,avalon.getModel(curPageStr, vmodels))
            if (curPageStr && (curPageModel = avalon.getModel(curPageStr, vmodels))) {

                curPageModel[1].$watch(curPageModel[0], function(curValue) {
                    console.log("curValue>>>",curValue)
                    vmodel.page = curValue;
                    vmodel._setPageRang();
                });
            }

            var setPageModel;
            if (setPageFnStr && (setPageModel = avalon.getModel(setPageFnStr, vmodels))) {
                setPageModel[1][setPageModel[0]] = function(page) {
                    vmodel.page = page;
                    vmodel._setPageRang();
                }
            }
        }
    });

    avalon.nextTick(function() {
        avalon.scan(element, [vmodel].concat(vmodels))
    })

    return vmodel

    }
    widget.defaults = {
        maxPage:10,
        page:1,
        $maxShowPage:5,
        $pagetpl:"pageTpl1",
        onChange:function(){}
    }
    
    return widget;
});
