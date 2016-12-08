var IndexView = load("controller/indexView");


module.exports = {
	getAddr:function*(){//for http://gaokaozhiyuan.com/
        var aid = WebAid(this);
        this.type="text/javascript";
        aid.setBody('window.ADDR='+JSON.stringify(this.state.vars.location));
    },
	collecterror:function*(){//js error email
        var aid = WebAid(this);
        aid.param = aid.keyList([
            ['msg','','post']
        ]);

        aid.setBody(yield IndexView.collecterror(aid));
    }
}



