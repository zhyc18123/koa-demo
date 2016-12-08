define(function () {
    var PICINAME = {
        "bk1":"本科第一批",
        "bk2":"本科第二批",
        "bk3":"本科第三批",
        "bk2a":"本科第二批A类",
        "bk2b":"本科第二批B类",
        "bk3a":"本科第三批A类",
        "bk3b":"本科第三批B类",
		"zk1":"专科第一批",
		"zk2":"专科第二批"
    }

    var PICILINENAME = {
        "bk1":"一本",
        "bk2":"二本",
        "bk3":"三本",
        "bk2a":"二本A",
        "bk2b":"二本B",
        "bk3a":"三本A",
        "bk3b":"三本B",
		"zk1":"专科一",
		"zk2":"专科二"
    }

    var piciArr = [
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"安徽","pid":"34","py":"A"},
        {"pici":["bk1","bk2","bk3",'zk1'],"prov":"北京","pid":"11","py":"B"},
        {"pici":["bk1","bk2","zk1"],"prov":"重庆","pid":"50","py":"C"},
        {"pici":["bk1","bk2", "zk1"],"prov":"福建","pid":"35","py":"F"},
        {"pici":["bk1","bk2", "zk1", "zk2"],"prov":"广东","pid":"44","py":"G"},
        {"pici":["bk1","bk2", "zk1"],"prov":"贵州","pid":"52","py":"G"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"甘肃","pid":"62","py":"G"},
        {"pici":["bk1","bk2", "zk1"],"prov":"广西","pid":"45","py":"G"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"河南","pid":"41","py":"H"},
        {"pici":["bk1","bk2", "zk1"],"prov":"湖北","pid":"42","py":"H"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"黑龙江","pid":"23","py":"H"},
        {"pici":["bk1","bk2", "zk1"],"prov":"河北","pid":"13","py":"H"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"海南","pid":"46","py":"H"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"湖南","pid":"43","py":"H"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"吉林","pid":"22","py":"J"},
        {"pici":["bk1","bk2","bk3",'zk1'],"prov":"江苏","pid":"32","py":"J"},
        {"pici":["bk1","bk2", "zk1"],"prov":"江西","pid":"36","py":"J"},
        {"pici":["bk1","bk2","zk1"],"prov":"辽宁","pid":"21","py":"L"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"宁夏","pid":"64","py":"N"},
        {"pici":["bk1","bk2","zk1"],"prov":"内蒙古","pid":"15","py":"N"},
        {"pici":["bk1","bk2","bk3", "zk1", "zk2"],"prov":"青海","pid":"63","py":"Q"},
        {"pici":["bk1","bk2", "zk1", "zk2"],"prov":"四川","pid":"51","py":"S"},
        {"pici":["bk1","bk2","zk1"],"prov":"山西","pid":"14","py":"S"},
        {"pici":["bk1","zk1"],"prov":"上海","pid":"31","py":"S"},
        {"pici":["bk1","bk2","bk3", "zk1"],"prov":"陕西","pid":"61","py":"S"},
        {"pici":["bk1","bk2", "zk1"],"prov":"山东","pid":"37","py":"S"},
        {"pici":["bk1","bk2","bk3", 'zk1'],"prov":"天津","pid":"12","py":"T"},
        {"pici":["bk1","bk2","bk3", "zk1", "zk2"],"prov":"新疆","pid":"65","py":"X"},
        {"pici":["bk1","bk2","bk3", "zk1", "zk2"],"prov":"云南","pid":"53","py":"Y"},
        {"pici":["bk1","bk2",'zk1'],"prov":"浙江","pid":"33","py":"Z"}
    ];

    var REGION = {
        "region_huabei":{
            "title":"华北",
            "provList":["北京","内蒙古","天津","河北","山西"]
        },
        "region_dongbei":{
            "title":"东北",
            "provList":["辽宁","黑龙江","吉林"]
        },
        "region_huadong":{
            "title":"华东",
            "provList":["上海","江苏","浙江","安徽","福建","江西","山东"]
        },
        "region_huazhong":{
            "title":"华中",
            "provList":["河南","湖北","湖南"]
        },
        "region_huanan":{
            "title":"华南",
            "provList":["广东","广西","海南"]
        },
        "region_xinan":{
            "title":"西南",
            "provList":["重庆","四川","贵州","云南","西藏"]
        },
        "region_xibei":{
            "title":"西北",
            "provList":["陕西","甘肃","青海","宁夏","新疆"]
        }
    };

    var major_bk =[["哲学",[{"name":"哲学类","value":"哲学类"}]],["经济学",[{"name":"经济学类","value":"经济学类"},{"name":"财政学类","value":"财政学类"},{"name":"金融学类","value":"金融学类"},{"name":"经济与贸易类","value":"经济与贸易类"}]],["法学",[{"name":"法学类","value":"法学类"},{"name":"政治学类","value":"政治学类"},{"name":"社会学类","value":"社会学类"},{"name":"民族学类","value":"民族学类"},{"name":"马克思主义理论类","value":"马克思主义理论类"},{"name":"公安学类","value":"公安学类"}]],["教育学",[{"name":"教育学类","value":"教育学类"},{"name":"体育学类","value":"体育学类"}]],["文学",[{"name":"中国语言文学类","value":"中国语言文学类"},{"name":"外国语言文学类","value":"外国语言文学类"},{"name":"新闻传播学类","value":"新闻传播学类"}]],["历史学",[{"name":"历史学类","value":"历史学类"}]],["理学",[{"name":"数学类","value":"数学类"},{"name":"物理学类","value":"物理学类"},{"name":"化学类","value":"化学类"},{"name":"天文学类","value":"天文学类"},{"name":"地理科学类","value":"地理科学类"},{"name":"大气科学类","value":"大气科学类"},{"name":"海洋科学类","value":"海洋科学类"},{"name":"地球物理学类","value":"地球物理学类"},{"name":"地质学类","value":"地质学类"},{"name":"生物科学类","value":"生物科学类"},{"name":"心理学类","value":"心理学类"},{"name":"统计学类","value":"统计学类"}]],["工学",[{"name":"力学类","value":"力学类"},{"name":"机械类","value":"机械类"},{"name":"仪器类","value":"仪器类"},{"name":"材料类","value":"材料类"},{"name":"能源动力类","value":"能源动力类"},{"name":"电气类","value":"电气类"},{"name":"电子信息类","value":"电子信息类"},{"name":"自动化类","value":"自动化类"},{"name":"计算机类","value":"计算机类"},{"name":"土木类","value":"土木类"},{"name":"水利类","value":"水利类"},{"name":"测绘类","value":"测绘类"},{"name":"化工与制药类","value":"化工与制药类"},{"name":"地质类","value":"地质类"},{"name":"矿业类","value":"矿业类"},{"name":"纺织类","value":"纺织类"},{"name":"轻工类","value":"轻工类"},{"name":"交通运输类","value":"交通运输类"},{"name":"海洋工程类","value":"海洋工程类"},{"name":"航空航天类","value":"航空航天类"},{"name":"兵器类","value":"兵器类"},{"name":"核工程类","value":"核工程类"},{"name":"农业工程类","value":"农业工程类"},{"name":"林业工程类","value":"林业工程类"},{"name":"环境科学与工程类","value":"环境科学与工程类"},{"name":"生物医学工程类","value":"生物医学工程类"},{"name":"食品科学与工程类","value":"食品科学与工程类"},{"name":"建筑类","value":"建筑类"},{"name":"安全科学与工程类","value":"安全科学与工程类"},{"name":"生物工程类","value":"生物工程类"},{"name":"公安技术类","value":"公安技术类"}]],["农学",[{"name":"植物生产类","value":"植物生产类"},{"name":"自然保护与环境生态类","value":"自然保护与环境生态类"},{"name":"动物生产类","value":"动物生产类"},{"name":"动物医学类","value":"动物医学类"},{"name":"林学类","value":"林学类"},{"name":"水产类","value":"水产类"},{"name":"草学类","value":"草学类"}]],["医学",[{"name":"基础医学类","value":"基础医学类"},{"name":"临床医学类","value":"临床医学类"},{"name":"口腔医学类","value":"口腔医学类"},{"name":"公共卫生与预防医学类","value":"公共卫生与预防医学类"},{"name":"中医学类","value":"中医学类"},{"name":"中西医结合类","value":"中西医结合类"},{"name":"药学类","value":"药学类"},{"name":"中药学类","value":"中药学类"},{"name":"法医学类","value":"法医学类"},{"name":"医学技术类","value":"医学技术类"},{"name":"护理学类","value":"护理学类"}]],["管理学",[{"name":"管理科学与工程类","value":"管理科学与工程类"},{"name":"工商管理类","value":"工商管理类"},{"name":"农业经济管理类","value":"农业经济管理类"},{"name":"公共管理类","value":"公共管理类"},{"name":"图书情报与档案管理类","value":"图书情报与档案管理类"},{"name":"物流管理与工程类","value":"物流管理与工程类"},{"name":"工业工程类","value":"工业工程类"},{"name":"电子商务类","value":"电子商务类"},{"name":"旅游管理类","value":"旅游管理类"}]],["艺术学",[{"name":"艺术学理论类","value":"艺术学理论类"},{"name":"音乐与舞蹈学类","value":"音乐与舞蹈学类"},{"name":"戏剧与影视学类","value":"戏剧与影视学类"},{"name":"美术学类","value":"美术学类"},{"name":"设计学类","value":"设计学类"}]]];
	var major_zk = [["农林牧渔大类",[{"name":"农业技术类","value":"农业技术类"},{"name":"林业技术类","value":"林业技术类"},{"name":"畜牧兽医类","value":"畜牧兽医类"},{"name":"水产养殖类","value":"水产养殖类"},{"name":"农林管理类","value":"农林管理类"}]],["交通运输大类",[{"name":"公路运输类","value":"公路运输类"},{"name":"铁道运输类","value":"铁道运输类"},{"name":"城市轨道运输类","value":"城市轨道运输类"},{"name":"水上运输类","value":"水上运输类"},{"name":"民航运输类","value":"民航运输类"},{"name":"港口运输类","value":"港口运输类"},{"name":"管道运输类","value":"管道运输类"}]],["生化与药品大类",[{"name":"生物技术类","value":"生物技术类"},{"name":"化工技术类","value":"化工技术类"},{"name":"制药技术类","value":"制药技术类"},{"name":"食品药品管理类","value":"食品药品管理类"}],["资源开发与测绘大类",{"name":"资源勘查类","value":"资源勘查类"},{"name":"地质工程与技术类","value":"地质工程与技术类"},{"name":"矿业工程类","value":"矿业工程类"},{"name":"石油与天然气类","value":"石油与天然气类"},{"name":"矿物加工类","value":"矿物加工类"},{"name":"测绘类","value":"测绘类"}]],["材料与能源大类",[{"name":"材料类","value":"材料类"},{"name":"能源类","value":"能源类"},{"name":"电力技术类","value":"电力技术类"}]],["土建大类",[{"name":"建筑设计类","value":"建筑设计类"},{"name":"城镇规划与管理类","value":"城镇规划与管理类"},{"name":"土建施工类","value":"土建施工类"},{"name":"建筑设备类","value":"建筑设备类"},{"name":"工程管理类","value":"工程管理类"},{"name":"市政工程类","value":"市政工程类"},{"name":"房地产类","value":"房地产类"}],["水利大类",{"name":"水文与水资源类","value":"水文与水资源类"},{"name":"水利工程与管理类","value":"水利工程与管理类"},{"name":"水利水电设备类","value":"水利水电设备类"},{"name":"水土保持与水环境类","value":"水土保持与水环境类"}]],["制造大类",[{"name":"机械设计制造类","value":"机械设计制造类"},{"name":"自动化类","value":"自动化类"},{"name":"机电设备类","value":"机电设备类"},{"name":"汽车类","value":"汽车类"}]],["电子信息大类",[{"name":"计算机类","value":"计算机类"},{"name":"电子信息类","value":"电子信息类"},{"name":"通信类","value":"通信类"}]],["环保、气象与安全大类",[{"name":"环保类","value":"环保类"},{"name":"气象类","value":"气象类"},{"name":"安全类","value":"安全类"}]],["轻纺食品大类",[{"name":"轻化工类","value":"轻化工类"},{"name":"纺织服装类","value":"纺织服装类"},{"name":"食品类","value":"食品类"},{"name":"包装印刷类","value":"包装印刷类"}]],["财经大类",[{"name":"财政金融类","value":"财政金融类"},{"name":"财务会计类","value":"财务会计类"},{"name":"经济贸易类","value":"经济贸易类"},{"name":"市场营销类","value":"市场营销类"},{"name":"工商管理类","value":"工商管理类"}]],["医药卫生大类",[{"name":"临床医学类","value":"临床医学类"},{"name":"护理类","value":"护理类"},{"name":"药学类","value":"药学类"},{"name":"医学技术类","value":"医学技术类"},{"name":"卫生管理类","value":"卫生管理类"}],["旅游大类",{"name":"旅游管理类","value":"旅游管理类"},{"name":"餐饮管理与服务类","value":"餐饮管理与服务类"}]],["公共事业大类",[{"name":"公共事业类","value":"公共事业类"},{"name":"公共管理类","value":"公共管理类"},{"name":"公共服务类","value":"公共服务类"}]],["文化教育大类",[{"name":"语言文化类","value":"语言文化类"},{"name":"教育类","value":"教育类"},{"name":"体育类","value":"体育类"}]],["艺术设计传媒大类",[{"name":"艺术设计类","value":"艺术设计类"},{"name":"表演艺术类","value":"表演艺术类"},{"name":"广播影视类","value":"广播影视类"}],["公安大类",{"name":"公安管理类","value":"公安管理类"},{"name":"公安指挥类","value":"公安指挥类"},{"name":"公安技术类","value":"公安技术类"},{"name":"部队基础工作类","value":"部队基础工作类"}]],["法律大类",[{"name":"法律实务类","value":"法律实务类"},{"name":"法律执行类","value":"法律执行类"},{"name":"司法技术类","value":"司法技术类"}]]];
    
    var city = [
            ["发达城市",[
                { value: '11', name: '北京' },
                { value: '31', name: '上海' },
                { value: '4403', name: '深圳' },
                { value: '4401', name: '广州' },
                { value: '4201', name: '武汉' },
                { value: '6101', name: '西安' },
                { value: '3201', name: '南京' },
                { value: '12', name: '天津' },
                { value: '5101', name: '成都' },
                { value: '2201', name: '长春' },
                { value: '50', name: '重庆' },
                { value: '2101', name: '沈阳' }
            ]],
            ["华北",[{"py":"B","value":"11","name":"北京"},{"py":"N","value":"15","name":"内蒙古"},{"py":"T","value":"12","name":"天津"},{"py":"H","value":"13","name":"河北"},{"py":"S","value":"14","name":"山西"}]],["东北",[{"py":"L","value":"21","name":"辽宁"},{"py":"H","value":"23","name":"黑龙江"},{"py":"J","value":"22","name":"吉林"}]],["华东",[{"py":"S","value":"31","name":"上海"},{"py":"J","value":"32","name":"江苏"},{"py":"Z","value":"33","name":"浙江"},{"py":"A","value":"34","name":"安徽"},{"py":"F","value":"35","name":"福建"},{"py":"J","value":"36","name":"江西"},{"py":"S","value":"37","name":"山东"}]],["华中",[{"py":"H","value":"41","name":"河南"},{"py":"H","value":"42","name":"湖北"},{"py":"H","value":"43","name":"湖南"}]],["华南",[{"py":"G","value":"44","name":"广东"},{"py":"G","value":"45","name":"广西"},{"py":"H","value":"46","name":"海南"}]],["西南",[{"py":"C","value":"50","name":"重庆"},{"py":"S","value":"51","name":"四川"},{"py":"G","value":"52","name":"贵州"},{"py":"Y","value":"53","name":"云南"},{"py":"X","value":"54","name":"西藏"}]],["西北",[{"py":"G","value":"62","name":"甘肃"},{"py":"N","value":"64","name":"宁夏"},{"py":"Q","value":"63","name":"青海"},{"py":"S","value":"61","name":"陕西"},{"py":"X","value":"65","name":"新疆"}]]
        ];

    var job = [["IT|互联网|通信",[{"name":"IT管理/项目协调","value":"IT管理/项目协调"},{"name":"IT运维/技术支持","value":"IT运维/技术支持"},{"name":"IT质量管理/测试/配置管理","value":"IT质量管理/测试/配置管理"},{"name":"产品","value":"产品"},{"name":"电信/通信技术开发及应用","value":"电信/通信技术开发及应用"},{"name":"软件/互联网开发/系统集成","value":"软件/互联网开发/系统集成"},{"name":"硬件开发","value":"硬件开发"},{"name":"运营","value":"运营"}]],["财务|人力资源|行政",[{"name":"财务/审计/税务","value":"财务/审计/税务"},{"name":"行政/后勤/文秘","value":"行政/后勤/文秘"},{"name":"人力资源","value":"人力资源"}]],["采购|贸易|交通|物流",[{"name":"采购/贸易","value":"采购/贸易"},{"name":"交通运输服务","value":"交通运输服务"},{"name":"物流/仓储","value":"物流/仓储"}]],["传媒|印刷|艺术|设计",[{"name":"艺术/设计","value":"艺术/设计"},{"name":"影视/媒体/出版/印刷","value":"影视/媒体/出版/印刷"}]],["房产|建筑|物业管理",[{"name":"房地产开发/经纪/中介","value":"房地产开发/经纪/中介"},{"name":"土木/建筑/装修/市政工程","value":"土木/建筑/装修/市政工程"},{"name":"物业管理","value":"物业管理"}]],["服务业",[{"name":"安保","value":"安保"},{"name":"保健/美容/美发/健身","value":"保健/美容/美发/健身"},{"name":"厨师","value":"厨师"},{"name":"服务","value":"服务"},{"name":"管理","value":"管理"},{"name":"护理","value":"护理"},{"name":"旅游业务","value":"旅游业务"},{"name":"票务","value":"票务"},{"name":"食品研发","value":"食品研发"},{"name":"调度","value":"调度"},{"name":"医生","value":"医生"}]],["金融",[{"name":"保险开发","value":"保险开发"},{"name":"保险业务","value":"保险业务"},{"name":"风险管理","value":"风险管理"},{"name":"核保","value":"核保"},{"name":"拍卖","value":"拍卖"},{"name":"投融资","value":"投融资"},{"name":"信贷","value":"信贷"},{"name":"信托","value":"信托"},{"name":"银行业务","value":"银行业务"},{"name":"证券业务","value":"证券业务"}]],["能源|环保|农业|科研",[{"name":"畜牧","value":"畜牧"},{"name":"公务员/事业单位/科研机构","value":"公务员/事业单位/科研机构"},{"name":"环境科学/环保","value":"环境科学/环保"},{"name":"能源/矿产/地质勘查","value":"能源/矿产/地质勘查"},{"name":"饲料销售","value":"饲料销售"},{"name":"园艺","value":"园艺"}]],["生产|制造",[{"name":"电子/电器/半导体/仪器仪表","value":"电子/电器/半导体/仪器仪表"},{"name":"服装设计","value":"服装设计"},{"name":"化工","value":"化工"},{"name":"机械设计/制造/维修","value":"机械设计/制造/维修"},{"name":"技工/操作工","value":"技工/操作工"},{"name":"汽车维护","value":"汽车维护"},{"name":"汽车销售","value":"汽车销售"},{"name":"汽车制造","value":"汽车制造"},{"name":"生产","value":"生产"},{"name":"生产管理/运营","value":"生产管理/运营"},{"name":"传统销售","value":"传统销售"},{"name":"医药推广","value":"医药推广"},{"name":"医药研发","value":"医药研发"}]],["项目|质量|高级管理",[{"name":"高级管理","value":"高级管理"},{"name":"项目管理/项目协调","value":"项目管理/项目协调"},{"name":"质量管理/安全防护","value":"质量管理/安全防护"}]],["销售|客服|市场",[{"name":"公关/媒介","value":"公关/媒介"},{"name":"广告","value":"广告"},{"name":"会展","value":"会展"},{"name":"客服/售前/售后技术支持","value":"客服/售前/售后技术支持"},{"name":"市场","value":"市场"},{"name":"销售管理","value":"销售管理"},{"name":"销售行政/商务","value":"销售行政/商务"},{"name":"销售业务","value":"销售业务"}]],["咨询|法律|教育|翻译",[{"name":"翻译（口译与笔译）","value":"翻译（口译与笔译）"},{"name":"教育/培训","value":"教育/培训"},{"name":"律师/法务/合规","value":"律师/法务/合规"},{"name":"数据分析","value":"数据分析"},{"name":"咨询","value":"咨询"}]]];
    

    var courseCfg = [
        {text:"物理",value:"physics"},
        {text:"生物",value:"biology"},
        {text:"化学",value:"chemistry"},
        {text:"地理",value:"geography"},
        {text:"政治",value:"politics"},
        {text:"历史", value:"history"}
    ];

    function findArrItem(arr,v){
        arr = arr||[];
        var index = -1;
        for(var i=0;i<arr.length;i++){
            if(arr[i]===v){
                index=i;
                break;
            }
        }

        return index;
    }

    function getCourse(courseName){
        var namesArr = ["physics","biology","chemistry","geography","politics","history"];
        if(typeof(courseName)=='string'&&(!courseName||findArrItem(namesArr,courseName)==-1)){
            return false;
        }

        var names = [].concat(courseName);
        var rsl = [];
        for(var i=0;i<courseCfg.length;i++){
            var course = courseCfg[i];
            if(findArrItem(names,course.text)>-1||findArrItem(names,course.value)>-1){
                rsl.push(course);
            }
        }

        if(typeof(courseName)=='string'){
            rsl = rsl[0];
        }

        return rsl;
    }

    var jiangsuCourseCfg = {
        courseLevels:['A+','A', 'B+','B', 'C', 'D'],
        opt_courseList:getCourse(["政治","地理","化学","生物"]),
        req_course:{
            l:getCourse("physics"),
            w:getCourse("history")
        }
    }

    return {
        PICINAME:PICINAME,
        REGION:REGION,
        PICILINENAME:PICILINENAME,
        piciArr:piciArr,
        city:city,
		major_bk:major_bk,
        major_zk:major_zk,
        job:job,
        courseCfg:courseCfg,
        jiangsuCourseCfg:jiangsuCourseCfg,
        getCourse:getCourse
    }
})
