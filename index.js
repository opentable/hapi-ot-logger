'use strict';

var logger = require('./lib/logger');

exports.register = function (server, options, next) {

    logger.config(options, function(){
        server.on('tail', function(request){
            logger.request(request);
        });

        server.on('log', function(event){
            logger.log(event);
        });

        server.on('internalError', function(request, err){
            logger.error(request, err);
        });

        server.log(["logging"], "logging to: " + options.redis.host);

        next();
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
