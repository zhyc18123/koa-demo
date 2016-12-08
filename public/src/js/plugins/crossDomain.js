if(window.define == void 0) {
	define = function(fn) {fn();};
}
define(function() {

	/**
	 * @class cross
	 * 跨域交互类<br />
	 * 使用对方域定义的转发文件(静态)实现跨域双向通信，当前框架默认转发文件为 /about.html
	 * @singleton
	 * */
	window.cross = {
		porxy: {},
		/**
		 * 配置目标域的转发文件
		 * @param {String} domain
		 * 目标域名
		 * @param {String} porxy
		 * 转发文件地址
		 * */
		config : function(domain,porxy){
			this.porxy[domain] = porxy;
		},
		/**
		 * 发送消息
		 * @param {String} target
		 * 使用top,parent,frames组成的可以访问到目标iframe的字符串
		 * @param {String} domain
		 * 对方的域名，这个是用来找转发文件的，和配置里面的一致
		 * @param {String} method
		 * 想要调用目标window对象的方法<br />
		 * 对方的方法会收到两个参数一个是你主动传输的参数，一个是发起send的域的域名 
		 * @param {String} value
		 * 传输的值
		 * */
		send: function(target, domain, method, value, callback) {
			var el = document.createElement("iframe");
			var callback = callback || function(){};
			el.style.position = "absolute";
			el.style.visibility = "hidden";
			el.style.top = el.style.left = "0";
			el.style.width = el.style.height = "0";
			document.body.appendChild(el);

			addListener(el, "load", function() {
				removeListener(this, "load", arguments.callee);
				setTimeout(function() {
					callback();
					document.body.removeChild(el);
				}, 1000);
			});

			var s = "target=" + escape(target) 
				+ "&value=" + escape(value) 
				+ "&domain=" + escape(document.domain) 
				+ "&method=" + method;

			el.src = this.porxy[domain] + "#" + escape(s);

			document.body.appendChild(el);
		}
	}
	var addListener = function(elem, type, handler) {
			if(elem.addEventListener) {
				elem.addEventListener(type, handler, false);
			} else if(elem.attachEvent) {
				elem.attachEvent("on" + type, handler);
			} else {
				elem["on" + type] = handler;
			}
		}

	var removeListener = function(elem, type, handler) {
			if(elem.removeEventListener) {
				elem.removeEventListener(type, handler, false);
			} else if(elem.detachEvent) {
				elem.detachEvent("on" + type, handler);
			} else {
				elem["on" + type] = null;
			}
		};

});