'use strict';

var expect = require('expect.js');
var os = require("os");
var rewire = require('rewire');

describe('logger configuration', function() {
    describe('when configured with defaults', function() {
        var cfg
        var redisClient

        before(function(done) {
            var logger = rewire('../lib/logger');

            logger.config({}, done);

            cfg = logger.__get__("cfg");
            redisClient = logger.__get__("client");
        });

        it('should connect to host 127.0.0.1', function() {
            expect(redisClient.connectionOption.host).to.equal('127.0.0.1');
        });

        it('should connect to port 6379', function() {
            expect(redisClient.connectionOption.port).to.equal(6379);
        });

        it('should connect with offline queue set to disabled', function() {
            expect(redisClient.options.enable_offline_queue).to.equal(false);
        });

        it('should use default servicetype setting', function() {
            expect(cfg.servicetype).to.equal('myservice');
        });

        it('should use default request version setting', function() {
            expect(cfg.versions.request).to.equal('v1');
        });

        it('should use default log version setting', function() {
            expect(cfg.versions.log).to.equal('v1');
        });

        it('should use default error version setting', function() {
            expect(cfg.versions.error).to.equal('v1');
        });

        it('should use default console setting', function() {
            expect(cfg.console).to.equal(false);
        });

        it('should use default payload setting', function() {
            expect(cfg.payload).to.equal(false);
        });

        it('should set sequencenumber to 1', function() {
            expect(cfg.sequencenumber).to.equal(1);
        });

        it('should set host to OS hostname', function() {
            expect(cfg.host).to.equal(os.hostname());
        });
    });

    describe('when configured with overrides', function() {
        var cfg
        var redisClient

        before(function(done) {
            var logger = rewire('../lib/logger');

            logger.config({
                servicetype: "test-service",
                versions: {
                    request: 'v2',
                    log: 'v3',
                    error: 'v4'
                },
                redis: {
                    host: '192.168.0.1',
                    port: 1234,
                    listname: 'logs'
                },
                console: true,
                payload: true,
                validate: function() {
                    return true;
                }
            }, done);

            cfg = logger.__get__("cfg");
            redisClient = logger.__get__("client");
        });

        it('should connect to host 192.168.0.1', function() {
            expect(redisClient.connectionOption.host).to.equal('192.168.0.1');
        });

        it('should connect to port 1234', function() {
            expect(redisClient.connectionOption.port).to.equal(1234);
        });

        it('should connect with offline queue set to disabled', function() {
            expect(redisClient.options.enable_offline_queue).to.equal(false);
        });

        it('should set listname', function() {
            expect(cfg.redis.listname).to.equal('logs');
        });

        it('should set servicetype', function() {
            expect(cfg.servicetype).to.equal('test-service');
        });

        it('should set request version', function() {
            expect(cfg.versions.request).to.equal('v2');
        });

        it('should set log version', function() {
            expect(cfg.versions.log).to.equal('v3');
        });

        it('should set error version', function() {
            expect(cfg.versions.error).to.equal('v4');
        });

        it('should set console', function() {
            expect(cfg.console).to.equal(true);
        });

        it('should set payload', function() {
            expect(cfg.payload).to.equal(true);
        });

        it('should set sequencenumber to 1', function() {
            expect(cfg.sequencenumber).to.equal(1);
        });

        it('should set host to OS hostname', function() {
            expect(cfg.host).to.equal(os.hostname());
        });
    });
});
