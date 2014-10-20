var logger = require('./lib/logger');

exports.register = function (plugin, options, next) {

    logger.config(options, function(){
      plugin.events.on('tail', function(request){
        logger.request(request);
      });

      plugin.events.on('log', function(event){
        logger.log(event);
      });

      plugin.events.on('internalError', function(request, err){
        logger.error(request, err);
      });

      plugin.log(["logging"], "logging to: " + options.redis.host);

      next();
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
