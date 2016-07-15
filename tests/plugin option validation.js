'use strict';

var expect = require('expect.js');
var hoek = require('hoek');
var plugin = require('../index.js');
var server = {
    on: function() {}
};
var validConfig = {
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

describe('plugin option validation', function() {
    describe('given null servicetype', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { servicetype: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: servicetype must be a string');
                done();
            });
        });
    });

    describe('given empty servicetype', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { servicetype: '' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: servicetype is not allowed to be empty');
                done();
            });
        });
    });

    describe('given null versions', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: versions must be an object');
                done();
            });
        });
    });

    describe('given invalid request version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 1, log: 'v2', error: 'v3' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: request must be a string');
                done();
            });
        });
    });

    describe('given invalid log version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 'v1', log: 2, error: 'v3' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: log must be a string');
                done();
            });
        });
    });

    describe('given invalid error version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 'v1', log: 'v2', error: 3 }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: error must be a string');
                done();
            });
        });
    });

    describe('given null redis', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: redis must be an object');
                done();
            });
        });
    });

    describe('given null host', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: null, port: 6379, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: host must be a string');
                done();
            });
        });
    });

    describe('given empty host', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '', port: 6379, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: host is not allowed to be empty');
                done();
            });
        });
    });

    describe('given null port', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: null, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: port must be a number');
                done();
            });
        });
    });

    describe('given invalid port', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 'abc', listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: port must be a number');
                done();
            });
        });
    });

    describe('given null listname', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 6379, listname: null }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: listname must be a string');
                done();
            });
        });
    });

    describe('given empty listname', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 6379, listname: '' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: listname is not allowed to be empty');
                done();
            });
        });
    });

    describe('given invalid console', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { console: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: console must be a boolean');
                done();
            });
        });
    });

    describe('given invalid payload', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { payload: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: payload must be a boolean');
                done();
            });
        });
    });

    describe('given invalid validate', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { validate: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: validate must be a Function');
                done();
            });
        });
    });
});
