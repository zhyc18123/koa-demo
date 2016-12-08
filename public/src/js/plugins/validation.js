define(['jquery',"pin"],function($,pin){

	(function(P,$){
		var Util = P.util;
		
		var globeValidators = {	};
		/**
		 * @class pin.ax.Validator
		 * 验证器类
		 * <pre><code>
		 * //例子
		 * pin.use('Validator',{
		 * <L> form : '#form1',
		 * <L> target : '#submitBnt',
		 * <L> validators : {
		 * <L>   nickChk : function(elem,val,data,next){
		 * <L>      //elem :当前验证的元素,val:当前元素的值,data:当前验证器的配置值,next:下一个验证的回调函数 
		 * <L>      if(data.name != 'nick'){
		 * <L>          this.data.m = '验证不通过';
		 * <L>          this.report(false);
		 * <L>      } else {
		 * <L>          this.report(true);
		 * <L>      }
		 * <L>      next();
		 * <L>      //记得在report后进行next回调！
		 * <L>   }
		 * <L> },
		 * <L> onsuccess : function(data){
		 * <L>     var that = this;
		 * <L>     this.lock(true);
		 * <L>     pin.postReq(submitUrl,data,function(e){
		 * <L>         if(e.isOk()){
		 * <L>             pin.ui.MsgBox.success('','提交成功')
		 * <L>         } else {
		 * <L>             pin.ui.MsgBox.error('','提交失败');
		 * <L>         }
		 * <L>         that.lock(false);
		 * <L>     });
		 * <L> }
		 * });
		 * </pre></code>
		 * */
		var Validator = P.reg('Validator',Util.create({
			 /**
			  * @property form
			  * 当前验证器对应的表单
			  * @type {HTMLElement}
			  * @name form
			  * */
			 /**
			  * @property elements
			  * 当前验证器的元素列表，可直接配置 <br />
			  * 如果是自己配置的话那么该值为jq对象或者是纯dom节点的数组
			  * @type {Array}
			  * */
			 /**
			  * @property ItemChk
			  * 单元素验证对象实例，用来处理单个元素的验证
			  * @type {pin.ax.ItemChk}
			  * */
			 /**
			  * @property target
			  * 提交按钮，可以是HTMLElement或者是jq选择器
			  * @type {HTMLElement|String}
			  * */
			/**
			 * 初始化方法
			 * @param {Object} cfg 配置对象
			 * */
			init:function(cfg){
				$.extend(this,cfg);
				var fn = Util.bind(this.submit,this);
				this.form = $(this.form)[0] || {};
				this.elements = this.getElement();
				this.ItemChk = P.use("ItemChk");
				if(this.target)
					$(this.target).click(fn);
				this.form.onsubmit = fn;
			},
			/**
			 * 获取通过提示节点的选择器的属性值
			 * @type {String}
			 * */
			okTip:"okTip",
			/**
			 * 获取失败提示节点的选择器的属性值
			 * @type {String}
			 * */
			errTip:"errTip",
			/**
			 * 单个元素通过时的回调函数 
			 * @method passTip
			 * */
			passTip:$.noop,
			/**
			 * 单个元素失败时的回调函数
			 * @method errorTip
			 * */
			errorTip:$.noop,
			/**
			 * 锁定标记，当他值为真是。验证器锁定不进行不触发验证动作
			 * @type {Boolean}
			 * */
			_lock:false,
			/**
			 * 是否 输出所有的错误消息。
			 * 元素可能会有很多个验证器。每个验证器都有错误消息，该状态标识是否输出所以错误消息还是只输出第一条错误消息。
			 * */
			errMsgAll : false,
			//执行所以的验证，不是当第一个错误就上报
			/**
			 * 单个元素是否进行所有验证器的验证
			 * 默认为不进行所有验证器的验证，当遇到第一个错误的时候就终止验证。
			 * */
			elemAllChk : false,
			/**
			 * 锁定验证器，获取锁定状态
			 * 没有参数的时候返回锁定状态，有参数为设置锁定状态值。
			 * @param {Boolean} [val]
			 * 锁定状态的值
			 * */
			lock:function(val){
				if(val!=undefined)
					this._lock = val;
				else
					return this._lock;
			},
			/**
			 * @property idx
			 * 当前执行验证的元素的下标，初始化为-1
			 * */
			/**
			 * @property errorElem
			 * 第一个错误元素的下标,初始化为-1
			 * */
			/**
			 * @property data
			 * 经过验证后的元素名称和值的键值对
			 * */
			/**
			 * 验证器触发函数，调用可以执行验证过程
			 * */
			submit : function(){
				if(!this.lock()){
					this.idx = -1;
					this.lock(true);
					this.errorElem = -1;
					this.data = {};
					if(this.elements.length){
						this.elemTest();
					}
				}
				return false;
			},
			/**
			 * 局部验证器，定义在验证对象中的特殊验证器
			 * 当某个验证对象有特殊的验证需求的时候可以单独定制验证器
			 * @type {Object}
			 * */
			validators : {
				
			},
			/**
			 * 元素初始化表单元素，将表单元素特殊进行封装
			 * @return {Array}
			 * 返回封装好的对象
			 * */
			getElement : function(){
				var elements = this.form.elements || this.elements,
					that = this,
					arr = [];
				this.jqElements = $(elements);
				$.each(elements,function(){
					var jq = $(this);
					if(!jq.attr('disable') && jq.attr('vjd')){
						var vjd = that.getValData(jq.attr('vjd'),jq);
						arr.push({elem:this,data:vjd});
					}
				});
				return arr;
			},
			/**
			 * 验证成功回调函数
			 * @param {Object} data
			 * 验证器收集的表单数据
			 * 
			 * @method onsuccess
			 * */
			onsuccess:$.noop,
			/**
			 * 收集表单元素的数据
			 * @return {Object}
			 * 以元素name字段和值组成的键值对
			 * */
			collectValue:function(){
				var el = this.form.elements,
					data = {};
				for (var s = 0,len = el.length; s < len; s++) {
					var elem = el[s];
					if($.inArray(elem.nodeName,['SELECT','INPUT','TEXTAREA'])!=-1){
						var type  = elem.type;
						if( type === 'radio' || type === 'checkbox' ){
							if(!elem.checked)
								continue;
						}else if(type === 'submit'){
							continue;
						}
						if(type === 'checkbox' ){
							if(!$.isArray(data[elem.name])) {
								if(data[elem.name]){
									data[elem.name] = [data[elem.name]];
								}else{
									data[elem.name] = [];
								}
							}
							data[elem.name].push(elem.value);
						} else{
							if(data[elem.name] == undefined && elem.name){
								data[elem.name] = elem.value;
							}
						}
					}
				}
				return data;
			},
			/**
			 * 触发单个元素的验证
			 * @param {String|HTMLElement} elem
			 * jq选择器或者是dom节点
			 * */
			oneElem : function(elem){
				var that = this;
				var val = false;
				if(typeof elem == 'string'){
					elem = $(elem)[0];
				}
				if(!this.lock()){

					$(this.elements).each(function(i){
						if(this.elem == elem){
							var itemChk = P.use("ItemChk");
							var flag = itemChk.reset({
								data : that.elements[i].data,
								valObj : that,
								elem : that.elements[i].elem,
								oneElemTest : true
							});
							if(flag == true){
								val = itemChk.value();
							}

							itemChk = null;
							return false;
						}
					});
				}
				return val;
			},
			/**
			 * 主验证函数 触发单个元素的验证，然后通过单个元素的验证的回调完成所有元素的验证 <br />
			 * 重置验证器状态可以不使用参数触发验证。
			 * @param {Number} [errorNum]
			 * 错误数
			 * @param {String} [name] 
			 * 元素的名称
			 * @param {String} [val]
			 * 元素的值
			 * */
			elemTest : function(errorNum,name,val){
				if(this.errorElem == -1){
					if(errorNum)
						this.errorElem = this.idx;
					if(this.idx !== -1){
						this.data[name] = val;
					}
				}
				this.idx++;
				if(this.idx == this.elements.length){
					this.lock(false);
					if(this.errorElem !== -1){
						$(this.elements[this.errorElem].elem).focus();
					} else if(this.onsuccess(this.collectValue()) !== false ){
						this.form.submit();
					}
				} else {
					this.ItemChk.reset({
						data : this.elements[this.idx].data,
						valObj : this,
						elem : this.elements[this.idx].elem
					});
				}
			},
			/**
			 * 获取指定名称的验证函数
			 * @param {String} Vname
			 * 验证器的名称
			 * */
			getValidators : function(vname){
				if(this.validators[vname]){
					return this.validators[vname];
				} else if(globeValidators[vname]){
					return globeValidators[vname];
				} else {
					if(__debug)
						console.error('未找到名称为:'+vname+'的验证器');
					return $.noop;
				}
			},
			/**
			 * 获取指定元素的验证器列表，并且执行预处理函数
			 * @param {String} vjd 
			 * 验证器描述字符串
			 * @param {jQueryObject} jq
			 * 指定元素的jq对象
			 * @return {Array}
			 * 验证器列表
			 * */
			getValData:function(vjd,jq){
				var vdata = [],
					that = this;
				if(jq.data('vData')){
					vdata = jq.data('vData')
				} else {
					var dArr = vjP.split('|');
					$(dArr).each(function(){
						var val = this,
							itemData = {},
							vName = val.split('=')[0];
						if(val.length == 0){
							if(__debug)
								console.error('错误的vjd:' + vjd,jq[0]);
						}
						if(vName.charAt(0)=="_"){
							itemData.advance = true;
							vName = vName.substr(1);
						}
						itemData.vName = vName;
						if(val.split('=').length==2){
							val = val.split('=')[1];
							$.extend(itemData,Util.parseKnV(val))
						}
						vdata.push(itemData);
					});
					jq.data('vData',vdata);
				}
				for(var i = 0;i < vdata.length;i++){
					if(vdata[i].advance){
						that.getValidators(vdata[i].vName).call(that,jq[0],vdata[i]);
						Util.arrayRemove(vdata,vdata[i]);
						i--;
					}
				}
				return vdata;
			}
		}));
		
		
		P.ax.Validator = Validator;
		/**
		 * 注册验证器 <br />
		 * 该方法我也不知道放那里 ext-doc没有提供<br />
		 * 不是实例的方法是类外的方法，实例访问不到的 <br />
		 * 我们可以这样访问 
		 * <pre><code>pin.ax.Validator.reg('ne',function(){});</pre></code>
		 * @param {String} name
		 * 验证器的名称
		 * @param {Function} fn
		 * 验证器的回调函数
		 * @method reg
		 * @singleton
		 * @return {pin.ax.Validator}
		 * 返回Validator类本身
		 * */
		Validator.reg = function(name,fn){
			if(globeValidators[name]){
				if(__debug)
					console.log('已存在验证器:'+name);
			} else {
				globeValidators[name] = fn;
			}
			return this;
		}
		
		/**
		 * @class pin.ax.ItemChk
		 * 单个元素验证过程,由Validator实例调用
		 * */
		var ItemChk = P.reg('ItemChk',Util.create({
			init:$.noop,
			_value:undefined,
			/**
			 * 获取|设置 该元素的值
			 * @param {Object} [val]
			 * @return {Object|null}
			 * 当没有传递参数进来的时候返回该元素的值，否则返回空。
			 * */
			value:function(val){
				if(val == undefined){
					return this._value;
				} else {
					this._value = val;
				}
			},
			/**
			 * 上报好函数，在验证器回调函数中调用。
			 * @param {Boolean} state
			 * 验证成功或者失败
			 * */
			report:function(state){
				if(state == false){
					this.error++;
					this._m.push(this.data.m);
					this.onerror();
				}
			},
			/**
			 * 获取错误描述 <br />
			 * 根据{@link pin.ax.Validator}实例的errMsgAll配置获取错误描述<br />
			 * true ：获取所有的错误描述信息<br />
			 * false: 获取第一个错误描述 
			 * */
			getErrMsg : function(){
				if(this.valObj.errMsgAll){
					return this._m.join(',');
				} else {
					return this._m[0];
				}
			},
			/**
			 * @property data
			 * 验证数据对象，他的结果是<br />
			 * <pre><code> 
			 * //vjd是验证配置列表，m是当前错误信息。
			 * <L> data : {
			 * <L>   vjd : [{Vname:'ne'},{Vname:'ft'}],
			 * <L>   m  : ""
			 * <L> }
			 * </pre></code>
			 * @type {Object}
			 * */
			 /**
			  * @property oneElemTest 
			  * 单个元素验证
			  * @type {Boolean}
			  * */
			 /**
			  * @property error 
			  * 错误总数
			  * @type {Number}
			  * */
			 /**
			  * @property idx 
			  * 当前执行的验证器下标，默认为-1
			  * @type {Number}
			  * */
			/**
			  * @property _m 
			  * 错误描述数组
			  * @type {Array}
			  * */
			/**
			  * @property elem 
			  * 当前元素的DOM节点
			  * @type {HTMLElement}
			  * */ 
			/**
			  * @property valObj 
			  * 引用该实例的{@link pin.ax.Validator}实例
			  * @type {pin.ax.Validator}
			  * */
			/**
			 * 重置对象开始元素验证
			 * @param {Object} cfg
			 * 配置信息，根据配置 重置实例。
			 * */
			reset : function(cfg){
				$.extend(this,cfg);
				this.data = this.clone(cfg.data);
				this.oneElemTest = cfg.oneElemTest || false;
				this.value( this.getValue(cfg.elem) );
				this.error = 0;
				this._m = [];
				this.idx = -1;
				this.next();
				return this.error == 0;
			},
			getValue : function(elem){
				var type = elem.type;
				var jqElem = $(elem.type);
				if(type == "checkbox" || type=="radio"){
					var sel = this.jqElements.filter('name["'+jqElem.attr('name')+'"]');
					if(sel.length == 0){
						return "";
					} else {
						if(type == "checkbox"){
							var returnValue = [];
							sel.each(function(){
								returnValue.unshift(this.value);
							});
							return returnValue;
						} else {
							return sel.val();
						}
					}
				} else {
					return $(elem).val();
				}
			},
			/**
			 * 为验证配置数组创建新的拷贝(为了防止修改data内容影响到{@link pin.ax.Validator}实例中的值)
			 * @param {Object} data
			 * 当前元素的验证配置数组
			 * @return {Object}
			 * 返回拷贝后的配置对象(不是数组,对拷贝进行了封装)
			 * */
			clone : function(data){
				var arr = [];
				$(data).each(function(){
					arr.push($.extend({},this));
				});
				return {vjd:arr};
			},
			/**
			 * @event onpass
			 * 验证通过时的回调函数
			 * */
			onpass:function(){
				this.passTip();
				if(__debug)
					console.log("验证通过 ",this.elem);
			},
			/**
			 * 验证通过提示控制函数
			 * */
			passTip : function(){
				var okTip = $(this.elem).attr('okTip'),errTip = $(this.elem).attr('errTip');
				if(okTip){
					$(okTip).cssDisplay(1);
				}
				if(errTip){
					$(errTip).cssDisplay(0);
				}
				this.valObj.passTip.call(this);
			},
			/**
			 * 验证不通过提示控制函数
			 * */
			errorTip : function(){
				var okTip = $(this.elem).attr('okTip'),errTip = $(this.elem).attr('errTip');
				if(okTip){
					$(okTip).cssDisplay(0);
				}
				if(errTip){
					$(errTip).cssDisplay(1).html(this.getErrMsg());
				}
				return this.valObj.errorTip.call(this);
			},
			/**
			 * @event onerror
			 * 验证没有通过时的回调函数
			 * @param {Boolean} [trigger]
			 * 是否调用错误提示控制函数
			 * */
			onerror:function(trigger){
				if(trigger){
					 return this.errorTip();
				} else {
					if(__debug)
						console.error("验证器\""+ this.data.vjd[this.idx].vName+"\"未通过 ",this.elem);
				}
			},
			/**
			 * 执行验证器列表中的下一个验证器，当验证器到达末尾的时候回调{@link pin.ax.Validator}实例的elemTest方法进行下一个元素的验证。
			 * */
			next : function(){
				var vjd = this.data.vjd
					,that = this
					,valObj = this.valObj;
				this.idx++;
				if( this.error != 0){
					if( this.reportError() === false ) return;
					if(valObj.elemAllChk != false){
						!this.oneElemTest && valObj.elemTest(this.error,this.elem.name,this.value());
					} else {
						this.valObj.lock(false);
					}
					return;
				}
				if(this.idx >= vjP.length){
					if(!this.error)this.onpass();
					else if( this.reportError() === false ) return;
					!this.oneElemTest && valObj.elemTest(this.error,this.elem.name,this.value());
					return;
				}
				var fn = valObj.getValidators(vjd[this.idx].vName);
				vjd[this.idx].m && (this.data.m = vjd[this.idx].m);
				fn.call(that,this.elem,that.value(),vjd[this.idx],Util.bind(this.next,this));
			},

			reportError : function(){
				if( this.onerror(true) === false ) {
					this.valObj.lock(false);
					return false;
				}
			}

		}));
		
		P.ax.ItemChk = ItemChk;
		
	})(pin,$);
	
});
