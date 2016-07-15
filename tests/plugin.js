'use strict';

var expect = require('expect.js');
var plugin = require('../index.js');
var server = {
    events: [],
    on: function(name, handler) {
        this.events[name] = handler;
    }
};
var config = {
    servicetype: "myservice",
    versions: {
        request: 'v1',
        log: 'v2',
        error: 'v3'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        listname: 'logs'
    },
    console: false,
    payload: false,
    validate: function() {
        return true;
    }
};

describe('plugin', function() {
    describe('when registered', function() {
        before(function(done) {
            plugin.register(server, config, done);
        });

        it('should attach tail event handler', function() {
            expect(typeof(server.events['tail'])).to.equal('function');
        });

        it('should attach log event handler', function() {
            expect(typeof(server.events['log'])).to.equal('function');
        });

        it('should attach internalError event handler', function() {
            expect(typeof(server.events['internalError'])).to.equal('function');
        });
    });
});
