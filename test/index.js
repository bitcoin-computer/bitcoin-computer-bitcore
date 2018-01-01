'use strict';

var should = require('chai').should();
var bitcoinCash = require('..');

describe('#versionGuard', function() {
  it('global._bitcore should be defined', function() {
    should.equal(global._bitcoinCash, bitcoinCash.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      bitcoinCash.versionGuard('version');
    }).should.throw('More than one instance of bitcoincashjs');
  });
});
