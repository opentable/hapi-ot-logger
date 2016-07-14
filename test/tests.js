'use strict';

describe('logger tests', () =>{
    const net = require('net');
    let should = require('should');
    const plugin = require('../index');
    const schema = require('./schema');
    const joi = require('joi');
    const events = [];
    const logs = [];
    let options;
    let discon = false;
    const p = {
        on: function(type, handler){
            events.push({ type, handler })
        },
        log: () =>{}
    };

    should=should;

    const remoteServer = net.createServer(c => {
        c.on('data', data => {
            const d = data.toString();

            if(discon){
                c.end();
                return;
            }

            if (d.indexOf('rpush\r\n') > -1) {
                logs.push(JSON.parse(d.split('\r\n')[6]));
                c.write(':1\r\n');
            }

            if (d.indexOf('info\r\n') > -1) {
                c.write('$32\r\n# Server\r\nredis_version:2.6.16\r\n');
            }

            if (d.indexOf('quit\r\n') > -1) {
                c.end();
            }
        });
    });

    before(done => {
        remoteServer.listen(() => {
            options = {
                redis: {
                    port: remoteServer.address().port
                },
                payload: true,
                validate: log => {
                    return log.logname === 'request' && log.headers['user-agent'] !== 'spider';
                }
            };
            done();
        });
    });

    describe('setup', () => {
        it('should register the plugin', done => {
            plugin.register(p, options, () =>{
                events.length.should.eql(3);
                events[0].type.should.eql('tail');
                events[1].type.should.eql('log');
                events[2].type.should.eql('internalError');
                done();
            });
        });
    })

    describe('simple requests', () => {
        it('should handle a request', done => {
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
                getLog: () =>{ return []; },
                headers: {
                    'ot-requestid': 'abcd-1234-abcd-1234',
                    'user-agent': 'tests',
                    'ot-userid': 'user1234',
                    'ot-sessionid': '1234-abcd-1234-abcd',
                    'ot-referringhost': 'referringhost',
                    'ot-referringservice': 'referringservice',
                    'accept-language': 'en-GB,en;q=0.8'
                }
            });

            setTimeout(() =>{
                joi.validate(logs[0], schema.request, err => {
                    done(err);
                });
            }, 10);
        });

        it('should include the body from a PUT/POST request', done => {
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
                getLog: () =>{ return []; },
                headers: {
                    'ot-requestid': 'abcd-1234-abcd-1234',
                    'user-agent': 'tests',
                    'ot-userid': 'user1234',
                    'ot-sessionid': '1234-abcd-1234-abcd',
                    'ot-referringhost': 'referringhost',
                    'ot-referringservice': 'referringservice',
                    'accept-language': 'en-GB,en;q=0.8'
                }
            });

            setTimeout(() =>{
                joi.validate(logs[1], schema.request, err => {
                    logs[1].payload.should.equal('{"foo":"bar","baz":{"flarg":"glarg"}}');
                    done(err);
                });
            }, 10);
        });
    });

    describe('request validation', () =>{
        it('does not log if validate function fails check', done => {
            events[0].handler({
                method: 'get',
                path: '/foo',
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: () =>{ return []; },
                headers: {
                    'user-agent': 'spider'
                }
            });

            setTimeout(() =>{
                if (logs[2]) {
                    return done(Error('There should not be a second log'));
                }
                done();
            }, 10);
        });

        it('does log if validate function passes check', done => {
            events[0].handler({
                method: 'get',
                path: '/foo',
                response: {
                    statusCode: 200
                },
                info: {
                    received: Date.now()
                },
                getLog: () =>{ return []; },
                headers: {
                    'user-agent': 'mozilla'
                }
            });

            setTimeout(() =>{
                if (!logs[2]) {
                    return done(Error('There should be a second log'));
                }
                done();
            }, 10);
        });
    });

    describe('logs', () => {
        it('should handle a log', done =>{
            events[1].handler({
                data: {
                    somestuff: 'blarg'
                },
                tags: ['tag1', 'tag2']
            });

            setTimeout(() =>{
                joi.validate(logs[3], schema.log, err => {
                    done(err);
                });
            }, 10);
        });
    });

    describe('errors', () => {
        it('should handle an error', done =>{
            events[2].handler({}, {
                message: 'ohes noes it borked'
            });

            setTimeout(() =>{
                joi.validate(logs[4], schema.error, err => {
                    done(err);
                });
            }, 10);
        });

        it('should return immediately (without an error) when an error occurs', () =>{
            discon = true;
            events[2].handler({}, {
                message: 'ohes noes it borked'
            });
        });
    });
});
