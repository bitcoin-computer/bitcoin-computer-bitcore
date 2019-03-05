const _ = require('lodash')
const $ = require('./util/preconditions')
const Address = require('./address')
const PublicKey = require('./publickey')
const PrivateKey = require('./privatekey')
const BufferWriter = require('./encoding/bufferwriter')
const ECDSA = require('./crypto/ecdsa')
const Signature = require('./crypto/signature')
const { sha256sha256 } = require('./crypto/hash')
const JSUtil = require('./util/js')

const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n')

/**
 * constructs a new message to sign and verify.
 *
 * @param {String} message
 * @returns {Message}
 */
class Message {
  constructor(message) {
    if (!(this instanceof Message)) {
      return new Message(message)
    }
    $.checkArgument(_.isString(message), 'First argument should be a string')
    this.message = message

    return this
  }

  magicHash() {
    const prefix1 = BufferWriter.varintBufNum(MAGIC_BYTES.length)
    const messageBuffer = Buffer.from(this.message)
    const prefix2 = BufferWriter.varintBufNum(messageBuffer.length)
    const buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer])
    const hash = sha256sha256(buf)
    return hash
  }

  _sign(privateKey) {
    $.checkArgument(privateKey instanceof PrivateKey, 'First argument should be an instance of PrivateKey')
    const hash = this.magicHash()
    const ecdsa = new ECDSA()
    ecdsa.hashbuf = hash
    ecdsa.privkey = privateKey
    ecdsa.pubkey = privateKey.toPublicKey()
    ecdsa.signRandomK()
    ecdsa.calci()
    return ecdsa.sig
  }

  /**
   * Will sign a message with a given bitcoin private key.
   *
   * @param {PrivateKey} privateKey - An instance of PrivateKey
   * @returns {String} A base64 encoded compact signature
   */
  sign(privateKey) {
    const signature = this._sign(privateKey)
    return signature.toCompact().toString('base64')
  }

  _verify(publicKey, signature) {
    $.checkArgument(publicKey instanceof PublicKey, 'First argument should be an instance of PublicKey')
    $.checkArgument(signature instanceof Signature, 'Second argument should be an instance of Signature')
    const hash = this.magicHash()
    const verified = ECDSA.verify(hash, signature, publicKey)
    if (!verified) {
      this.error = 'The signature was invalid'
    }
    return verified
  }

  /**
   * Will return a boolean if the signature is valid for a given bitcoin address.
   * If it isn't the specific reason is accessible via the "error" member.
   *
   * @param {Address|String} bitcoinAddress - A bitcoin address
   * @param {String} signatureString - A base64 encoded compact signature
   * @returns {Boolean}
   */
  verify(bitcoinAddress, signatureString) {
    $.checkArgument(bitcoinAddress)
    $.checkArgument(signatureString && _.isString(signatureString))

    if (_.isString(bitcoinAddress)) {
      bitcoinAddress = Address.fromString(bitcoinAddress)
    }
    const signature = Signature.fromCompact(Buffer.from(signatureString, 'base64'))

    // recover the public key
    const ecdsa = new ECDSA()
    ecdsa.hashbuf = this.magicHash()
    ecdsa.sig = signature
    const publicKey = ecdsa.toPublicKey()

    const signatureAddress = Address.fromPublicKey(publicKey, bitcoinAddress.network)

    // check that the recovered address and specified address match
    if (bitcoinAddress.toString() !== signatureAddress.toString()) {
      this.error = 'The signature did not match the message digest'
      return false
    }

    return this._verify(publicKey, signature)
  }

  /**
   * Instantiate a message from a message string
   *
   * @param {String} str - A string of the message
   * @returns {Message} A new instance of a Message
   */
  static fromString(str) {
    return new Message(str)
  }

  /**
   * Instantiate a message from JSON
   *
   * @param {String} json - An JSON string or Object with keys: message
   * @returns {Message} A new instance of a Message
   */
  static fromJSON(json) {
    if (JSUtil.isValidJSON(json)) {
      json = JSON.parse(json)
    }
    return new Message(json.message)
  }

  /**
   * @returns {Object} A plain object with the message information
   */
  toObject() {
    return {
      message: this.message,
    }
  }

  /**
   * @returns {String} A JSON representation of the message information
   */
  toJSON() {
    return JSON.stringify(this.toObject())
  }

  /**
   * Will return a the string representation of the message
   *
   * @returns {String} Message
   */
  toString() {
    return this.message
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns {String} Message
   */
  inspect() {
    return `<Message: ${this.toString()}>`
  }
}

module.exports = Message
