'use strict';

describe('logger tests', function(){
    var net = require('net');
    var should = require('should'); // eslint-disable-line no-unused-vars
    var plugin = require('../index');
    var schema = require('./schema');
    var joi = require('joi');
    var events = [];
    var logs = [];
    var options;
    var discon = false;
    var p = {
        on: function(type, handler){
            events.push({ type: type, handler: handler })
        },
        log: function(){}
    };

    var remoteServer = net.createServer(function (c) {
        c.on('data', function (data) {
            var d = data.toString();

            if(discon){
                c.end();
                return;
            }

            if (d.indexOf("rpush\r\n") > -1) {
                logs.push(JSON.parse(d.split('\r\n')[6]));
                c.write(':1\r\n');
            }

            if (d.indexOf("info\r\n") > -1) {
                c.write('$32\r\n# Server\r\nredis_version:2.6.16\r\n');
            }

            if (d.indexOf("quit\r\n") > -1) {
                c.end();
            }
        });
    });

    before(function(done){
        remoteServer.listen(function () {
            options = {
                redis: {
                    port: remoteServer.address().port
                },
                payload: true,
                validate: function(log) {
                    return log.logname === 'request' && log.headers['user-agent'] !== 'spider';
                }
            };
            done();
        });
    });

    describe('setup', function() {
        it('should register the plugin', function(done){
            plugin.register(p, options, function(){
                events.length.should.eql(3);
                events[0].type.should.eql('tail');
                events[1].type.should.eql('log');
                events[2].type.should.eql('internalError');
                done();
            });
        });
    })

    describe('simple requests', function() {
        it('should handle a request', function(done){
            events[0].handler({
                method: 'get',
                path: '/foo',
                query: {
                    flarg: 'glarg'
                },
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: function(){ return []; },
                headers: {
                    "ot-requestid": "abcd-1234-abcd-1234",
                    "user-agent": "tests",
                    "ot-userid": "user1234",
                    "ot-sessionid": "1234-abcd-1234-abcd",
                    "ot-referringhost": "referringhost",
                    "ot-referringservice": "referringservice",
                    "accept-language": "en-GB,en;q=0.8"
                }
            });

            setTimeout(function(){
                joi.validate(logs[0], schema.request, function(err){
                    done(err);
                });
            }, 10);
        });

        it('should include the body from a PUT/POST request', function(done){
            events[0].handler({
                method: 'post',
                path: '/foo',
                query: {
                    flarg: 'glarg'
                },
                payload: {
                    foo: 'bar',
                    baz: { flarg: 'glarg' }
                },
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: function(){ return []; },
                headers: {
                    "ot-requestid": "abcd-1234-abcd-1234",
                    "user-agent": "tests",
                    "ot-userid": "user1234",
                    "ot-sessionid": "1234-abcd-1234-abcd",
                    "ot-referringhost": "referringhost",
                    "ot-referringservice": "referringservice",
                    "accept-language": "en-GB,en;q=0.8"
                }
            });

            setTimeout(function(){
                joi.validate(logs[1], schema.request, function(err){
                    logs[1].payload.should.equal('{"foo":"bar","baz":{"flarg":"glarg"}}');
                    done(err);
                });
            }, 10);
        });
    });

    describe('request validation', function(){
        it('does not log if validate function fails check', function(done) {
            events[0].handler({
                method: 'get',
                path: '/foo',
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: function(){ return []; },
                headers: {
                    "user-agent": "spider"
                }
            });

            setTimeout(function(){
                if (logs[2]) {
                    return done(Error("There should not be a second log"));
                }
                done();
            }, 10);
        });

        it('does log if validate function passes check', function(done) {
            events[0].handler({
                method: 'get',
                path: '/foo',
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: function(){ return []; },
                headers: {
                    "user-agent": "mozilla"
                }
            });

            setTimeout(function(){
                if (!logs[2]) {
                    return done(Error("There should be a second log"));
                }
                done();
            }, 10);
        });
    });

    describe('logs', function() {
        it('should handle a log', function(done){
            events[1].handler({
                data: {
                    somestuff: 'blarg'
                },
                tags: ['tag1', 'tag2']
            });

            setTimeout(function(){
                joi.validate(logs[3], schema.log, function(err){
                    done(err);
                });
            }, 10);
        });
    });

    describe('errors', function() {
        it('should handle an error', function(done){
            events[2].handler({}, {
                message: 'ohes noes it borked'
            });

            setTimeout(function(){
                joi.validate(logs[4], schema.error, function(err){
                    done(err);
                });
            }, 10);
        });

        it('should return immediately (without an error) when an error occurs', function(){
            discon = true;
            events[2].handler({}, {
                message: 'ohes noes it borked'
            });
        });
    });
});
