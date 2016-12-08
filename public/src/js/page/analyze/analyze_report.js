define([
	'jquery','pin','avalon',
	'page/head',
	'page/analyze/report/step1',
	'page/analyze/report/step2Major',
	'page/analyze/report/step2Sch',
	'common/common','common/fixBottom'],
	function($,pin,avalon,headjs,step1,step2Major,step2Sch){

	return {
		init:function(){
			step1.init();
			step2Major.init();
			step2Sch.init();
			headjs.init();

			$("body").removeAttr('ms-controller');
		}
	}

});