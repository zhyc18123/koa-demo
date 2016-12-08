define(["jquery","pin","ui/ejs","ui/tpl"],function($,pin,Tpl){
    var P = pin;
    var Util = P.util,
        jqWin = $(window),
        doc = document;
    
    var ui = P.ui = {};
    /**
     * @class pin.ui.Base
     * 轻专区ui基类
     * @constructor
     * UI控件对象属性初始化
     * @param {Object} cfg
     * 额外属性集合，对象中的属性会覆盖原来已存在的属性值。
     * */
    ui.Base = P.reg('Base',Util.create());
    
    var getView = function(){
        if( !this.view.parentNode && this.appendTo){
            this._getView();
        }
        return this.view;
    }
    
    ui.Base.prototype = {
        /**
         * @cfg {Boolean} destroy
         * 关闭控件的时候是否删除dom节点
         * */
         /**
         * @cfg {Boolean} closeAble
         * 当前控件是否允许关闭
         * */
        /**
         * @cfg {Boolean} hidden
         * 当前控件的隐藏状态
         * */
        /**
         * @cfg {String|HTMLElement} view
         * 该值在配置参数中可以存在两种值:模版库中的id或者是dom节点<br />
         * 执行getView(生成dom节点)之后 为控件对应的dom节点
         * */
        /**
         * @cfg {Boolean} actionMgr
         * 是否启用局部事件管理，也就是在内部处理节点上配置的事件动作。
         * 初始化之后该属性的值为 {@link pin.ax.ActionMgr}的实例
         * */
        /**
         * @cfg {Function} onAction
         * 当前控件的事件局部过滤器
         * */
        /**
         * @cfg  {String|HTMLElement} appendTo
         * 当前控件插入的位置 该属性的值是jQuery选择字符串或者是dom节点
         * */
        /**
         * @cfg {Boolean} context
         * 是否检测鼠标在控件外面点击动作<br />
         * 在外面点击调用 release 方法
         * */
        /**
         * @cfg {Boolean} autoRender
         * 是否直接在初始化类的时候执行模版初始化(生成dom节点)操作
         * */
        /**
         * @cfg {Boolean} mvvmMode
         * 是否使用mvvm模式
         * */
        /**
         * @cfg {Boolean} drag
         * UI是否支持拖曳
         * */
        /**
         * @cfg {String} dragResize
         * UI是否拖曳改变大小的方向 支持 s|e|se
         * */
        /**
         * @cfg {String|HTMLElement} dragHandle
         * UI是否拖曳的节点,默认为当前view
         * */
        /**
         * @cfg {Boolean} ejsTpl
         * 是否使用ejs模版系统 必须加载 ejs.js 模版
         * */
        /**
         * @property uId
         * 实例唯一uId值
         * @type {Number}
         * */
        autoRender : false,
        mvvmMode : false,
        ejsTpl : false,
        closeAble:true,
        
        init : function(cfg){
            
            this.uId = Util.getUID();
            $.extend(this,cfg);
            this.initUI();
            
            if(this.autoRender)
                this.getView();
        },
        /**
         * 控件类初始化时执行的额外动作，一般用来为初始化属性值。在模版替换的时候能够读取到正确的值
         * @method initUI
         * @type {Function}
         * */
        initUI : $.noop,
        /**
         * @cfg {Function} afterHide
         * 控件隐藏之后的回调函数
         * */
        afterHide : $.noop,
        /**
         * @cfg {Function} afterHide
         * 控件显示之后的回调函数
         * */
        afterShow : $.noop,
        /**
         * @cfg {Function} beforeShow
         * 控件显示之前的回调函数
         * */
        beforeShow : $.noop,
        /**
         * @cfg {Function} beforeHide
         * 控件隐藏之前的回调函数
         * */
        beforeHide : $.noop,

        __show:$.noop,
        
        __hide:$.noop,
        /**
         * @cfg {Function} onViewReady
         * 控件模版初始化到dom上之后执行的回调
         * */
        onViewReady : $.noop,
        /**
         * 子类应重载该方法替代onViewReady
         * @private
         */
        innerViewReady : $.noop,
        /**
         * 根据模版以当前UI实例为map创建dom节点
         * @return {HTMLElement}
         * 返回创建的节点
         * */
        createView : function(){
            var parse = this.ejsTpl ? Tpl.ejs : Tpl.parse ;
            var v = this.view;
            if(typeof v == "string"){
                return $( parse.call(Tpl,v,this) )[0];
            } else {
                return $("<div></div>")[0];
            }
        },
        /**
         * 修改UI控件的标题文本
         * @param {String} t
         * 需设置的文本
         * */
        setTitle: function(t){
            this.jq('#pin_title').html(t);
        },
        /**
         * @cfg {String|HTMLElement} clsNode
         * 关闭节点的值,默认值为"#pin_cls"
         * */
        clsNode : '#pin_cls',
        /**
         * 绑定关闭按钮事件
         * @param {Boolean} cls
         * 是否绑定事件
         * */
        initClose : function(cls){
            if(cls)
                this.jq(this.clsNode).click(Util.bind(this.oncloseBnt,this));
        },
        /**
         * 关闭按钮执行的回调函数
         * @return {Boolean}
         * 防止执行浏览器默认事件
         * */
        oncloseBnt : function(){
            this.close();
            return false;
        },
        /**
         * 控件关闭方法 <br />
         * 如果存在onclose方法，则调用该方法。该方法返回false可以阻止关闭事件的执行。<br />
         * 根据destroy属性判断是移除dom节点还是隐藏dom节点
         * */
        close : function(){
            if(this.closeAble){
                
                if(!this.onclose || this.onclose() !== false ){
                    if(this.destroy){
                        if( this.beforeHide() === false ) return;
                        this.hidden = true;
                        this.jq().remove();
                        this.afterHide();
                        this.__hide();
                    }
                    else this.display(false);
                }
                
            }
        },
        /**
         * 当前控件失去焦点的时候的回调函数。失去焦点也就是鼠标点击了控件区域外元素。<br />
         * 只有context属性为true的时候才会起作用。
         * */
        release:function(){
            this.close();
        },
        /**
         * 根据选择器返回控件里面对应的jq对象
         * @param {String} sel
         * jq选择字符串
         * */
        jq : function(sel){
            var v =  this.getView();
            return sel === undefined ? $(v) : $(sel,v);
        },
        /**
         * 返回控件的dom节点 <br />
         * 控件没有创建dom节点的时候创建节点，执行一次之后修改函数，直接返回 view 属性
         * @return {HTMLElement}
         * 控件的dom节点
         * */
        getView : function(){
            var v = this.view;
            
            if(!v || !v.tagName){
                this.view = v = this.createView();
            }

            if(!this._getView){
                this._getView = this.getView;
                this.getView = getView;
            }
            
            if(this.appendTo){
                $(this.appendTo).append(v);
            }

            if(this.beforeToDom){
                $(this.beforeToDom).before(v);
            }
            
            if(this.closeAble !== undefined){
                this.initClose(this.closeAble);
            }
            
            
            this.innerViewReady(v);
            this.onViewReady && this.onViewReady(v);
            
            if(!this.displayLock && this.hidden !== undefined){
                var t = this.hidden;
                this.hidden = undefined;
                this.display( !t );
            }

            if(this.mvvmMode){
                this.mvvm();
            }

            return v;
        },
        nodeDisplay:function(b){
            this.jq().cssDisplay(b);
        },
        /**
         * 控制控件的显示隐藏，并触发 beforeShow、afterShow、beforeHide、afterHide 四个函数
         * */
        display : function(b){
            var drag,menu,globalEvent;
            
            this.drag && (drag = P.use('drag'));
            this.context && (globalEvent = P.use('globalEvent'));
            this.menu && (menu = P.use('MenuMgr'));

            if(this.hidden === undefined || !b !== this.hidden){
                this.displayLock = true;
                if(b){
                    if( this.beforeShow() === false ) return;
                    this.nodeDisplay(true);
                    if(this.context) globalEvent.context(this);
                    if(this.drag) drag.add(this);
                    if(this.menu) menu.add(this);
                    this.afterShow();
                    this.__show();
                } else {
                    if( this.beforeHide() === false ) return;
                    this.nodeDisplay(false);
                    if(this.context) globalEvent.release(this);
                    if(this.drag) drag.remove(this);
                    if(this.menu) menu.remove(this);
                    this.afterHide();
                    this.__hide();
                }
                delete this.displayLock;
                this.hidden = !b;
            }
            return this;
        },
        /**
        * 居中时水平方向上方占所有空白的权重，定义所有10。默认上部空白为5，即水平居中。
        * */
        horWeights: 5,
        /**
        * 居中时垂直方向上方占所有空白的权重，定义所有10。默认上部空白为5，即垂直居中。
        * */
        verWeights: 5,
        /**
         * 让控件居中显示，用户必须配置元素的 position 属性
         * */
        center : function(){
            var clientHeight = document.documentElement.clientHeight || document.body.clientHeight,
                clientWidth = document.documentElement.clientWidth || document.body.clientWidth,
                scrollTop = $(window).scrollTop(),
                scrollLeft = $(window).scrollLeft(),
                jq = this.jq(),
                marginLeft = parseInt(jq.css('marginLeft'))||0,
                marginTop = parseInt(jq.css('marginTop'))||0,
                fixed = this.jq().css('position') == 'fixed';

            if(!fixed){
                jq.css({
                    left : scrollLeft - marginLeft + (clientWidth - jq.outerWidth())*this.horWeights/10, 
                    top : scrollTop - marginTop +(clientHeight - jq.outerHeight())*this.verWeights/10
                    });
            } else {
                jq.css({
                    left : -marginLeft + (clientWidth - jq.outerWidth())*this.horWeights/10, 
                    top :  -marginTop + (clientHeight - jq.outerHeight())*this.verWeights/10
                });
            }
        },
        mvvm : function(){
            var Aval = pin.aval;
            if(Aval){
                if(this.pArr){
                    Aval.ViewModel(this,this,true);
                    Aval.View(this,this.view);
                } else {
                    if(__debug)
                        console.log('使用mvvm模式请指定pArr属性');
                }
            } else {
                if(__debug)
                    console.log('使用mvvm模式请加载ui/avalon.js模块');
            }
        }
        
    }
    
    var zindex = 10000;
    
    var indexMgr = {
        getZindex : function(){
            return ++zindex;
        },
        has : {},
        child : [],
        add : function(layer){
            var cid = layer.uId;
            if(!this.has[cid]){
                this.has[cid] = true;
                this.child.unshift(layer);
                if( this.child.length === 1 )
                    $(doc).bind('keydown',this.mgrKeyDown);
            }
        },
        remove : function(layer){
            var cid = layer.uId;
            if(this.has[cid]){
                Util.arrayRemove(this.child,layer);
                delete this.has[cid];
                if(!this.child.length)
                    $(doc).unbind('keydown',this.mgrKeyDown);
            }
        },
        mgrKeyDown:function(e){
            if(indexMgr.child.length){
                return indexMgr.child[0].onKeyDown(e);
            }
        }
    }
    
    /**
     * @class pin.ui.Layer
     * 该类继承{@link pin.ui.Base}对象，提供层级管理功能！
     * @extends pin.ui.Base
     * */
    ui.Layer = P.reg('Layer',Util.create(ui.Base,{
        /**
         * @cfg {Boolean} autoCenter
         * 是否自动居中
         * */
        autoCenter : true,
        closeAble : true,
        /**
         * @cfg {Boolean} mask
         * 是否显示遮罩
         * */
        mask : true,
        /**
         * 控件的onKeyDown回调，该回调中用户按esc会调用 oncloseBnt 方法关闭控件。
         * */ 
        onKeyDown:function(e){
            if(e.keyCode == 27){
                this.oncloseBnt();
                return false;
            }
        },
        /**
         * 获取遮罩节点的jq对象
         * @return {jQueryObject}
         * 遮罩节点的jq对象
         * */
        getMask : function(){
            if(!this.maskDom){
                this.maskDom = $(Tpl.parse('mask'));
                if(Util.ie){
                    this.iframeMask = $(Tpl.parse('iframeMask'));
                }
            }
            return this.maskDom ;
        },
        /**
         * 将当前UI控件设置到最高层
         * */
        trackZIndex:function(){
            if(this.z !== zindex){
                if(this.mask){
                    if(Util.ie){
                        this.iframeMask.css('z-index',indexMgr.getZindex());
                    }
                    this.maskDom.css('z-index',indexMgr.getZindex());
                }
                this.z = indexMgr.getZindex()
                this.jq().css('z-index',this.z);
                
                indexMgr.remove(this);
                indexMgr.add(this);
            }
        },
        
        beforeShow : function(){
            this._appendMask(true);
            indexMgr.add(this);
            this.trackZIndex();
            
        },
        afterShow : function(){
            this.autoCenter && this.center();
        },
        
        afterHide : function(){
            this._appendMask(false);
            indexMgr.remove(this);
        },
        /**
         * 自动设置遮罩层的高度
         * */
        autoMaskHeight : function(){
            if(this.mask){
                this.maskDom.height(jqWin.height());
                this.iframeMask && this.iframeMask.height(jqWin.height())
            }
            this.autoCenter && this.center();
        },
        /**
         * 添加删除遮罩节点
         * */
        _appendMask : function(b){
            if(this.mask){
                !this.maskDom && this.getMask();
                var m = this.maskDom;           
                if(b){
                    var h = jqWin.height();
                    m.height(h).appendTo('body');
                    this.iframeMask && this.iframeMask.height(h).appendTo('body');
                } else {
                    Util.ie && this.iframeMask.remove();
                    m.remove();
                }
            }
            if(b){
                jqWin.bind('resize',Util.getBind('autoMaskHeight',this));
            } else {
                jqWin.unbind('resize',Util.getBind('autoMaskHeight',this));
            }
        }
    }));
    
    /**
     * @class pin.ui.Dialog
     * @extends pin.ui.Layer
     * 对话框对象，有按钮和按钮响应事件。 
     * */
    var Dialog = ui.Dialog = P.reg('Dialog',Util.create(ui.Layer,{
        view : 'Box',
        /**
         * @cfg {String} defBnt
         * 默认选中按钮
         * */
        defBnt : 'ok',
        mask : true,
        /**
         * @cfg {String} contentHtml
         * Box模版中的内容html模版字符串
         * */
        contentHtml : 'dlgCnt',
        /**
         * @cfg {Array} buttons
         * 按钮列表,默认值为
         * <pre><code>
         * <L> [
         * <L>   { id : 'ok', title : '确&nbsp;定' },
         * <L>   { id : 'cancel', title : '取&nbsp;消' }
         * <L> ]
         * </pre></code>
         * */
        buttons:[
            {id:'ok',title:'确&nbsp;定'},
            {id:'cancel',title:'取&nbsp;消'},
        ],
        /**
         * 在实例初始化的时候调用getButton方法将 按钮列表根据模版替换成 html内容
         * */
        initUI:function(){
            if(this.buttons && this.buttons.length){
                this.getButton();
            }
        },
        /**
         * 根据模版生成按钮html内容
         * */
        getButton : function(){
            var html = '';
            $(this.buttons).each(function(i){
                html += Tpl.parse('button',this);
            });
            this.buttonHtml = html;
        },
        /**
         * 重新定义 oncloseBnt 函数内容，原始定义在{@link pin.ui.Base}中。<br />
         * 加入了对 this.onButtonClick('cancel') 返回值的判断。
         * @return {Boolean}
         * 返回false 防止浏览器默认事件的执行
         * */
        oncloseBnt : function(){
            if(this.onButtonClick('cancel') !== false){
                this.close();
            }
            return false;
        },
        /**
         * 按钮的回调事件
         * @param {String} eid
         * 按钮的id,在 buttons 数组中定义的id
         * */
        onButtonClick : function(eid){
            if(__debug) console.log('点击了'+eid+'按钮');
        },
        /**
         * 设置默认按钮
         * */
        setFocus : function(bnt){
            if(bnt || this.defBnt){
                this.jq('#pin_bnt_'+ (bnt || this.defBnt)).focus();
            }
        },
        afterShow:function(){
            ui.Layer.prototype.afterShow.apply(this,arguments);
            if(this.defBnt)
                 this.setFocus();
        },
        innerViewReady : function(){
            var that = this;
            this.jq('#pin_dlg_bnts').click(function(e){
                var bnt,el = e.target;
                while(el !== this){
                    if(el.id && el.id.indexOf('pin_bnt_') === 0){
                        bnt = el.id;
                        break;
                    }
                    el = el.parentNode;
                }
                if(bnt){
                    var eid = bnt.substr(8);
                    if(that.buttons){
                        $(that.buttons).each(function(){
                            if(eid == this.id){
                                var ret;
                                if(that['on'+eid]){
                                    ret = that['on'+eid]();
                                }
                                if(ret !== false){
                                    if(that.onButtonClick(eid) !== false){
                                        that.close();
                                    }
                                }
                            }
                        });
                    }
                }

                if( e.target.tagName == 'A' && $(e.target).attr('href') != '#') return true;
                if( !$(e.target).attr('jd') )   return false;
            });
        }
    }));
    /**
     * @class pin.ui.Tips
     * 该类提供控件鼠标不在控件内部的时候，延时关闭该控件
     * @extends pin.ui.Layer
     * */
    var Tips = ui.Tips = P.reg('Tips',Util.create(ui.Layer,{
        view : 'Box',
        /**
         * @cfg {Number} timeOutHide
         * 设置超时时间
         * */
        timeOutHide : 1500,
        /**
         * @cfg {Boolean} stayHover
         * 是否为控件绑定hover事件，当鼠标在控件内部的时候不计算时间。只有鼠标移出去之后才开始计算超时。
         * */
        stayHover : false,
        timeID : 0,
        mask : false,
        /**
         * @cfg {Boolean} autoHide
         * 是否在afterShow回调执行之后马上开始设置超时函数。
         * */
        autoHide : true,
        innerViewReady:function(){
            var that = this;
            if(this.stayHover){
                this.jq().hover(
                    Util.bind(this.mouseOver,this),
                    Util.bind(this.mouseOut,this)
                );
            }
        },
        mouseOver : function(){
            this.clearHideTimer();
        },
        mouseOut : function(){
            this.setHideTimer();
        },
        clearHideTimer : function(){
            if(this.timeID){
                clearTimeout(this.timeID);
                this.timeID = 0;
            }
        },
        /**
         * 设置超时函数，开始记时
         * */
        setHideTimer : function(){
            if(!this.timeID){
                this.timeID = setTimeout(Util.getBind('TimeHide',this),this.timeOutHide);
            }
        },
        /**
         * @cfg {Function} onTimeHide
         * 当超时的回调函数，该该类默认的提供的功能是隐藏控件。
         * */
        TimeHide : function(){
            this.timeID = 0;
            if( this.onTimeHide && typeof this.onTimeHide == 'function'){
                this.onTimeHide();
            } else {
                this.close();
            }
        },
        afterShow : function(){
            if( ui.Layer.prototype.afterShow.apply(this,arguments) === false){
                return false;
            }
            this.clearHideTimer();
            this.autoHide && this.setHideTimer();
        },
        afterHide : function(){
             ui.Layer.prototype.afterShow.apply(this,arguments);
             this.clearHideTimer();
        }
    }));
    
    /**
     * @class pin.ui.MsgBox
     * 常用对话框集合
     * */
    var MsgBox = ui.MsgBox = P.reg('MsgBox',{
        /**
         * 获得库中公用对话框实例
         * */
        getSysDlg : function(){
            var d = this._dlgSysBox;
            if(!d){
                d = this._dlgSysBox = P.use('Dialog',{
                    appendTo:document.body,
                    title : '提示',
                    cs : 'win-fixed win-msgbox',
                    closeAble : true,
                    autoCenter : false,
                    dlgContentHtml : 'msgContentHtml',
                    buttons:[
                        {id:'ok',title:'确&nbsp;定'},
                        {id:'cancel',title:'取&nbsp;消'},
                        {id:'yes',title:'&nbsp;是&nbsp;'},
                        {id:'no',title:'&nbsp;否&nbsp;'},
                        {id:'close',title:'关&nbsp;闭'}                   
                    ],
                    setContent : function(html){
                        this.jq('#msgdlg_ct').html(html);
                    },
                    setIcon : function(icon){
                        var jq = this.jq('#msgdlg_icon');
                        jq.attr('class',jq.attr('class').replace(/icon-\S+/i, 'icon-'+icon))
                    },
                    afterHide : function(){
                        ui.Dialog.prototype.afterHide.apply(this,arguments);
                        this.onButtonClick = ui.Dialog.prototype.onButtonClick;
                    }
                });
            } 
            return d;
        },
        /**
         * 获取系统tips浮层
         * */
        getSysTips : function(){
            var d = this._sysTips;
            if(!d){
                d = this._sysTips = P.use('Tips',{
                    appendTo:document.body,
                    title : '提示',
                    dirCss : 'top',
                    closeAble : true,
                    view:"Tips",
                    context:true,
                    stayHover:true,
                    setContent : function(html){
                        this.jq('#tips_ct').html(html);
                    },
                    setDir : function(icon){
                        var jq = this.jq('.cur');
                        jq.attr('class','cur '+icon)
                    },
                    setTimeout:function(time){
                        this.timeOutHide = time
                    },
                    showDir:function(b){
                        this.jq('.cur').cssDisplay(b);
                    },
                    setAnchor : function(el){
                        this.anchor = el;
                    },
                    offset:'tc',
                    afterShow:function(){
                        if (this.anchor ){
                            Util.offsetTo(this.offset,this.anchor,this.view);
                            this.clearHideTimer();
                            this.autoHide && this.setHideTimer();
                        } else {
                            ui.Tips.prototype.afterShow.apply(this,arguments);
                        }
                    }
                    
                });
            } 
            return d;
        },
        /**
         * 获得库中公用定向弹出框实例
         * */
        getAnchorDlg : function(){
            var d = this._anchordlgBox;
            if(!d){
                d = this._anchordlgBox = P.use('Dialog',{
                    appendTo:document.body,
                    cs : 'anchorBox',
                    closeIcon:'anchorClose',
                    closeAble : true,
                    mask:false,
                    autoCenter : false,
                    dlgContentHtml : 'AnchorContentHtml',
                    buttons:[
                        {id:'ok',title:'确&nbsp;定'},
                        {id:'cancel',title:'取&nbsp;消'}          
                    ],
                    setContent : function(html){
                        this.jq('#msgdlg_ct').html(html);
                    },
                    setIcon : function(icon){
                        var jq = this.jq('#msgdlg_icon');
                        jq.attr('class',jq.attr('class').replace(/anchor-\S+/i, 'anchor-'+icon));
                    },
                    setAnchor : function(el){
                        this.anchor = el;
                    },
                    afterShow:function(){
                        Util.silt('tc',this.anchor,this.view,1, function(){ui.Dialog.prototype.afterShow.apply(this,arguments)});
                    },
                    beforeHide:function(){
                        Util.silt('tc',this.anchor,this.view,0, function(){ui.Dialog.prototype.afterShow.apply(this,arguments)});
                        this.afterHide();
                        return false;
                    }
                });
            } 
            return d;
        },
        /**
         * 弹出定向确认框
         * @param {String|HTMLElement} el
         * 定向目标
         * @param {String} msg
         * 弹出框消息内容
         * @param {Function} [fn]
         * 按钮回调函数
         * */
        anchorConfirm : function(el,msg,fn){
            var d = this.getAnchorDlg();
            d.setContent(msg);
            d.setIcon('confirm')
            d.setAnchor(el);
            fn && (d.onButtonClick = fn);
            d.display(true);
        },
        /**
         * 普通消息提示框
         * @param {String} title
         * 弹出框标题
         * @param {String} msg
         * 弹出框消息内容
         * @param {Function} [callback]
         * 按钮回调函数
         * @param {String} [bnt]
         * 按钮列表 以竖线分隔 "ok|cancel|ok|no|close"
         * @param {String} [icon]
         * 设置对话框图标 图标列表：alert,success,confirm,error
         * @param {String} [dnf]
         * 默认按钮的ID
         * @return {pin.ui.Dialog}
         * 返回对话框实例
         * */
        alert : function(title,msg,callback,bnt,icon,dnf){
            var d = this.getSysDlg(),bnts = d.buttons;
            !dnf && (dnf = 'ok');
            !bnt && (bnt = 'ok');
            !icon && (icon = 'alert')
            for(var i = 0,len = bnts.length;i<len;i++){
                d.jq('#pin_bnt_'+bnts[i].id).cssDisplay(bnt.indexOf(bnts[i].id) >= 0);
            }
            d.defBnt = dnf;
            title && d.setTitle(title);
            msg && d.setContent(msg);
            icon && d.setIcon(icon);
            callback && (d.onButtonClick = callback);
            d.display(true);
            return d;       
        },
        /**
         * 确认提示框
         * @param {String} title
         * 弹出框标题
         * @param {String} msg
         * 弹出框消息内容
         * @param {Function} [callback]
         * 按钮回调函数
         * @param {String} [dnf]
         * 默认按钮的ID
         * @return {pin.ui.Dialog}
         * 返回对话框实例
         * */
        confirm :function(title,msg,callback,dnf){
            return this.alert(title,msg,callback,'ok|cancel','confirm',dnf);
        },
        /**
         * 成功消息提示框
         * @param {String} title
         * 弹出框标题
         * @param {String} msg
         * 弹出框消息内容
         * @param {Function} [callback]
         * 按钮回调函数
         * @param {String} [bnt]
         * 按钮列表 以竖线分隔 "ok|cancel|ok|no|close"
         * @param {String} [dnf]
         * 默认按钮的ID
         * @return {pin.ui.Dialog}
         * 返回对话框实例
         * */
        success : function(title,msg,callback,bnt,dnf){
            return this.alert(title,msg,callback,bnt || 'ok','success',dnf);
        },
        /**
         * 错误消息提示框
         * @param {String} title
         * 弹出框标题
         * @param {String} msg
         * 弹出框消息内容
         * @param {Function} [callback]
         * 按钮回调函数
         * @param {String} [bnt]
         * 按钮列表 以竖线分隔 "ok|cancel|ok|no|close"
         * @param {String} [dnf]
         * 默认按钮的ID
         * @return {pin.ui.Dialog}
         * 返回对话框实例
         * */
        error : function(title,msg,callback,bnt,dnf){
            return this.alert(title,msg,callback,bnt || 'ok','error',dnf);
        },
        bigMsg:function(msg,callback){
            var box = P.use('Layer',{
                appendTo:document.body,
                cs : 'win-fixed big-win-msgbox',
                closeAble : true,
                view:"Box",
                destroy:true,
                content:msg,
                onclose:callback || $.noop,
                contentHtml : 'big-win-msgbox'
            });
            box.display(1);
            return box
        },
        bigconfirm:function(msg,okCallBack,cancelCallBack,okTxt,cancelTxt){
            var box = P.use('Layer',{
                appendTo:document.body,
                cs : 'win-fixed big-win-msgbox',
                closeAble : true,
                view:"Box",
                destroy:true,
                content:msg,
                okTxt:okTxt||"确定",
                cancelTxt:cancelTxt||"取消",
                contentHtml : 'bigconfirm',
                onViewReady:function(){
                    var that = this;
                    this.jq('#pin_ok').click(function(){
                        (okCallBack || $.noop)();
                        that.close();
                        return false;
                    })
                    this.jq('#pin_cancel').click(function(){
                        (cancelCallBack || $.noop)();
                        that.close();
                        return false;
                    })
                }
            });
            box.display(1);
            return box
        },
        tips:function(msg,time,anchor,callback,showDir,dir,offset){
            var d = this.getSysTips();
            time = time || 1500
            showDir = showDir || false
            dir  = dir || 'top'
            offset = offset || 'tc'
            d.offset = offset
            d.setContent(msg)
            d.setTimeout(time)
            d.setDir(dir)
            d.showDir(showDir)
            d.setAnchor(anchor)
            d.onclose = callback || $.noop;
            d.display(1)
            return d
        }
    });
    
    P.reg('globalEvent',function(){
        var global = {
                /**
                 * 往控制列表中加入UI实例
                 * @param {pin.ui.Base} uiObj
                 * 继承{@link pin.ui.Base}的类的实例
                 * */
                context : function(uiObj){
                    if(uiObj.contexted) return;
                    var list = this.list;
                    if(list === undefined) this.list = list = [];
                    list[list.length] = uiObj;
                    uiObj.contexted = true;
                    if(!this.addGlobalEvent){
                        this.addGlobalEvent = true;
                        $(doc).mousedown(Util.bind(this._docHandler,this));
                    }
                },
                /**
                 * 从队列中删除uiObj对象
                 * @param {pin.ui.Base} uiObj
                 * 继承{@link pin.ui.Base}的类的实例
                 * @param {Boolean} enforce
                 * 强制删除
                 * */
                release : function(uiObj,enforce){
                    if(uiObj.contexted && ( uiObj.mousedown == void 0 || enforce) ){
                        uiObj.contexted = false;
                        this.list && Util.arrayRemove(this.list,uiObj);                     
                    }
                },
                releaseAll : function(e){
                    var list = this.list,src = e.target;
                    for(var s = list.length - 1;s >= 0;s--){
                        list[s].mousedown && list[s].mousedown(e);
                        if(src && !Util.ancestorOf($(list[s].view)[0],src,true)){
                            list[s].release(e);
                            if($.inArray(e.target.nodeName,['HTML','SELECT','INPUT','TEXTAREA'])==-1)
                                e.preventDefault();
                        }
                    }
                },
                _docHandler : function(e){
                    this.releaseAll(e);
                }
        }
        
        P.reg('globalEvent',global,true);

        return global;
    });
    

    return ui;

});