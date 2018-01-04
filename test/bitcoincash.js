'use strict';

var should = require('chai').should();
var bch = require('..');

describe('#versionGuard', function() {
  it('global._bitcore should be defined', function() {
    should.equal(global._bch, bch.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      bch.versionGuard('version');
    }).should.throw('More than one instance of bitcoincashjs');
  });
});
