'use strict';

var expect = require('expect.js');
var hoek = require('hoek');
var plugin = require('../index');
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

describe('plugin (option validation)', function() {
    describe('given null servicetype', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { servicetype: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "servicetype" fails because ["servicetype" must be a string]');
                done();
            });
        });
    });

    describe('given empty servicetype', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { servicetype: '' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "servicetype" fails because ["servicetype" is not allowed to be empty]');
                done();
            });
        });
    });

    describe('given null versions', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "versions" fails because ["versions" must be an object]');
                done();
            });
        });
    });

    describe('given invalid request version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 1, log: 'v2', error: 'v3' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "versions" fails because [child "request" fails because ["request" must be a string]]');
                done();
            });
        });
    });

    describe('given invalid log version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 'v1', log: 2, error: 'v3' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "versions" fails because [child "log" fails because ["log" must be a string]]');
                done();
            });
        });
    });

    describe('given invalid error version', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { versions:{ request: 'v1', log: 'v2', error: 3 }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "versions" fails because [child "error" fails because ["error" must be a string]]');
                done();
            });
        });
    });

    describe('given null redis', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis: null }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because ["redis" must be an object]');
                done();
            });
        });
    });

    describe('given null host', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: null, port: 6379, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "host" fails because ["host" must be a string]]');
                done();
            });
        });
    });

    describe('given empty host', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '', port: 6379, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "host" fails because ["host" is not allowed to be empty]]');
                done();
            });
        });
    });

    describe('given null port', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: null, listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "port" fails because ["port" must be a number]]');
                done();
            });
        });
    });

    describe('given invalid port', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 'abc', listname: 'logs' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "port" fails because ["port" must be a number]]');
                done();
            });
        });
    });

    describe('given null listname', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 6379, listname: null }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "listname" fails because ["listname" must be a string]]');
                done();
            });
        });
    });

    describe('given empty listname', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { redis:{ host: '127.0.0.1', port: 6379, listname: '' }}, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "redis" fails because [child "listname" fails because ["listname" is not allowed to be empty]]');
                done();
            });
        });
    });

    describe('given invalid console', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { console: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "console" fails because ["console" must be a boolean]');
                done();
            });
        });
    });

    describe('given invalid payload', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { payload: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "payload" fails because ["payload" must be a boolean]');
                done();
            });
        });
    });

    describe('given invalid validate', function() {
        it('should return error', function(done) {
            var config = hoek.applyToDefaults(validConfig, { validate: 'invalid' }, true);

            plugin.register(server, config, function(err) {
                expect(err.toString()).to.equal('ValidationError: child "validate" fails because ["validate" must be a Function]');
                done();
            });
        });
    });
});
