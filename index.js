'use strict';

const logger = require('./lib/logger');

exports.register = (server, options, next) => {

    logger.config(options, () => {
        server.on('tail', request => {
            logger.request(request);
        });

        server.on('log', event => {
            logger.log(event);
        });

        server.on('internalError', (request, err) => {
            logger.error(request, err);
        });

        server.log(['logging'], 'logging to: ' + options.redis.host);

        next();
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
