'use strict';

var expect = require('expect.js');
var joi    = require('joi');
var rewire = require('rewire');
var schema = require('./schema');

describe('logger (request logging)', function() {
    describe('when logging request', function() {
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

                logger.request({
                    method: 'get',
                    path: '/foo',
                    query: {
                        active: true,
                        ids: [1, 2, 3]
                    },
                    payload: {
                        value: 'test'
                    },
                    response: {
                        statusCode: 200
                    },
                    info: {
                        received: Date.now() - 1000
                    },
                    getLog: function() {
                        return [
                            {
                                'tags': ['received'],
                                'internal': true
                            },
                            {
                                'tags': ['response'],
                                'internal': true
                            }
                        ];
                    },
                    headers: {
                        'ot-requestid': '67c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'user-agent': 'ot',
                        'ot-userid': '12c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'ot-sessionid': '34c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'ot-referringhost': 'oc',
                        'ot-referringservice': 'listing',
                        'accept-language': 'en-US, *',
                        header1: 'value1',
                        header2: 'value2'
                    }
                });

                done();
            });
        });

        it('should push request log to redis', function() {
            joi.validate(logEntry, schema.request, function(err) {
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

    describe('when logging request with failing validation function', function() {
        var cfg
        var consoleEntry;
        var logEntry;

        before(function(done) {
            var logger = rewire('../lib/logger');

            logger.config({
                validate: function() { return false; },
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

                logger.request({
                    method: 'get',
                    path: '/foo',
                    query: {
                        active: true,
                        ids: [1, 2, 3]
                    },
                    payload: {
                        value: 'test'
                    },
                    response: {
                        statusCode: 200
                    },
                    info: {
                        received: Date.now() - 1000
                    },
                    getLog: function() {
                        return [
                            {
                                'tags': ['received'],
                                'internal': true
                            },
                            {
                                'tags': ['response'],
                                'internal': true
                            }
                        ];
                    },
                    headers: {
                        'ot-requestid': '67c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'user-agent': 'ot',
                        'ot-userid': '12c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'ot-sessionid': '34c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce',
                        'ot-referringhost': 'oc',
                        'ot-referringservice': 'listing',
                        'accept-language': 'en-US, *',
                        header1: 'value1',
                        header2: 'value2'
                    }
                });

                done();
            });
        });

        it('should not push request log to redis', function() {
            expect(logEntry).to.be(undefined);
        });

        it('should not write to console out', function() {
            expect(consoleEntry).to.be(undefined);
        });

        it('should not increment sequence number', function() {
            expect(cfg.sequencenumber).to.equal(1);
        });
    });
});
