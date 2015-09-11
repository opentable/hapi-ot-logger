var pkg = require('../package.json');
 var should = require('should');

describe('Verify Package.json', function() {
  describe('Verify name', function(){
    it('Should be hapi-ot-logger', function(){
      pkg.name.should.be.equal('hapi-ot-logger');
    });
  });
  describe('Verify current version', function(){
    it('Should be 2.1.22', function(){
      pkg.version.should.be.equal('2.1.22');
    });
  });
  describe('Verify peerDependencies', function(){
    it('Should be look for hapi 9', function(){
      pkg.peerDependencies.hapi.should.be.equal('^9.0.0');
    });
  });
});
