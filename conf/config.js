var numCPUs = require('os').cpus().length;

module.exports = {
    numCPUs:numCPUs,
    hosts: "0.0.0.0",
    port: 80,
    _resource_version: 1,
    debug:true,
    yunwei:false,//是否启用运维模式
    yunweiEndTime:'',//运维结束时间提示，比如 '2016/07/01 05:00:00',如果留空，默认为次日凌晨5时
    serverName:'www.wmzy.com',//正常情况下使用的官方域名
    vipRedirect:false,//是否启用vip专用通道
    vipHost:"vip.wmzy.com",//vip专用通道主機
    interfaceFile:"./conf/interface.json",
    interfaceStatus:"online",
    /*redisOpt:{
        host:"192.168.1.33",
        port:6379,
        db:0,
        options:{
            auth_pass:"123456"
        }
    },
    sessionSecret:"fnm(8rb$g$)zn%&amg3srr&&s$kmi05-1wymm5(6lfa$7eicf7",
    cacheOption:{//用于接口缓存的配置
        cacheTime:7*24*3600,
        secret:'redis.cache.www.wmzy.com'
    }*/
}

