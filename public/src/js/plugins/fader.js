define(['jquery',"pin"],function($,pin){

	var Util = pin.util;
	/**
	 * @class pin.mod.fader
	 * 滑动类
	 * */
	$.extend($.easing,{
		easeIn:function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOut:function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOut:  function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
              if (s == undefined) s = 1.70158;
              return c*(t/=d)*t*((s+1)*t - s) + b;
       },
       easeOutBack: function (x, t, b, c, d, s) {
              if (s == undefined) s = 1.70158;
              return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
       },
       easeInOutBack: function (x, t, b, c, d, s) {
              if (s == undefined) s = 1.70158;
              if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
              return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
       }
	});
	  
	pin.reg('fader',Util.create({
		/**
		 * @cfg {String|jqObject} content
		 * 滑动主体
		 * */
		content : '',
		/**
		 * @cfg {String|jqObject} switchItem
		 * 滑动的控制项
		 * */
		switchItem : '',
		/**
		 * @cfg {String|jqObject} selectItemCss
		 * 滑动控制项选中的Class
		 * */
		selectItemCss : 'chk',
		/**
		 * @cfg {String|jqObject} itemSelectEvent
		 * 滑动控制项触发选择的事件 默认是click
		 * */
		itemSelectEvent : 'click',
		/**
		 * @cfg {String|jqObject} prv
		 * 滑动控制项向前
		 * */
		prv : '',
		/**
		 * @cfg {String|jqObject} next
		 * 滑动控制项向后
		 * */
		next : '',
		/**
		 * @cfg {Number} timeOut
		 * 滑动动画时间
		 * */
		timeOut : 500,
		/**
		 * @cfg {Number} timeSpacing
		 * 两次滑动的间隔  在自动运行中起作用
		 * */
		timeSpacing : 3000,
		/**
		 * @cfg {Number} hoverTime
		 * itemSelectEvent为 mouseover 时候的延时确认触发时间
		 * */
		hoverTime : 0,
		/**
		 * @cfg {String|jqObject} view
		 * 主体的父级
		 * */
		view : '',
		/**
		 * @cfg {String} changeCssName
		 * 动画改变的css属性值
		 * */
		changeCssName : 'left',
		/**
		 * @cfg {Boolean} autoRun
		 * 滑动是否自动运行
		 * */
		autoRun : false,
		/**
		 * @cfg {Number} offset
		 * 一次滑动的数量
		 * */
		offset : 1,
		/**
		 * @cfg {String} actionName
		 * 滑动处理函数 目前有3个 
		 * show: 普通滑动，前后滚动距离很大<br />  
		 * carousel: 循环圆形滚动，不能精确滚动到具体位置<br/>
		 * sentinel : show的升级版本可以精确的定位滚动位置的 循环滚动。没有很大跨度的动画问题。
		 * */
		actionName : 'show',
		/**
		 * @property contentWidth
		 * 单项宽度
		 * @type {Number}
		 * */
		contentWidth : 0,
		/**
		 * @property timeId
		 * 延时的timeId
		 * @type {Number}
		 * */
		timeId : 0, 
		/**
		 * @property index
		 * 当前显示的索引
		 * @type {Number}
		 * */
		index : 0,

		easing:'linear',

		/**
		 * @cfg {String} dir
		 * 方向 horizontal|vertical
		 * 当前显示的索引
		 * @type {Number}
		 * */

		dir:'horizontal',

		init : function(cfg){
			$.extend(this,cfg);

			this.view = $(this.view);
			this.switchItem = $(this.switchItem);
			this.prv = $(this.prv);
			this.next = $(this.next);
			this.content = this.view.find(this.content);
			if(this.dir == "horizontal"){
				this.contentWidth  = this.content.eq(1).outerWidth(1);
			} else {
				this.contentWidth  = this.content.eq(1).outerHeight(1);
			}
			this.length = this.content.length;
			
			var that = this;
			var itemRun = function(i){
				that.view.stop(1,1);
				that.direct(i,0);
			}

			this.switchItem.each(function(i){

				if(that.itemSelectEvent == 'mouseover' && that.hoverTime){
					var _hoverId = 0;
					$(this).hover(function(){
						_hoverId = setTimeout(function(){
							itemRun(i);
							clearTimeout(that.timeId);
						},that.hoverTime);
					},function(){
						clearTimeout(_hoverId);
					})
				} else {

					$(this)[that.itemSelectEvent](function(){itemRun(i)});

				}

			})
			.click(function(){
				return false;
			});

			this.prv.click(function(){
				that.direct(that.index,-1);
				return false;
			});

			this.next.click(function(){
				that.direct(that.index,1);
				return false;
			});

			if(that.autoRun){

				this.view.add(this.switchItem).hover(function(){
					that.view.stop(1,1);
					clearTimeout(that.timeId);
				},function(){
					that.timeId = setTimeout(function(){that.direct(that.index,1);},that.timeSpacing);
				});

			}

			this.direct(0,0);
		},
		direct : function(){
			clearTimeout(this.timeId);
			this[this.actionName].apply(this,arguments);

			var that = this;
			var i = this.index;

			if(this.autoRun){
				this.timeId = setTimeout(function(){that.direct(i,1);},this.timeSpacing);
			}
		},
		show : function(i,offset){
			var animateObj = {};
			var that = this;
			i= i + offset * this.offset;
			if(i >= this.length) i=0;
			if(i <= -1) i=this.length-this.offset;
			this.index = i;
			animateObj[this.changeCssName] = -i * this.contentWidth;
			that.switchItem.removeClass(that.selectItemCss);
			that.switchItem.eq(i).addClass(that.selectItemCss);
			this.view.animate(animateObj,this.timeOut,that.easing,function(){});
		},
		carousel : function(i,offset){
			var animateObj = {};
			var that = this;
			if(offset && this.length > this.offset){

				var changeLen = this.length >= this.offset*2 ? this.offset : this.length - this.offset;

				if(offset == 1){
					animateObj[this.changeCssName] = -changeLen * this.contentWidth;

					this.view.animate(animateObj,this.timeOut,that.easing,function(){
						$(that.content.selector +':lt('+changeLen+')').appendTo(that.view)
						that.view.css(that.changeCssName,0);
					});
				} else {
					that.view.css(that.changeCssName,-changeLen * this.contentWidth);
					$(that.content.selector +':gt('+( this.length - changeLen -1 )+')').prependTo(that.view);
					animateObj[this.changeCssName] = 0;

					this.view.animate(animateObj,this.timeOut,that.easing);
				}
			}

		},
		sentinel : function(i,offset){
			var animateObj = {};
			var that = this;
			var adv = false;

			this.view.stop(1,1);

			i= i + offset * this.offset;
			if(i >= this.length) i=0;
			if(i <= -1) i=this.length-this.offset;
			if( i < this.index ) adv = true;
			this.index = i;

			var selV = that.content.filter(':eq('+i+')');

			that.switchItem.removeClass(that.selectItemCss);
			that.switchItem.eq(i).addClass(that.selectItemCss);

			if(selV.index() == 0) return;

			if(adv){
				
				that.view.css(that.changeCssName,- this.contentWidth);
				selV.prependTo(that.view);
				
				animateObj[this.changeCssName] = 0;
				this.view.animate(animateObj,this.timeOut,that.easing);

			} else {

				animateObj[this.changeCssName] = -this.contentWidth;

				this.view.children(":eq(0)").after(selV);

				this.view.animate(animateObj,this.timeOut,that.easing,function(){
					selV.prependTo(that.view)
					that.view.css(that.changeCssName,0);
				});
			}
		}

	}));

});
