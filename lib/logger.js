var os = require("os");
var redis = require("redis");
var hoek = require("hoek");
var stringifySafe = require("json-stringify-safe");
var consoleWriter = require("./console-writer");

var client = {};
var config = {};
var connectionTimer;

module.exports.config = function(config, cb){
  cfg = config;
  cfg.sequencenumber = 1;
  cfg.host = os.hostname();

  client = redis.createClient(cfg.redis.port, cfg.redis.host,
  {
    enable_offline_queue: false
  });

  client.on('error', function (err) {});

  connectionTimer = setTimeout(cb, 2000);
  client.on('connect', function(){
    clearTimeout(connectionTimer);
    cb();
  });
}

var commonFields = function(log, type){
  var fields = {
    "@timestamp": (new Date()).toISOString(),
    servicetype: cfg.servicetype,
    logname: type,
    formatversion: cfg.versions[type],
    type: cfg.servicetype + "-" + type + "-" + cfg.versions[type],
    host: cfg.host,
    sequencenumber: cfg.sequencenumber,
  }

  return hoek.applyToDefaults(fields, log);
}

var _dispatch = function(log){
  if(cfg.console){
    consoleWriter.log(log);
  }

  client.rpush(cfg.redis.listname, stringifySafe(log), function(){});
  cfg.sequencenumber++;
};

module.exports.request = function(request){
  _dispatch(commonFields({
    method: request.method,
    url: request.path,
    status: request.response.statusCode,
    duration: (Date.now() - request.info.received) * 1000, // just to be compliant. sigh
    durationMilliseconds: Date.now() - request.info.received,
    events: request.getLog(),

    "ot-requestid": request.headers["ot-requestid"],
    "user-agent": request.headers["user-agent"],
    "ot-userid": request.headers["ot-userid"],
    "ot-sessionid": request.headers["ot-sessionid"],
    "ot-referringhost": request.headers["ot-referringhost"],
    "ot-referringservice": request.headers["ot-referringservice"],
    "accept-language": request.headers["accept-language"],
    headers: request.headers, // log anything else that is not pulled up
  }, 'request'));
};

module.exports.log = function(event){
  _dispatch(commonFields({
    data: event.data,
    tags: event.tags
  }, 'log'));
};

module.exports.error = function(request, err){
  _dispatch(commonFields({
    err: err
  }, 'error'));
};
