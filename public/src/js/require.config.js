requirejs.config({ 
	urlArgs:"v="+window._resource_version,
	baseUrl:"/js",
	waitSeconds:60,
	paths:{
		jquery:"jquery.min",
		jqext:"plugins/jqext",
		avalon:"plugins/avalon.min",
		avalonGetModel:"plugins/avalon.getModel",
		highcharts:"chart/highcharts",
		highstock:"chart/highstock",
		raphael:"chart/raphael-min.2.2.1",
		cityLow:"chart/maps/cityLow",
		request:"common/request"
	}

});