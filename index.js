'use strict';

const bitcoinCash = module.exports;

// module information
bitcoinCash.version = 'v' + require('./package.json').version;
bitcoinCash.versionGuard = function(version) {
  if (version !== undefined) {
    const message = 'More than one instance of bitcoincashjs found. ' +
      'Please make sure to require bitcoincashjs and check that submodules do' +
      ' not also include their own bitcoincashjs dependency.';
    throw new Error(message);
  }
};
bitcoinCash.versionGuard(global._bitcoinCash);
global._bitcoinCash = bitcoinCash.version;

// crypto
bitcoinCash.crypto = {};
bitcoinCash.crypto.BN = require('./src/crypto/bn');
bitcoinCash.crypto.ECDSA = require('./src/crypto/ecdsa');
bitcoinCash.crypto.Hash = require('./src/crypto/hash');
bitcoinCash.crypto.Random = require('./src/crypto/random');
bitcoinCash.crypto.Point = require('./src/crypto/point');
bitcoinCash.crypto.Signature = require('./src/crypto/signature');

// encoding
bitcoinCash.encoding = {};
bitcoinCash.encoding.Base58 = require('./src/encoding/base58');
bitcoinCash.encoding.Base58Check = require('./src/encoding/base58check');
bitcoinCash.encoding.BufferReader = require('./src/encoding/bufferreader');
bitcoinCash.encoding.BufferWriter = require('./src/encoding/bufferwriter');
bitcoinCash.encoding.Varint = require('./src/encoding/varint');

// utilities
bitcoinCash.util = {};
bitcoinCash.util.buffer = require('./src/util/buffer');
bitcoinCash.util.js = require('./src/util/js');
bitcoinCash.util.preconditions = require('./src/util/preconditions');

// errors thrown by the library
bitcoinCash.errors = require('./src/errors');

// main bitcoin library
bitcoinCash.Address = require('./src/address');
bitcoinCash.Block = require('./src/block');
bitcoinCash.MerkleBlock = require('./src/block/merkleblock');
bitcoinCash.BlockHeader = require('./src/block/blockheader');
bitcoinCash.HDPrivateKey = require('./src/hdprivatekey.js');
bitcoinCash.HDPublicKey = require('./src/hdpublickey.js');
bitcoinCash.Networks = require('./src/networks');
bitcoinCash.Opcode = require('./src/opcode');
bitcoinCash.PrivateKey = require('./src/privatekey');
bitcoinCash.PublicKey = require('./src/publickey');
bitcoinCash.Script = require('./src/script');
bitcoinCash.Transaction = require('./src/transaction');
bitcoinCash.URI = require('./src/uri');
bitcoinCash.Unit = require('./src/unit');

// dependencies, subject to change
bitcoinCash.deps = {};
bitcoinCash.deps.bnjs = require('bn.js');
bitcoinCash.deps.bs58 = require('bs58');
bitcoinCash.deps.Buffer = Buffer;
bitcoinCash.deps.elliptic = require('elliptic');
bitcoinCash.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
bitcoinCash.Transaction.sighash = require('./src/transaction/sighash');
