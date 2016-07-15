'use strict';

var expect = require('expect.js');
var plugin = require('../index');

describe('plugin attributes', function() {
    it('should contain name', function() {
        expect(plugin.register.attributes.name).to.equal('hapi-ot-logger');
    });

    it('should contain version', function() {
        expect(plugin.register.attributes.version).to.equal('3.1.0');
    });
});
