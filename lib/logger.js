var os = require("os"),
    redis = require("redis"),
    hoek = require("hoek"),
    stringifySafe = require("json-stringify-safe"),
    consoleWriter = require("./console-writer"),
    client, cfg, connectionTimer,
    _commonFields = function(log, type){
      var fields = {
        "@timestamp": (new Date()).toISOString(),
        servicetype: cfg.servicetype,
        logname: type,
        formatversion: cfg.versions[type],
        type: cfg.servicetype + "-" + type + "-" + cfg.versions[type],
        host: cfg.host,
        sequencenumber: cfg.sequencenumber,
      };

      return hoek.applyToDefaults(fields, log);
    },
    _dispatch = function(log){
      if(cfg.console){
        consoleWriter.log(log);
      }

      client.rpush(cfg.redis.listname, stringifySafe(log), function(){});
      cfg.sequencenumber++;
    };

module.exports.config = function(config, cb){
  var defaults = {
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    servicetype: 'myservice',
    versions: {
      request: 'v1',
      log: 'v1',
      error: 'v1'
    },
    console: false,
    sequencenumber: 1,
    host: os.hostname()
  };

  cfg = hoek.applyToDefaults(defaults, config);

  client = redis.createClient(cfg.redis.port, cfg.redis.host, {
    enable_offline_queue: false
  });

  client.on('error', function (err) {});

  connectionTimer = setTimeout(cb, 2000);
  client.on('ready', function(){
    clearTimeout(connectionTimer);
    cb();
  });
};

module.exports.request = function(request){
  _dispatch(_commonFields({
    method: request.method,
    url: request.path,
    query: request.query,
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
  _dispatch(_commonFields({
    data: event.data,
    tags: event.tags
  }, 'log'));
};

module.exports.error = function(request, err){
  _dispatch(_commonFields({
    err: err
  }, 'error'));
};
