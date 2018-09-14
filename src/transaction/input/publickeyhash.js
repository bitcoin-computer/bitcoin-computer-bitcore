const inherits = require('inherits');
const $ = require('../../util/preconditions');
const BufferUtil = require('../../util/buffer');
const Hash = require('../../crypto/hash');
const Input = require('./input');
const Output = require('../output');
const Sighash = require('../sighash');
const Script = require('../../script');
const Signature = require('../../crypto/signature');
const TransactionSignature = require('../signature');

/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 * @constructor
 */
function PublicKeyHashInput(...args) {
  Input.apply(this, args);
}
inherits(PublicKeyHashInput, Input);

/**
 * @param {Transaction} transaction - the transaction to be signed
 * @param {PrivateKey} privateKey - the private key with which to sign the transaction
 * @param {number} index - the index of the input in the transaction input vector
 * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
 * @param {Buffer=} hashData - the precalculated hash of the public key associated with the
 *   privateKey provided
 * @return {Array} of objects that can be
 */
// eslint-disable-next-line max-len
PublicKeyHashInput.prototype.getSignatures = function (transaction, privateKey, index, sigtype, hashData) {
  $.checkState(this.output instanceof Output, 'Malformed output found when signing transaction');
  hashData = hashData || Hash.sha256ripemd160(privateKey.publicKey.toBuffer());
  sigtype = sigtype || (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID);

  if (BufferUtil.equals(hashData, this.output.script.getPublicKeyHash())) {
    return [new TransactionSignature({
      publicKey: privateKey.toPublicKey(),
      prevTxId: this.prevTxId,
      outputIndex: this.outputIndex,
      inputIndex: index,
      signature: Sighash.sign(
        transaction,
        privateKey,
        sigtype,
        index,
        this.output.script,
        this.output.satoshisBN,
      ),
      sigtype,
    })];
  }
  return [];
};

/**
 * Add the provided signature
 *
 * @param {Object} signature
 * @param {PublicKey} signature.publicKey
 * @param {Signature} signature.signature
 * @param {number=} signature.sigtype
 * @return {PublicKeyHashInput} this, for chaining
 */
PublicKeyHashInput.prototype.addSignature = function (transaction, signature) {
  $.checkState(this.isValidSignature(transaction, signature), 'Failed adding signature because it is invalid');
  this.setScript(Script.buildPublicKeyHashIn(
    signature.publicKey,
    signature.signature.toDER(),
    signature.sigtype,
  ));
  return this;
};

/**
 * Clear the input's signature
 * @return {PublicKeyHashInput} this, for chaining
 */
PublicKeyHashInput.prototype.clearSignatures = function () {
  this.setScript(Script.empty());
  return this;
};

/**
 * Query whether the input is signed
 * @return {boolean}
 */
PublicKeyHashInput.prototype.isFullySigned = function () {
  return this.script.isPublicKeyHashIn();
};

PublicKeyHashInput.SCRIPT_MAX_SIZE = 73 + 34; // sigsize (1 + 72) + pubkey (1 + 33)

PublicKeyHashInput.prototype._estimateSize = function () {
  return PublicKeyHashInput.SCRIPT_MAX_SIZE;
};

module.exports = PublicKeyHashInput;
