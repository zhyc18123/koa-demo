define(['jquery','pin','ui/ux', "common/verNav",'page/schoolV2/base','request','ui/ejs','page/head' ],
    function($,pin,ux,verNav,base,Req,TPL,headjs) {
    var Util = pin.util;
    var PageData = $.extend({},window.PageData);


    var getCfg = function(name){ return PageData[name]; };
    var params;
    var mode ={
        init:function(){
            var self = this;
            params = self.params = getCfg('params');
            $(".page").on("click",".page-link",function (e) {
                var data = getCfg('majorsData');
                var page = $(this).data("page");
                var ajaxData = {
                    sch_id: self.params._sch_id,
                    pageNum:page,
                    totalNum:Math.ceil(data.length/10), 
                    data:data.slice(page*10,page*10+10),
                    params:self.params
                };
                self.replaceResult($('.major-list'),ajaxData,self.yearAdmitTpl);
                self.replaceResult($('.sch-year-admit .page'),ajaxData,self.yearAdmitPageTpl);

            });

            $("#category").on('click', 'li', function(e) {
                var checkClass = 'checkbox-checked';
                var categoryArr = self.params.category;
                var category = $(this).data('category');
                if($(this).find('.icon').toggleClass(checkClass).hasClass(checkClass)){
                    categoryArr.push($(this).data('category'))
                }
                else{
                    categoryArr.splice(categoryArr.indexOf(category),1);
                }
                self.params.page = 0;  //必须置零
                self.getSchAllMajorScore(self.params);
            });

            $(".sch-major-admit").on('click', '.page a', function(e) {
                self.params.page = +$(this).data('page');
                self.getSchAllMajorScore(self.params);
            });


        },
        page: 0,
        getSchAllMajorScore:function(params){
            var self = this;
            Req.getSchAllMajorScore(params,function(data){
                var data = data.data;
                if(!data.code || data.code != 200){
                    alert("内部服务器错误，请稍后重试")
                    return false;
                }
                console.log("data.data>>>",data.data)
                self.replaceResult($('.sch-major-admit tbody'),data.data,self.schMajorAdmitTpl);
                self.replaceResult($('.sch-major-admit .page'),data.data,self.schMajorAdmitPageTpl);
            });
        },
        replaceResult:function(container,data,tpl){
            var html = TPL.ejs(tpl,data);
            container.html(html);
        },
        yearAdmitTpl: [
            '    <% if (data.data.length>0){ %>',
            '    <% var majors = data.data;',
            '    for(var i=0;i<majors.length;i++){',
            '        var urlType = (majors[i].major_name[majors[i].major_name.length-1] == "类" ? "/api/school-major-cat-score/" : "/api/school-major-score/");',
            '        var url = !data.params.batch ? "" : (urlType+ data.sch_id + "-" + majors[i].major_id + ".html?year="+data.params.year+"&province="+data.params.province+"&ty="+data.params.ty+"&diploma="+(data.params.batch.indexOf("zk")<0?7:5));',
            '        if(majors[i].major_index == 0){ %>',
            '            <tr>',
            '            <%if(i==majors.length-1 || (i<majors.length-1 && majors[i+1].major_index==0)){%>',
            '                <td class="t1" >',
            '                       <a target="_blank" href="<%=url%>"><%=majors[i].major_name%><span>(共有<%=majors[i].major_total_count%>人)</span></a>',
            '                </td>',
            '            <%} else{%>',
            '                <td class="t1 bd0" >',
            '                       <a target="_blank" href="<%=url%>"><%=majors[i].major_name%><span>(共有<%=majors[i].major_total_count%>人)</span></a>',
            '                </td>',
            '            <%}%>',
            '                <td class="t2 tac"><%=majors[i].major_score%></td>',
            '                <td class="t2 tac"><%=majors[i].major_score_rank%></td>',
            '                <td class="t2 tac"><%=majors[i].major_count%></td>',
            '            </tr>',
            '            <%} else if(majors[i].major_index == 1){%>',
            '                <tr>',
            '                    <td class="t1" >',
            '                    </td>',
            '                    <td class="t2 tac"><%=majors[i].major_score%></td>',
            '                    <td class="t2 tac"><%=majors[i].major_score_rank%></td>',
            '                    <td class="t2 tac"><%=majors[i].major_count%></td>',
            '                </tr>',
            '            <%} else{%>',
            '                <tr>',
            '                <%if(i==majors.length-1){%>',
            '                    <td class="t1" >',
            '                    </td>',
            '                <%} else{%>',
            '                    <td class="t1 bd0" >',
            '                    </td>',
            '                <%}%>',
            '                    <td class="t2 tac"><%=majors[i].major_score%></td>',
            '                    <td class="t2 tac"><%=majors[i].major_score_rank%></td>',
            '                    <td class="t2 tac"><%=majors[i].major_count%></td>',
            '                </tr>',
            '            <%}}%>',
            '        <% } else { %>',
            '                <tr><td colspan="6">--没数据--</td></tr>',
            '        <% } %>'
        ].join(''),
        yearAdmitPageTpl: [
            '<%if(data.data && data.data.length>0){%>',
            '    <%if (data.pageNum !=0){ %>',
            '        <a href="javascript:;" class="pre page-link" data-page=<%= data.pageNum - 1 %>><i class="icon page-pre"></i></a>',
            '    <% } %>',
            '    <% if (data.totalNum > 1){ ',
            '       var startPage = data.pageNum<4?0:data.pageNum-4%>',
            '    <% for(var i=startPage;i<startPage+10&&i<data.totalNum;i++){ %>',
            '        <% if (i != data.pageNum){ %>',
            '            <a href="javascript:;" class="page-link" data-page=<%= i %>><%= i+1 %></a>',
            '        <% } else { %>',
            '            <a href="javascript:;" class="cur"><%= i+1 %></a>',
            '        <% } %>',
            '    <% }}%>',
            '    <% if (data.pageNum < data.totalNum-1){ %>',
            '        <a href="javascript:;" class="next page-link" data-page=<%= data.pageNum + 1 %>><i class="icon page-next"></i></a>',
            '    <% } %>',
            '<%}%>'
        ].join(''),
        schMajorAdmitTpl:[
            '   <% if (data.dataList.length){ %>',
            '       <% for (i of data.dataList){',
            '           var diploma = data.params.diploma;',
            '           var query = ((i.route&&i.route.indexOf("?")>-1)?"&":"?")+"ty="+data.params.ty+"&province="+data.params.province+"&year="+data.params.year; %>',
            '           <tr>',
            '               <td class="t1">',
            '               <% if (i.route){ %>',
            '                   <a target="_blank" href="<%= i.route + query %>"><%= i.major_name %></a>',
            '               <% } else{%>',
            '                   <%= i.major_name %>',
            '                <%} %>',
            '                </td>',
            '                <td class="t2"><%= i.major_category || "-" %></td>',
            '                <td class="t2"><%= i.major_second_category || "-" %></td>',
            '                <td class="t2"><%= i.max_score>0?i.max_score:"-" %></td>',
            '                <td class="t2"><%= i.avg_score>0?i.avg_score:"-" %></td>',
            '                <td class="t2"><%= i.avg_diff_score>0?i.avg_diff_score:"-" %></td>',
            '                <td class="t2"><%= i.luqu_batch %></td>',
            '            </tr>',
            '        <% } %>',
            '   <% } else { %>',
            '          <tr><td colspan="7">--没数据--</td></tr>',
            '   <% } %>',
        ].join(''),
        schMajorAdmitPageTpl:[
            '    <% if (data.pageLen > 1){',
            '        var page = data.params.page;',
            '        if (page !=0){ %>',
            '            <a  href="javascript:;" class="pre" data-page="<%=page-1%>"><i class="icon page-pre"></i></a>',
            '        <% } ',
            '        for(var i=0;i<data.pageLen;i++){ ',
            '            if (i != page){ %>',
            '               <a href="javascript:;" jd=<%= i+1 %> data-page="<%=i%>"><%= i+1 %></a>',
            '            <% } else { %>',
            '               <a href="javascript:;" class="cur"><%= i+1 %></a>',
            '            <% } }',
            '        if (page < data.pageLen-1){ %>',
            '            <a href="javascript:;" data-page="<%=page+1%>" class="next"><i class="icon page-next"></i></a>',
            '        <% } } %>'
        ].join('')
    }

    var isLogin = PageData.isLogin;
    var ept={
        jq:$,
        json:PageData,
        init:function(){
            console.log('score ept.init')
            verNav.init();
            base.init();
            mode.init()
            headjs.init();
            this.onViewReady();
            $("#login_link").click(function() {
                // ipinAuth.loginBox();
                return false;
            });
            $("#reg_link").click(function() {
                // ipinAuth.regBox();
                return false;
            });

            //check login todo : remove 
            $(document.body).click(function(e){
                var target = e.target;
                var needloginEl = $(target).closest('[needlogin]')
                if(needloginEl.length&&!isLogin){
                    var obj = {};
                    if(needloginEl.attr("t")){
                        obj.t = needloginEl.attr("t");
                    }
                    this.needLogin(obj);
                }
            });
        },
        onViewReady:function(){
            $(".inline-select").each(function(){
                pin.use("select",{
                    view:this,
                    hidden:true,
                    autoColumn:true,
                    minCol:1,
                    maxCol:1,
                    cssNode:$('<div></div>'),
                    onchange:function(){
                        return true;
                    }
                }).getView();
            });

            var catUrl = 'http://'+location.host+location.pathname +
                    '?province=' + params.province +
                    '&ty=' + params.ty +
                    '&year=' + params.year +
                    '&diploma=' + params.diploma

        },
        needLogin:function(e) {
            var url = "";
            switch(e.t){
                case 'zhiyuan':
                    url = "http://gaokao.ipin.com/zhiyuan";
            }
            ipinAuth.regBox(url);
        }
    }
    return ept;
});
