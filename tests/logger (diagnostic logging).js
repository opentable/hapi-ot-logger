'use strict';

var expect = require('expect.js');
var joi    = require('joi');
var rewire = require('rewire');
var schema = require('./schema');

describe('logger (diagnostic logging)', function() {
    describe('when logging diagnostic info', function() {
        var cfg
        var consoleEntry;
        var logEntry;

        before(function(done) {
            var logger = rewire('../lib/logger');

            logger.config({
                console: true,
                payload: true
            }, function() {
                cfg = logger.__get__("cfg");

                logger.__set__('consoleWriter', {
                    log: function(_consoleEntry) {
                        consoleEntry = _consoleEntry;
                    }
                });

                logger.__set__('client', {
                    rpush: function(listname, _logEntry) {
                        logEntry = _logEntry;
                    }
                });

                logger.log({
                    data: {},
                    tags: ['tag']
                });

                done();
            });
        });

        it('should push diagnostic log to redis', function() {
            joi.validate(logEntry, schema.log, function(err) {
                if(err) {
                    throw err;
                }
            });
        });

        it('should write to console out', function() {
            expect(consoleEntry).to.not.be(undefined);
        });

        it('should increment sequence number', function() {
            expect(cfg.sequencenumber).to.equal(2);
        });
    });
});
