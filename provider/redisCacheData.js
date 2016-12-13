var crypto = require('crypto');
var redis = require('redis');
var thunkify = require('thunkify');
var redisClient = null;
var cacheVersion = "_v1"; //change it to drop cache

module.exports = function(redisOption,cacheOption){
	return new RedisCacheClient(redisOption,cacheOption);
}

function RedisCacheClient(redisOption,cacheOption){
	cacheVersion = "_v"+cacheOption.cacheVersion||1;
	this.redisOption = redisOption;
	this.cacheTime = cacheOption.cacheTime;
	this.secret = cacheOption.secret;
	this.connet();
}

RedisCacheClient.prototype.connet = function(){
	redisOption = this.redisOption;
	console.log('RedisCacheClient connet:redisOption>>>',redisOption);
	if(redisClient){
		this.redisClient = redisClient;
		return redisClient;
	}

	//redis client for cache
	redisClient = redis.createClient(
		redisOption.port,
		redisOption.host,
		redisOption.options
	);

	var db = Math.max(redisOption.db-1,1);
	redisClient.select(db, function () {
		console.log('redis changed to db %d', db);
	});

	redisClient.get = thunkify(redisClient.get); // 普通回调转换成Generator接收的函数
	redisClient.set = thunkify(redisClient.set);
	redisClient.del = thunkify(redisClient.del);
	redisClient.hset = thunkify(redisClient.hset);
	redisClient.hkeys = thunkify(redisClient.hkeys);

	this.redisClient = redisClient;
	return redisClient;
}

RedisCacheClient.prototype.getClient = function*(){
	var redisClient = this.redisClient;
	if(!redisClient){
		redisClient = yield this.connet();
	}

	return redisClient;
}

RedisCacheClient.prototype.hexKey = function(key){
	return crypto.createHash("md5").update(this.secret+key).digest('hex');
}

RedisCacheClient.prototype.save = function*(key,value){
	var redisClient = yield this.getClient();
	key = this.hexKey(key);
	var data = JSON.stringify({value:value,version:cacheVersion});

	yield redisClient.set(key,data);
	redisClient.expire(key,this.cacheTime);
}

RedisCacheClient.prototype.get = function*(key){
	var redisClient = yield this.getClient();
	key = this.hexKey(key);

	var value = null;
	var data = yield redisClient.get(key);
	if(data){
		data = JSON.parse(data);
		if(data.version==cacheVersion){
			value = data.value;
		}else{
			yield redisClient.del(key);
		}
	}
	
	return value;
}

RedisCacheClient.prototype.del = function*(key){
	var redisClient = yield this.getClient();
	key = this.hexKey(key);
	yield redisClient.del(key);
}