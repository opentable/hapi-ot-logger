var logger = require('./lib/logger');

exports.register = function (plugin, options, next) {

    logger.config(options);

    plugin.events.on('tail', function(request){
      logger.request(request);
    });

    plugin.events.on('log', function(event){
      logger.log(event);
    });

    plugin.events.on('internalError', function(event){
      logger.error(event);
    });

    plugin.log(["logging"], "logging to: " + options.redis.host);

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
