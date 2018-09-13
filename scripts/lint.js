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
  'scripts/',
  'src/block/',
  'src/mnemonic/',
  'src/transaction/transaction.js',
  'src/transaction/output.js',
  'src/transaction/index.js',
  'src/transaction/signature.js',
  'src/transaction/sighash.js',
  'src/crypto/ecdsa.js',
  'src/crypto/random.js',
  'src/crypto/signature.js',
  'src/transaction/unspentoutput.js',
  'src/transaction/input/input.js',
  'src/transaction/input/multisig.js',
  'src/transaction/input/multisigscripthash.js',
  'src/transaction/input/publickey.js',
  'src/transaction/input/publickeyhash.js',
  'src/transaction/input/scripthash.js',
].join(' ');
process.exit(shell.exec(`./node_modules/.bin/eslint ${toTest}`).code);
