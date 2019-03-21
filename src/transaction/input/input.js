const buffer = require('buffer')
const $ = require('../../util/preconditions')
const errors = require('../../errors')
const BufferWriter = require('../../encoding/bufferwriter')
const BufferUtil = require('../../util/buffer')
const JSUtil = require('../../util/js')
const Script = require('../../script')
const Sighash = require('../sighash')
const Output = require('../output')

const MAXINT = 0xffffffff // Math.pow(2, 32) - 1;
const DEFAULT_RBF_SEQNUMBER = MAXINT - 2
const DEFAULT_SEQNUMBER = MAXINT
const DEFAULT_LOCKTIME_SEQNUMBER = MAXINT - 1

function Input(params) {
  if (!(this instanceof Input)) {
    return new Input(params)
  }
  if (params) {
    return this._fromObject(params)
  }
}

Input.MAXINT = MAXINT
Input.DEFAULT_SEQNUMBER = DEFAULT_SEQNUMBER
Input.DEFAULT_LOCKTIME_SEQNUMBER = DEFAULT_LOCKTIME_SEQNUMBER
Input.DEFAULT_RBF_SEQNUMBER = DEFAULT_RBF_SEQNUMBER

Object.defineProperty(Input.prototype, 'script', {
  configurable: false,
  enumerable: true,
  get() {
    if (this.isNull()) {
      return null
    }
    if (!this._script) {
      this._script = new Script(this._scriptBuffer)
      this._script._isInput = true
    }
    return this._script
  },
})

Input.fromObject = function(obj) {
  $.checkArgument(obj !== null && typeof obj === 'object')
  return new Input()._fromObject(obj)
}

Input.prototype._fromObject = function(params) {
  if (params.script === undefined && params.scriptBuffer === undefined) {
    throw new errors.Transaction.Input.MissingScript()
  }

  this.prevTxId =
    typeof params.prevTxId === 'string' && JSUtil.isHexa(params.prevTxId)
      ? new buffer.Buffer(params.prevTxId, 'hex')
      : params.prevTxId

  if (params.output) {
    this.output = params.output instanceof Output ? params.output : new Output(params.output)
  }

  this.outputIndex = params.outputIndex === undefined ? params.txoutnum : params.outputIndex

  if (params.sequenceNumber !== undefined) {
    this.sequenceNumber = params.sequenceNumber
  } else if (params.seqnum !== undefined) {
    this.sequenceNumber = params.seqnum
  } else {
    this.sequenceNumber = DEFAULT_SEQNUMBER
  }

  this.setScript(params.scriptBuffer || params.script)
  return this
}

Input.prototype.toJSON = function toObject() {
  const obj = {
    prevTxId: this.prevTxId.toString('hex'),
    outputIndex: this.outputIndex,
    sequenceNumber: this.sequenceNumber,
    script: this._scriptBuffer.toString('hex'),
  }
  // add human readable form if input contains valid script
  if (this.script) {
    obj.scriptString = this.script.toString()
  }
  if (this.output) {
    obj.output = this.output.toObject()
  }
  return obj
}

Input.prototype.toObject = Input.prototype.toJSON

Input.fromBufferReader = function(br) {
  const input = new Input()
  input.prevTxId = br.readReverse(32)
  input.outputIndex = br.readUInt32LE()
  input._scriptBuffer = br.readVarLengthBuffer()
  input.sequenceNumber = br.readUInt32LE()
  // TODO: return different classes according to which input it is
  // e.g: CoinbaseInput, PublicKeyHashInput, MultiSigScriptHashInput, etc.
  return input
}

Input.prototype.toBufferWriter = function(writer) {
  writer = writer || new BufferWriter()
  writer.writeReverse(this.prevTxId)
  writer.writeUInt32LE(this.outputIndex)
  const script = this._scriptBuffer
  writer.writeVarintNum(script.length)
  writer.write(script)
  writer.writeUInt32LE(this.sequenceNumber)
  return writer
}

Input.prototype.setScript = function(script) {
  this._script = null
  if (script instanceof Script) {
    this._script = script
    this._script._isInput = true
    this._scriptBuffer = script.toBuffer()
  } else if (JSUtil.isHexa(script)) {
    // hex string script
    this._scriptBuffer = new buffer.Buffer(script, 'hex')
  } else if (typeof script === 'string') {
    // human readable string script
    this._script = new Script(script)
    this._script._isInput = true
    this._scriptBuffer = this._script.toBuffer()
  } else if (BufferUtil.isBuffer(script)) {
    // buffer script
    this._scriptBuffer = new buffer.Buffer(script)
  } else {
    throw new TypeError('Invalid argument type: script')
  }
  return this
}

/**
 * Retrieve signatures for the provided PrivateKey.
 *
 * @param {Transaction} transaction - the transaction to be signed
 * @param {PrivateKey} privateKey - the private key to use when signing
 * @param {number} inputIndex - the index of this input in the provided transaction
 * @param {number} sigType - defaults to Signature.SIGHASH_ALL
 * @param {Buffer} addressHash - if provided, don't calculate the hash of the
 *     public key associated with the private key provided
 * @abstract
 */
Input.prototype.getSignatures = function() {
  throw new errors.AbstractMethodInvoked(
    `${'Trying to sign unsupported output type (only P2PKH and P2SH multisig inputs are supported)' +
      ' for input: '}${JSON.stringify(this)}`,
  )
}

Input.prototype.isFullySigned = function() {
  throw new errors.AbstractMethodInvoked('Input#isFullySigned')
}

Input.prototype.isFinal = function() {
  return this.sequenceNumber !== 4294967295
}

Input.prototype.addSignature = function() {
  throw new errors.AbstractMethodInvoked('Input#addSignature')
}

Input.prototype.clearSignatures = function() {
  throw new errors.AbstractMethodInvoked('Input#clearSignatures')
}

Input.prototype.isValidSignature = function(transaction, signature) {
  // FIXME: Refactor signature so this is not necessary
  signature.signature.nhashtype = signature.sigtype
  return Sighash.verify(
    transaction,
    signature.signature,
    signature.publicKey,
    signature.inputIndex,
    this.output.script,
    this.output.satoshisBN,
  )
}

/**
 * @returns true if this is a coinbase input (represents no input)
 */
Input.prototype.isNull = function() {
  return (
    this.prevTxId.toString('hex') === '0000000000000000000000000000000000000000000000000000000000000000' &&
    this.outputIndex === 0xffffffff
  )
}

Input.prototype._estimateSize = function() {
  return this.toBufferWriter().toBuffer().length
}

module.exports = Input
