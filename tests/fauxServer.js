'use strict';

var hapi = require('hapi');
var fauxEndpoints;

module.exports = function(options, next) {
    var server = new hapi.Server();
    server.connection({ port: 3000 });

    options = options || {};
    options.redis = options.redis || {};

    server.on('log', function(event) {
        console.log(event);
    });

    server.route({
        method: "GET",
        path: "/resource/{param1}/{param2}",
        config: {
            handler: function(req, reply) {
                reply({
                    param1: req.params.param1,
                    param2: req.params.param2,
                    q1: req.query.q1,
                    q2: req.query.q2
                });
            }
        }
    });

    server.register([
        {
            register: require('../index'),
            options: {
                servicetype: "myservice",
                versions: {
                    request: 'v2',
                    log: 'v3',
                    error: 'v2'
                },
                redis: {
                    host: '127.0.0.1',
                    port: 6379,
                    listname: 'logs'
                }
            }
        }
    ],
    function(err) {
        if (err) {
            throw err;
        }

        fauxEndpoints = {
            request: function(options, next) {
                server.inject({
                    method: 'GET',
                    url: options.url
                }, function(response) {
                    next(response);
                });
            }
        };

        return next(fauxEndpoints);
    });
};
