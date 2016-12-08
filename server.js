global.webConf = require("./conf/config");
var cluster = require('cluster');
var app = require("./app");

var server = {
    loadLocConf:function(){
        try{
            var locConf = require("./locConfig");
            function _locdLoc(topk,key,loc,conf){
                key.forEach(function(k){
                    if( typeof loc[k] != "object"){
                        console.log('locConf[%s]:%s',(topk+"."+k).substr(1),loc[k]);
                        conf[k] = loc[k]
                    } else {
                        _locdLoc(topk+"."+k,Object.keys(loc[k]),loc[k],conf[k]);
                    }
                })
            }
            console.log('load locals conf ...');
            _locdLoc("",Object.keys(locConf),locConf,global.webConf);;;
        } catch(e){
            console.log("ERR>>>",e);
        }
    },
    init: function() {
        if (cluster.isMaster) {
            this.serverStartLog();
            for (i = 0; i < webConf.numCPUs; i = i + 1) {
                cluster.fork();
            }
            cluster.on('death', function (worker) {
                console.log('Worker ' + worker.pid + ' died');
            });
        } else {
            app.init();
        }
    },
    serverStartLog: function() {
        console.log('\n\x1B[90mserver running %s:%s\nserver process %s\x1B[0m\n', webConf.hosts, webConf.port,webConf.numCPUs);
    }
}

server.loadLocConf();
if(webConf.debug){
    app.init();
} else {
    server.init();
}
