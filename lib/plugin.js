'use strict';

var joi    = require('joi');
var logger = require('./logger');

module.exports = {
    register: function (server, options, next) {
        var validation = joi.validate(options, require('./schema'));

        if(validation.error) {
            return next(validation.error);
        }

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
    }
};
