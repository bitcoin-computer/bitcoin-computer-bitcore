const _ = require('lodash');
const inherits = require('inherits');
const Input = require('./input');
const Output = require('../output');
const $ = require('../../util/preconditions');
const Script = require('../../script');
const Signature = require('../../crypto/signature');
const Sighash = require('../sighash');
const BufferUtil = require('../../util/buffer');
const TransactionSignature = require('../signature');

/**
 * @constructor
 */
function MultiSigInput(input, pubkeys, threshold, signatures) {
  Input.apply(this, [input, pubkeys, threshold, signatures]);
  pubkeys = pubkeys || input.publicKeys;
  this.threshold = threshold || input.threshold;
  signatures = signatures || input.signatures;
  this.publicKeys = _.sortBy(pubkeys, publicKey => publicKey.toString('hex'));
  $.checkState(
    Script.buildMultisigOut(this.publicKeys, this.threshold).equals(this.output.script),
    "Provided public keys don't match to the provided output script",
  );
  this.publicKeyIndex = {};
  this.publicKeys.forEach((publicKey, index) => {
    this.publicKeyIndex[publicKey.toString()] = index;
  });
  // Empty array of signatures
  this.signatures = signatures ? this._deserializeSignatures(signatures) : new Array(this.publicKeys.length);
}
inherits(MultiSigInput, Input);

MultiSigInput.prototype.toObject = function(...args) {
  const obj = Input.prototype.toObject.apply(this, args);
  obj.threshold = this.threshold;
  obj.publicKeys = this.publicKeys.map(publicKey => publicKey.toString());
  obj.signatures = this._serializeSignatures();
  return obj;
};

MultiSigInput.prototype._deserializeSignatures = function(signatures) {
  return signatures.map(signature => (signature ? new TransactionSignature(signature) : undefined));
};

MultiSigInput.prototype._serializeSignatures = function() {
  return this.signatures.map(signature => (signature ? signature.toObject() : undefined));
};

MultiSigInput.prototype.getSignatures = function(transaction, privateKey, index, sigtype) {
  $.checkState(this.output instanceof Output, 'Malformed output found when signing transaction');
  sigtype = sigtype || Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID;

  const publicKeysForPrivateKey = this.publicKeys.filter(
    publicKey => publicKey.toString() === privateKey.publicKey.toString(),
  );
  return publicKeysForPrivateKey.map(
    publicKey =>
      new TransactionSignature({
        publicKey,
        prevTxId: this.prevTxId,
        outputIndex: this.outputIndex,
        inputIndex: index,
        signature: Sighash.sign(transaction, privateKey, sigtype, index, this.output.script, this.output.satoshisBN),
        sigtype,
      }),
  );
};

MultiSigInput.prototype.addSignature = function(transaction, signature) {
  $.checkState(!this.isFullySigned(), 'All needed signatures have already been added');
  $.checkArgument(
    this.publicKeyIndex[signature.publicKey.toString()] !== undefined,
    'Signature has no matching public key',
  );
  $.checkState(this.isValidSignature(transaction, signature), 'Signature invalid');
  this.signatures[this.publicKeyIndex[signature.publicKey.toString()]] = signature;
  this._updateScript();
  return this;
};

MultiSigInput.prototype._updateScript = function() {
  this.setScript(Script.buildMultisigIn(this.publicKeys, this.threshold, this._createSignatures()));
  return this;
};

MultiSigInput.prototype._createSignatures = function() {
  const definedSignatures = this.signatures.filter(signature => signature !== undefined);
  return definedSignatures.map(signature =>
    BufferUtil.concat([signature.signature.toDER(), BufferUtil.integerAsSingleByteBuffer(signature.sigtype)]),
  );
};

MultiSigInput.prototype.clearSignatures = function() {
  this.signatures = new Array(this.publicKeys.length);
  this._updateScript();
};

MultiSigInput.prototype.isFullySigned = function() {
  return this.countSignatures() === this.threshold;
};

MultiSigInput.prototype.countMissingSignatures = function() {
  return this.threshold - this.countSignatures();
};

MultiSigInput.prototype.countSignatures = function() {
  return this.signatures.reduce((sum, signature) => sum + !!signature, 0);
};

MultiSigInput.prototype.publicKeysWithoutSignature = function() {
  return this.publicKeys.filter(publicKey => !this.signatures[this.publicKeyIndex[publicKey.toString()]]);
};

MultiSigInput.prototype.isValidSignature = function(transaction, signature) {
  // FIXME: Refactor signature so this is not necessary
  signature.signature.nhashtype = signature.sigtype;
  return Sighash.verify(
    transaction,
    signature.signature,
    signature.publicKey,
    signature.inputIndex,
    this.output.script,
    this.output.satoshisBN,
  );
};

/**
 * @param {Buffer[]} signatures
 * @param {PublicKey[]} publicKeys
 * @param {Transaction} transaction
 * @param {Integer} inputIndex
 * @param {Input} input
 * @returns {TransactionSignature[]}
 */
// eslint-disable-next-line max-len
MultiSigInput.normalizeSignatures = function(transaction, input, inputIndex, signatures, publicKeys) {
  return publicKeys.map(pubKey => {
    let signatureMatch = null;
    signatures = signatures.filter(signatureBuffer => {
      if (signatureMatch) {
        return true;
      }

      const signature = new TransactionSignature({
        signature: Signature.fromTxFormat(signatureBuffer),
        publicKey: pubKey,
        prevTxId: input.prevTxId,
        outputIndex: input.outputIndex,
        inputIndex,
        sigtype: Signature.SIGHASH_ALL,
      });

      signature.signature.nhashtype = signature.sigtype;
      const isMatch = Sighash.verify(
        transaction,
        signature.signature,
        signature.publicKey,
        signature.inputIndex,
        input.output.script,
      );

      if (isMatch) {
        signatureMatch = signature;
        return false;
      }

      return true;
    });

    return signatureMatch || null;
  });
};

MultiSigInput.OPCODES_SIZE = 1; // 0
MultiSigInput.SIGNATURE_SIZE = 73; // size (1) + DER (<=72)

MultiSigInput.prototype._estimateSize = function() {
  return MultiSigInput.OPCODES_SIZE + this.threshold * MultiSigInput.SIGNATURE_SIZE;
};

module.exports = MultiSigInput;
