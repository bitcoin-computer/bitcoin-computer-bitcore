/**
 * @license
 * https://github.com/BitcoinDB/BitcoinCashFlow
 * Copyright (c) 2018 Emilio Almansi
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

const shell = require('shelljs'); // eslint-disable-line import/no-extraneous-dependencies

shell.config.fatal = false;

// Add files and folders to the list as we fix the errors they contain.
const toTest = [
  'karma.conf.js',
  'scripts/',
  'src/block/',
  'src/mnemonic/',
  'src/transaction/',
  'src/util/',
  'src/encoding/',
  'src/errors',
  'src/crypto/ecdsa.js',
  'src/crypto/random.js',
  'src/crypto/signature.js',
  'src/crypto/point.js',
  'src/crypto/hash.js',
  'src/address.js',
].join(' ');
process.exit(shell.exec(`./node_modules/.bin/eslint ${toTest}`).code);
