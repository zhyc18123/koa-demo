'use strict'
var Loc = load("provider/data/loc");
var util = Util;


module.exports = {
    truncate: function (target, length, truncation) {
        length = length || 30;
        truncation = truncation === void 0 ? "..." : truncation;
        return target.length > length ? target.slice(0, length - truncation.length) + truncation : String(target);
    },
    replaceBr:function(target){
        return target.trim().replace(/\s?\n+\s?/gm,"<br/>")
    },
   
    provName:function(porv_id){
        return Loc.getCityName(porv_id,true) || "[ERR]"
    },
    provName2:function(porv_id){
        if(!porv_id) {
            return "全国";
        } else if (porv_id == 11 || porv_id == 12 || porv_id == 31 || porv_id == 50 ) {
            return Loc.getCityName(porv_id,true) + "市" || "[ERR]"
        } else if (porv_id == 15 || porv_id == 45 || porv_id == 54 || porv_id == 64 || porv_id == 65) {
            return Loc.getCityName(porv_id,true) + "自治区" || "[ERR]"
        } else {
            return Loc.getCityName(porv_id,true) + "省" || "[ERR]"
        }
    },
    cityName:function(city_id){
        return Loc.getCityName(city_id) || "[ERR]"
    },
   
   
    d:function(target,defVal){
        defVal = defVal == void 0 ? "":defVal;
        if(target){
            return target
        } else{
            return defVal
        }
    },
   
    equal:function(val,key,s){
        const equ = ()=> val == key || typeof(key) == 'object' && val in key
        return equ(val, key) ? s : val
    },
    
    moment: function (time) {
        const now = +new Date()
        const diff = (now-time)/1000
        if (diff < 60*60){
            return `${parseInt(diff/60)}分钟前`
        } else if(diff < 60*60*24) {
            return `${parseInt(diff/(60*60))}小时前`
        } else if(diff < 60*60*24*7){
            return `${parseInt(diff/(60*60*24))}天前`
        } else {
            const d = new Date(time)
            return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
        }
    },
    fuz: function (num) {
        num = parseInt(num)
        const _num = num.toString()
        var l = Math.pow(10, Math.max(_num.length-1,1))
        return Math.max(10, parseInt(num/l)*l)
    },
    id2province: function(id) {
        id = id.toString().slice(0,2)
        var m = {11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆"}
        return m[id]
    },
    province2id: function(name) {
        var m = { '安徽': '34', '北京': '11', '重庆': '50', '福建': '35', '甘肃': '62', '广东': '44', '广西': '45', '贵州': '52', '海南': '46', '河北': '13', '河南': '41', '黑龙江': '23', '湖北': '42', '湖南': '43', '吉林': '22', '江苏': '32', '江西': '36', '辽宁': '21', '内蒙古': '15', '宁夏': '64', '青海': '63', '山东': '37', '山西': '14', '陕西': '61', '上海': '31', '四川': '51', '天津': '12', '西藏': '54', '新疆': '65', '云南': '53', '浙江': '33'}
        return m[name]
    },
    locProvince: function(val) {
        var m = {
            "安徽" :   "A",
            "北京" :   "B",
            "重庆" :   "C",
            "福建" :   "F",
            "甘肃" :   "G",
            "广东" :   "G",
            "广西" :   "G",
            "贵州" :   "G",
            "海南" :   "H",
            "河北" :   "H",
            "河南" :   "H",
            "黑龙江":   "H",
            "湖北" :   "H",
            "湖南" :   "H",
            "吉林" :   "J",
            "江苏" :   "J",
            "江西" :   "J",
            "辽宁" :   "L",
            "内蒙古":   "N",
            "宁夏" :   "N",
            "青海" :   "Q",
            "山东" :   "S",
            "山西" :   "S",
            "陕西" :   "S",
            "上海" :   "S",
            "四川" :   "S",
            "天津" :   "T",
            "西藏" :   "X",
            "新疆" :   "X",
            "云南" :   "Y",
            "浙江" :   "Z"
        }
        return m[val] ? (m[val]+"    "+val) : val
    },
    id2alphaProvince:function(id){
        return this.locProvince(this.id2province(id));
    },
   
    rejectSearchKey: function(str) {
        var pattern = new RegExp('[?&]' + str +'=[^&]+', 'g')
        return str.replace(pattern, '')
    },
    getCityName:function(cityId,prov){
        cityId = this.getCityLongId(cityId,prov);
        return this.getLoc(cityId).loc_namecn
    },
    getCityLongId:function(cityId,prov){
        if(!cityId){
            return undefined
        }
        if (cityId.length == 2 ){
            if(prov){
                cityId += "00"
            } else {
                cityId += ["11", "12", "31", "50"].indexOf(cityId) != -1  ? "00":"01";
            }
        }
        if (cityId.length == 4) {
            cityId = cityId + "00000000"
            var rv = this._data[cityId]
            if( !rv ){
                cityId = cityId.substr(0,2) + "0100000000"
            }
            rv = this._data[cityId]
            if( !rv ){
                return undefined
            }
        }
        return cityId
    },
   
    number:function(number, decimals, point, thousands) {
        //   example 1: number_format(1234.56);
        //   returns 1: '1,235'
        //   example 2: number_format(1234.56, 2, ',', ' ');
        //   returns 2: '1 234,56'
        //   example 3: number_format(1234.5678, 2, '.', '');
        //   returns 3: '1234.57'
        //   example 4: number_format(67, 2, ',', '.');
        //   returns 4: '67,00'
        //   example 5: number_format(1000);
        //   returns 5: '1,000'
        //   example 6: number_format(67.311, 2);
        //   returns 6: '67.31'
        //   example 7: number_format(1000.55, 1);
        //   returns 7: '1,000.6'
        //   example 8: number_format(67000, 5, ',', '.');
        //   returns 8: '67.000,00000'
        //   example 9: number_format(0.9, 0);
        //   returns 9: '1'
        //  example 10: number_format('1.20', 2);
        //  returns 10: '1.20'
        //  example 11: number_format('1.20', 4);
        //  returns 11: '1.2000'
        //  example 12: number_format('1.2000', 3);
        //  returns 12: '1.200'
        //  example 13: number_format('1 000,50', 2, '.', ' ');
        //  returns 13: '100 050.00'
        //  example 14: number_format(1e-8, 8, '.', '');
        //  returns 14: '0.00000001'
        //form http://phpjs.org/functions/number_format/
        //number    必需，要格式化的数字
        //decimals  可选，规定多少个小数位。
        //point 可选，规定用作小数点的字符串（默认为 . ）。
        //thousands 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
        number = (number + '')
                .replace(/[^0-9+\-Ee.]/g, '')
        var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
                sep = thousands || ",",
                dec = point || ".",
                s = '',
                toFixedFix = function(n, prec) {
                    var k = Math.pow(10, prec)
                    return '' + (Math.round(n * k) / k)
                            .toFixed(prec)
                }
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
                .split('.')
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
        }
        if ((s[1] || '')
                .length < prec) {
            s[1] = s[1] || ''
            s[1] += new Array(prec - s[1].length + 1)
                    .join('0')
        }
        return s.join(dec)
    }
};


(function() {// jshint ignore:line
    function toInt(str) {
        return parseInt(str, 10) || 0
    }

    function padNumber(num, digits, trim) {
        var neg = ""
        if (num < 0) {
            neg = '-'
            num = -num
        }
        num = "" + num
        while (num.length < digits)
            num = "0" + num
        if (trim)
            num = num.substr(num.length - digits)
        return neg + num
    }

    function dateGetter(name, size, offset, trim) {
        return function(date) {
            var value = date["get" + name]()
            if (offset > 0 || value > -offset)
                value += offset
            if (value === 0 && offset === -12) {
                value = 12
            }
            return padNumber(value, size, trim)
        }
    }

    function dateStrGetter(name, shortForm) {
        return function(date, formats) {
            var value = date["get" + name]()
            var get = (shortForm ? ("SHORT" + name) : name).toUpperCase()
            return formats[get][value]
        }
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset()
        var paddedZone = (zone >= 0) ? "+" : ""
        paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
        return paddedZone
    }
    //取得上午下午

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
    }
    var DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, true),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", true),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", true),
        a: ampmGetter,
        Z: timeZoneGetter
    }
    var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/
    var raspnetjson = /^\/Date\((\d+)\)\/$/
    module.exports.date = function(date, format) {
        var locate = this.date.locate,
                text = "",
                parts = [],
                fn, match
        format = format || "mediumDate"
        format = locate[format] || format
        if (typeof date === "string") {
            if (/^\d+$/.test(date)) {
                date = toInt(date)
            } else if (raspnetjson.test(date)) {
                date = +RegExp.$1
            } else {
                var trimDate = date.trim()
                var dateArray = [0, 0, 0, 0, 0, 0, 0]
                var oDate = new Date(0)
                //取得年月日
                trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function(_, a, b, c) {
                    var array = c.length === 4 ? [c, a, b] : [a, b, c]
                    dateArray[0] = toInt(array[0])     //年
                    dateArray[1] = toInt(array[1]) - 1 //月
                    dateArray[2] = toInt(array[2])     //日
                    return ""
                })
                var dateSetter = oDate.setFullYear
                var timeSetter = oDate.setHours
                trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function(_, a, b, c, d) {
                    dateArray[3] = toInt(a) //小时
                    dateArray[4] = toInt(b) //分钟
                    dateArray[5] = toInt(c) //秒
                    if (d) {                //毫秒
                        dateArray[6] = Math.round(parseFloat("0." + d) * 1000)
                    }
                    return ""
                })
                var tzHour = 0
                var tzMin = 0
                trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function(z, symbol, c, d) {
                    dateSetter = oDate.setUTCFullYear
                    timeSetter = oDate.setUTCHours
                    if (symbol) {
                        tzHour = toInt(symbol + c)
                        tzMin = toInt(symbol + d)
                    }
                    return ""
                })

                dateArray[3] -= tzHour
                dateArray[4] -= tzMin
                dateSetter.apply(oDate, dateArray.slice(0, 3))
                timeSetter.apply(oDate, dateArray.slice(3))
                date = oDate
            }
        }
        if (typeof date === "number") {
            date = new Date(date)
        }
        if (!util.isDate(date)) {
            return
        }
        while (format) {
            match = rdateFormat.exec(format)
            if (match) {
                parts = parts.concat(match.slice(1))
                format = parts.pop()
            } else {
                parts.push(format)
                format = null
            }
        }
        parts.forEach(function(value) {
            fn = DATE_FORMATS[value]
            text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
        })
        return text
    }
    var locate = {
        AMPMS: {
            0: "上午",
            1: "下午"
        },
        DAY: {
            0: "星期日",
            1: "星期一",
            2: "星期二",
            3: "星期三",
            4: "星期四",
            5: "星期五",
            6: "星期六"
        },
        MONTH: {
            0: "1月",
            1: "2月",
            2: "3月",
            3: "4月",
            4: "5月",
            5: "6月",
            6: "7月",
            7: "8月",
            8: "9月",
            9: "10月",
            10: "11月",
            11: "12月"
        },
        SHORTDAY: {
            "0": "周日",
            "1": "周一",
            "2": "周二",
            "3": "周三",
            "4": "周四",
            "5": "周五",
            "6": "周六"
        },
        fullDate: "y年M月d日EEEE",
        longDate: "y年M月d日",
        medium: "yyyy-M-d H:mm:ss",
        mediumDate: "yyyy-M-d",
        mouthDate: "MM-dd",
        mediumTime: "H:mm:ss",
        "short": "yy-M-d ah:mm",
        shortDate: "yy-M-d",
        shortTime: "ah:mm"
    }
    locate.SHORTMONTH = locate.MONTH
    module.exports.date.locate = locate;

     for(var j in global.utilFn){
        if (global.utilFn.hasOwnProperty(j)) {
            module.exports[j] = global.utilFn[j];
        }
    }
})();
