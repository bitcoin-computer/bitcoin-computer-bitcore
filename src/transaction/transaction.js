import _ from 'lodash'
import bufferCompare from 'buffer-compare'
import $ from '../util/preconditions'
import Address from '../address'
import BN from '../crypto/bn'
import BufferReader from '../encoding/bufferreader'
import BufferUtil from '../util/buffer'
import BufferWriter from '../encoding/bufferwriter'
import errors from '../errors'
import Hash from '../crypto/hash'
import Input from './input/input'
import JSUtil from '../util/js'
import MultiSigScriptHashInput from './input/multisigscripthash'
import MultiSigInput from './input/multisig'
import Output from './output'
import PrivateKey from '../privatekey'
import PublicKeyInput from './input/publickey'
import PublicKeyHashInput from './input/publickeyhash'
import Script from '../script/script'
import Sighash from './sighash'
import Signature from '../crypto/signature'
import UnspentOutput from './unspentoutput'

const compare = Buffer.compare || bufferCompare

const CURRENT_VERSION = 1
const DEFAULT_NLOCKTIME = 0
const MAX_BLOCK_SIZE = 1000000

/**
 * Represents a transaction, a set of inputs and outputs to change ownership of tokens
 *
 * @param {*} serialized
 * @constructor
 */
class Transaction {
  constructor(serialized) {
    this.inputs = []
    this.outputs = []
    this._inputAmount = undefined
    this._outputAmount = undefined

    if (serialized) {
      if (serialized instanceof Transaction) {
        return Transaction.shallowCopy(serialized)
      }
      if (JSUtil.isHexa(serialized)) {
        this.fromString(serialized)
      } else if (BufferUtil.isBuffer(serialized)) {
        this.fromBuffer(serialized)
      } else if (_.isObject(serialized)) {
        this.fromObject(serialized)
      } else {
        throw new errors.InvalidArgument(
          'Must provide an object or string to deserialize a transaction'
        )
      }
    } else {
      this._newTransaction()
    }
  }

  get hash() {
    return new BufferReader(this._getHash()).readReverse().toString('hex')
  }

  get witnessHash() {
    return new BufferReader(this._getWitnessHash()).readReverse().toString('hex');
  }

  get id() {
    return new BufferReader(this._getHash()).readReverse().toString('hex')
  }

  get inputAmount() {
    return this._getInputAmount()
  }

  get outputAmount() {
    return this._getOutputAmount()
  }

  /**
   * Retrieve the little endian hash of the transaction (used for serialization)
   * @return {Buffer}
   */
  _getHash() {
    return Hash.sha256sha256(this.toBuffer(true))
  }

  /**
   * Retrieve the little endian hash of the transaction including witness data
   * @return {Buffer}
   */
  _getWitnessHash () {
    return Hash.sha256sha256(this.toBuffer(false))
  }

  /**
   * Retrieve a hexa string that can be used with bitcoind's CLI interface
   * (decoderawtransaction, sendrawtransaction)
   *
   * @param {Object|boolean=} unsafe if true, skip all tests. if it's an object,
   *   it's expected to contain a set of flags to skip certain tests:
   * * `disableAll`: disable all checks
   * * `disableSmallFees`: disable checking for fees that are too small
   * * `disableLargeFees`: disable checking for fees that are too large
   * * `disableIsFullySigned`: disable checking if all inputs are fully signed
   * * `disableDustOutputs`: disable checking if there are no outputs that are dust amounts
   * * `disableMoreOutputThanInput`: disable checking if the transaction spends more bitcoins than
   *    the sum of the input amounts
   * @return {string}
   */
  serialize(unsafe) {
    if (unsafe === true || (unsafe && unsafe.disableAll)) {
      return this.uncheckedSerialize()
    }
    return this.checkedSerialize(unsafe)
  }

  toString() {
    return this.toBuffer().toString('hex')
  }

  uncheckedSerialize() {
    return this.toString()
  }

  /**
   * Retrieve a hexa string that can be used with bitcoind's CLI interface
   * (decoderawtransaction, sendrawtransaction)
   *
   * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
   * @return {string}
   */
  checkedSerialize(opts) {
    const serializationError = this.getSerializationError(opts)
    if (serializationError) {
      serializationError.message +=
        ' - For more information please see: https://bitcore.io/api/lib/transaction#serialization-checks'
      throw serializationError
    }
    return this.uncheckedSerialize()
  }

  invalidSatoshis() {
    return this.outputs.some((output) => output.invalidSatoshis())
  }

  /**
   * Retrieve a possible error that could appear when trying to serialize and
   * broadcast this transaction.
   *
   * @param {Object} opts allows to skip certain tests. {@see Transaction#serialize}
   * @return {bitcore.Error}
   */
  getSerializationError(opts = {}) {
    if (this.invalidSatoshis()) {
      return new errors.Transaction.InvalidSatoshis()
    }

    const unspent = this._getUnspentValue()
    let unspentError
    if (unspent < 0) {
      if (!opts.disableMoreOutputThanInput) {
        unspentError = new errors.Transaction.InvalidOutputAmountSum()
      }
    } else {
      unspentError = this._hasFeeError(opts, unspent)
    }

    return unspentError || this._hasDustOutputs(opts) || this._isMissingSignatures(opts)
  }

  _hasFeeError(opts, unspent) {
    if (this._fee !== undefined && this._fee !== unspent) {
      return new errors.Transaction.FeeError.Different(
        `Unspent value is ${unspent} but specified fee is ${this._fee}`
      )
    }

    if (!opts.disableLargeFees) {
      const maximumFee = Math.floor(Transaction.FEE_SECURITY_MARGIN * this._estimateFee())
      if (unspent > maximumFee) {
        if (this._missingChange()) {
          return new errors.Transaction.ChangeAddressMissing(
            'Fee is too large and no change address was provided'
          )
        }
        return new errors.Transaction.FeeError.TooLarge(
          `expected less than ${maximumFee} but got ${unspent}`
        )
      }
    }

    if (!opts.disableSmallFees) {
      const minimumFee = Math.ceil(this._estimateFee() / Transaction.FEE_SECURITY_MARGIN)
      if (unspent < minimumFee) {
        return new errors.Transaction.FeeError.TooSmall(
          `expected more than ${minimumFee} but got ${unspent}`
        )
      }
    }

    return undefined
  }

  _missingChange() {
    return !this._changeScript
  }

  _hasDustOutputs(opts) {
    if (!opts.disableDustOutputs) {
      // eslint-disable-next-line max-len
      const dustOutputs = this.outputs.filter(
        (output) => output.satoshis < Transaction.DUST_AMOUNT && !output.script.isDataOut()
      )
      if (dustOutputs.length > 0) {
        return new errors.Transaction.DustOutputs()
      }
    }

    return undefined
  }

  _isMissingSignatures(opts) {
    if (!opts.disableIsFullySigned && !this.isFullySigned()) {
      return new errors.Transaction.MissingSignatures()
    }
    return undefined
  }

  inspect() {
    return `<Transaction: ${this.uncheckedSerialize()}>`
  }

  toBuffer(noWitness) {
    const writer = new BufferWriter()
    return this.toBufferWriter(writer, noWitness).toBuffer()
  }

  hasWitnesses() {
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputs[i].hasWitnesses()) {
        return true;
      }
    }
    return false;
  }

  toBufferWriter(writer, noWitness) {
    writer.writeInt32LE(this.version)

    const hasWitnesses = this.hasWitnesses()

    if (hasWitnesses && !noWitness) {
      writer.write(Buffer.from('0001', 'hex'))
    }
    writer.writeVarintNum(this.inputs.length)
    this.inputs.forEach((input) => input.toBufferWriter(writer))
    writer.writeVarintNum(this.outputs.length)
    this.outputs.forEach((output) => output.toBufferWriter(writer))

    if (hasWitnesses && !noWitness) {
      this.inputs.forEach((input) => {
        const witnesses = input.getWitnesses()
        writer.writeVarintNum(witnesses.length)
        for (let j = 0; j < witnesses.length; j++) {
          writer.writeVarintNum(witnesses[j].length)
          writer.write(witnesses[j])
        }
      })
    }
    writer.writeUInt32LE(this.nLockTime)
    return writer
  }

  fromBuffer(buffer) {
    const reader = new BufferReader(buffer)
    return this.fromBufferReader(reader)
  }

  fromBufferReader(reader) {
    $.checkArgument(
      !reader.finished(),
      'No transaction data received when creating transaction from buffer'
    )
    let i

    this.version = reader.readInt32LE()
    let sizeTxIns = reader.readVarintNum()

    // check for segwit
    let hasWitnesses = false;
    if (sizeTxIns === 0 && reader.buf[reader.pos] !== 0) {
      reader.pos += 1;
      hasWitnesses = true;
      sizeTxIns = reader.readVarintNum();
    }

    for (i = 0; i < sizeTxIns; i += 1) {
      const input = Input.fromBufferReader(reader)
      this.inputs.push(input)
    }
    const sizeTxOuts = reader.readVarintNum()
    for (i = 0; i < sizeTxOuts; i += 1) {
      this.outputs.push(Output.fromBufferReader(reader))
    }

    if (hasWitnesses) {
      for (let k = 0; k < sizeTxIns; k++) {
        const itemCount = reader.readVarintNum();
        const witnesses = [];
        for (let l = 0; l < itemCount; l++) {
          const size = reader.readVarintNum();
          const item = reader.read(size);
          witnesses.push(item);
        }
        this.inputs[k].setWitnesses(witnesses);
      }
    }

    this.nLockTime = reader.readUInt32LE()
    return this
  }

  toJSON() {
    const inputs = this.inputs.map((input) => input.toObject())
    const outputs = this.outputs.map((output) => output.toObject())
    const obj = {
      hash: this.hash,
      version: this.version,
      inputs,
      outputs,
      nLockTime: this.nLockTime,
    }
    if (this._changeScript) {
      obj.changeScript = this._changeScript.toString()
    }
    if (this._changeIndex !== undefined) {
      obj.changeIndex = this._changeIndex
    }
    if (this._fee !== undefined) {
      obj.fee = this._fee
    }
    if (this._dataInputs !== undefined) {
      obj.dataInputs = this._dataInputs
    }
    if (this._dataOutputs !== undefined) {
      obj.dataOutputs = this._dataOutputs
    }
    return obj
  }

  toObject() {
    return this.toJSON()
  }

  fromObject(arg) {
    $.checkArgument(_.isObject(arg) || arg instanceof Transaction)
    const transaction = arg instanceof Transaction ? arg.toObject() : arg
    transaction.inputs.forEach((input) => {
      if (!input.output || !input.output.script) {
        this.uncheckedAddInput(new Input(input))
        return
      }
      const script = new Script(input.output.script)
      let txin
      if (script.isPublicKeyHashOut()) {
        txin = new PublicKeyHashInput(input)
      } else if (script.isScriptHashOut() && input.publicKeys && input.threshold) {
        txin = new MultiSigScriptHashInput(
          input,
          input.publicKeys,
          input.threshold,
          input.signatures
        )
      } else if (script.isPublicKeyOut()) {
        txin = new PublicKeyInput(input)
      } else {
        throw new errors.Transaction.Input.UnsupportedScript(input.output.script)
      }
      this.addInput(txin)
    })
    transaction.outputs.forEach((output) => this.addOutput(new Output(output)))
    if (transaction.changeIndex) {
      this._changeIndex = transaction.changeIndex
    }
    if (transaction.changeScript) {
      this._changeScript = new Script(transaction.changeScript)
    }
    if (transaction.fee) {
      this._fee = transaction.fee
    }
    this.nLockTime = transaction.nLockTime
    this.version = transaction.version
    this._checkConsistency(arg)
    return this
  }

  _checkConsistency(arg) {
    if (this._changeIndex !== undefined) {
      $.checkState(this._changeScript, 'Change script missing')
      $.checkState(this.outputs[this._changeIndex], 'Change output missing')
      $.checkState(
        this.outputs[this._changeIndex].script.toString() === this._changeScript.toString(),
        'Script in argument does not match script in transaction'
      )
    }
    if (arg && arg.hash) {
      $.checkState(arg.hash === this.hash, 'Hash in argument does not match transaction hash')
    }
  }

  /**
   * Sets nLockTime so that transaction is not valid until the desired date(a
   * timestamp in seconds since UNIX epoch is also accepted)
   *
   * @param {Date | Number} time
   * @return {Transaction} this
   */
  lockUntilDate(time) {
    $.checkArgument(time)
    if (_.isNumber(time) && time < Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      throw new errors.Transaction.LockTimeTooEarly()
    }
    if (_.isDate(time)) {
      time = time.getTime() / 1000
    }

    this.inputs.forEach((input) => {
      if (input.sequenceNumber === Input.DEFAULT_SEQNUMBER) {
        input.sequenceNumber = Input.DEFAULT_LOCKTIME_SEQNUMBER
      }
    })

    this.nLockTime = time
    return this
  }

  /**
   * Sets nLockTime so that transaction is not valid until the desired block
   * height.
   *
   * @param {Number} height
   * @return {Transaction} this
   */
  lockUntilBlockHeight(height) {
    $.checkArgument(_.isNumber(height), 'Block height must be a number')
    if (height >= Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      throw new errors.Transaction.BlockHeightTooHigh()
    }
    if (height < 0) {
      throw new errors.Transaction.NLockTimeOutOfRange()
    }

    this.inputs.forEach((input) => {
      if (input.sequenceNumber === Input.DEFAULT_SEQNUMBER) {
        input.sequenceNumber = Input.DEFAULT_LOCKTIME_SEQNUMBER
      }
    })

    this.nLockTime = height
    return this
  }

  /**
   *  Returns a semantic version of the transaction's nLockTime.
   *  @return {Number|Date}
   *  If nLockTime is 0, it returns null,
   *  if it is < 500000000, it returns a block height (number)
   *  else it returns a Date object.
   */
  getLockTime() {
    if (!this.nLockTime) {
      return null
    }
    if (this.nLockTime < Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      return this.nLockTime
    }
    return new Date(1000 * this.nLockTime)
  }

  fromString(string) {
    this.fromBuffer(Buffer.from(string, 'hex'))
  }

  _newTransaction() {
    this.version = CURRENT_VERSION
    this.nLockTime = DEFAULT_NLOCKTIME
  }

  /**
   * Add an input to this transaction. This is a high level interface
   * to add an input, for more control, use @{link Transaction#addInput}.
   *
   * Can receive, as output information, the output of bitcoind's `listunspent` command,
   * and a slightly fancier format recognized by bitcore:
   *
   * ```
   * {
   *  address: 'mszYqVnqKoQx4jcTdJXxwKAissE3Jbrrc1',
   *  txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
   *  outputIndex: 0,
   *  script: Script.empty(),
   *  satoshis: 1020000
   * }
   * ```
   * Where `address` can be either a string or a bitcore Address object. The
   * same is true for `script`, which can be a string or a bitcore Script.
   *
   * Beware that this resets all the signatures for inputs (in further versions,
   * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
   *
   * @example
   * ```javascript
   * var transaction = new Transaction();
   *
   * // From a pay to public key hash output from bitcoind's listunspent
   * transaction.from({'txid': '0000...', vout: 0, amount: 0.1, scriptPubKey: 'OP_DUP ...'});
   *
   * // From a pay to public key hash output
   * transaction.from({'txId': '0000...', outputIndex: 0, satoshis: 1000, script: 'OP_DUP ...'});
   *
   * // From a multisig P2SH output
   * transaction.from({'txId': '0000...', inputIndex: 0, satoshis: 1000, script: '... OP_HASH'},
   *                  ['03000...', '02000...'], 2);
   * ```
   *
   * @param {(Array.<Transaction~fromObject>|Transaction~fromObject)} utxo
   * @param {Array=} pubkeys
   * @param {number=} threshold
   * @param {boolean=} nestedWitness - Indicates that the utxo is nested witness p2sh
   * @param {Object=} opts - Several options:
   * - noSorting: defaults to false, if true and is multisig, don't
   *   sort the given public keys before creating the script
   */
  from(utxo, pubkeys, threshold, nestedWitness, opts) {
    if (Array.isArray(utxo)) {
      utxo.forEach((tx) => this.from(tx, pubkeys, threshold))
      return this
    }
    // TODO: Maybe prevTxId should be a string? Or defined as read only property?
    // Check if the utxo has already been added as an input
    const exists = this.inputs.some(
      (input) =>
        input.prevTxId.toString('hex') === utxo.txId && input.outputIndex === utxo.outputIndex
    )
    if (exists) {
      return this
      // P2SH case
    }
    if (pubkeys && threshold) {
      this._fromMultisigUtxo(utxo, pubkeys, threshold, nestedWitness, opts);
    } else {
      this._fromNonP2SH(utxo);
    }
    return this
  }

  _fromNonP2SH(utxo) {
    let Clazz
    utxo = new UnspentOutput(utxo)
    if (utxo.script.isPublicKeyHashOut()) {
      Clazz = PublicKeyHashInput
    } else if (utxo.script.isPublicKeyOut()) {
      Clazz = PublicKeyInput
    } else {
      Clazz = Input
    }
    this.addInput(new Clazz({
      output: new Output({
        script: utxo.script,
        satoshis: utxo.satoshis
      }),
      prevTxId: utxo.txId,
      outputIndex: utxo.outputIndex,
      script: Script.empty()
    }))
  }

  _fromMultisigUtxo(utxo, pubkeys, threshold, nestedWitness, opts) {
    $.checkArgument(threshold <= pubkeys.length,
      'Number of required signatures must be greater than the number of public keys')
    let Clazz;
    utxo = new UnspentOutput(utxo)
    Clazz = MultiSigInput
    if (utxo.script.isScriptHashOut()) {
      Clazz = MultiSigScriptHashInput
    }
    this.addInput(new Clazz({
      output: new Output({
        script: utxo.script,
        satoshis: utxo.satoshis
      }),
      prevTxId: utxo.txId,
      outputIndex: utxo.outputIndex,
      script: Script.empty()
    }, pubkeys, threshold, false, nestedWitness, opts))
  }

  /**
   * Add an input to this transaction. The input must be an instance of the `Input` class.
   * It should have information about the Output that it's spending, but if it's not already
   * set, two additional parameters, `outputScript` and `satoshis` can be provided.
   *
   * @param {Input} input
   * @param {String|Script} outputScript
   * @param {number} satoshis
   * @return Transaction this, for chaining
   */
  addInput(input, outputScript, satoshis) {
    $.checkArgumentType(input, Input, 'Trying to add input of type other than input')
    if (!input.output && (outputScript === undefined || satoshis === undefined)) {
      throw new errors.Transaction.NeedMoreInfo(
        'Need information about the UTXO script and satoshis'
      )
    }
    if (!input.output && outputScript && satoshis !== undefined) {
      outputScript = outputScript instanceof Script ? outputScript : new Script(outputScript)
      $.checkArgumentType(satoshis, 'number', 'Satoshis must be a number when adding input')
      input.output = new Output({
        script: outputScript,
        satoshis,
      })
    }
    return this.uncheckedAddInput(input)
  }

  /**
   * Add an input to this transaction, without checking that the input has information about
   * the output that it's spending.
   *
   * @param {Input} input
   * @return Transaction this, for chaining
   */
  uncheckedAddInput(input) {
    $.checkArgumentType(input, Input, 'Trying to add input of type other than input')
    this.inputs.push(input)
    this._inputAmount = undefined
    this._updateChangeOutput()
    return this
  }

  /**
   * Returns true if the transaction has enough info on all inputs to be correctly validated
   *
   * @return {boolean}
   */
  hasAllUtxoInfo() {
    return this.inputs.map((input) => !!input.output)
  }

  /**
   * Manually set the fee for this transaction. Beware that this resets all the signatures
   * for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not
   * be reset).
   *
   * @param {number} amount satoshis to be sent
   * @return {Transaction} this, for chaining
   */
  fee(amount) {
    $.checkArgument(_.isNumber(amount), 'Amount must be a number')
    this._fee = amount
    this._updateChangeOutput()
    return this
  }

  /**
   * Manually set the fee per KB for this transaction. Beware that this resets all the signatures
   * for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not
   * be reset).
   *
   * @param {number} amount satoshis per KB to be sent
   * @return {Transaction} this, for chaining
   */
  feePerKb(amount) {
    $.checkArgument(_.isNumber(amount), 'Amount must be a number')
    this._feePerKb = amount
    this._updateChangeOutput()
    return this
  }

  /**
   * Set the change address for this transaction
   *
   * Beware that this resets all the signatures for inputs (in further versions,
   * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
   *
   * @param {Address} address An address for change to be sent to.
   * @return {Transaction} this, for chaining
   */
  change(address) {
    $.checkArgument(address, 'Address is required')
    this._changeScript = Script.fromAddress(address)
    this._updateChangeOutput()
    return this
  }

  /**
   * @return {Output} change output, if it exists
   */
  getChangeOutput() {
    if (this._changeIndex !== undefined) {
      return this.outputs[this._changeIndex]
    }
    return null
  }

  /**
   * Add an output to the transaction.
   *
   * Beware that this resets all the signatures for inputs (in further versions,
   * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
   *
   * @param {(string|Address|Array.<Transaction~toObject>)} address
   * @param {number} amount in satoshis
   * @return {Transaction} this, for chaining
   */
  to(address, amount) {
    if (Array.isArray(address)) {
      const self = this
      address.forEach((to) => self.to(to.address, to.satoshis))
      return this
    }

    $.checkArgument(JSUtil.isNaturalNumber(amount), 'Amount is expected to be a positive integer')
    this.addOutput(
      new Output({
        script: Script(new Address(address)),
        satoshis: amount,
      })
    )
    return this
  }

  /**
   * Add an OP_RETURN output to the transaction.
   *
   * Beware that this resets all the signatures for inputs (in further versions,
   * SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).
   *
   * @param {Buffer|string} value the data to be stored in the OP_RETURN output.
   *    In case of a string, the UTF-8 representation will be stored
   * @return {Transaction} this, for chaining
   */
  addData(value) {
    this.addOutput(
      new Output({
        script: Script.buildDataOut(value),
        satoshis: 0,
      })
    )
    return this
  }

  /**
   * Add an output to the transaction.
   *
   * @param {Output} output the output to add.
   * @return {Transaction} this, for chaining
   */
  addOutput(output) {
    $.checkArgumentType(output, Output, 'Output needs to be of type output')
    this._addOutput(output)
    this._updateChangeOutput()
    return this
  }

  /**
   * Remove all outputs from the transaction.
   *
   * @return {Transaction} this, for chaining
   */
  clearOutputs() {
    this.outputs = []
    this._clearSignatures()
    this._outputAmount = undefined
    this._changeIndex = undefined
    this._updateChangeOutput()
    return this
  }

  _addOutput(output) {
    this.outputs.push(output)
    this._outputAmount = undefined
  }

  /**
   * Calculates or gets the total output amount in satoshis
   *
   * @return {Number} the transaction total output amount
   */
  _getOutputAmount() {
    if (this._outputAmount === undefined) {
      this._outputAmount = this.outputs.reduce((acc, output) => acc + output.satoshis, 0)
    }
    return this._outputAmount
  }

  /**
   * Calculates or gets the total input amount in satoshis
   *
   * @return {Number} the transaction total input amount
   */
  _getInputAmount() {
    if (this._inputAmount === undefined) {
      const self = this
      this._inputAmount = 0
      this.inputs.forEach((input) => {
        if (input.output === undefined) {
          throw new errors.Transaction.Input.MissingPreviousOutput()
        }
        self._inputAmount += input.output.satoshis
      })
    }
    return this._inputAmount
  }

  _updateChangeOutput() {
    if (!this._changeScript) {
      return
    }
    this._clearSignatures()
    if (this._changeIndex !== undefined) {
      this._removeOutput(this._changeIndex)
    }
    const available = this._getUnspentValue()
    const fee = this.getFee()
    const changeAmount = available - fee
    if (changeAmount > 0) {
      this._changeIndex = this.outputs.length
      this._addOutput(
        new Output({
          script: this._changeScript,
          satoshis: changeAmount,
        })
      )
    } else {
      this._changeIndex = undefined
    }
  }

  /**
   * Calculates the fee of the transaction.
   *
   * If there's a fixed fee set, return that.
   *
   * If there is no change output set, the fee is the
   * total value of the outputs minus inputs. Note that
   * a serialized transaction only specifies the value
   * of its outputs. (The value of inputs are recorded
   * in the previous transaction outputs being spent.)
   * This method therefore raises a "MissingPreviousOutput"
   * error when called on a serialized transaction.
   *
   * If there's no fee set and no change address,
   * estimate the fee based on size.
   *
   * @return {Number} fee of this transaction in satoshis
   */
  getFee() {
    if (this.isCoinbase()) {
      return 0
    }
    if (this._fee !== undefined) {
      return this._fee
    }
    // if no change output is set, fees should equal all the unspent amount
    if (!this._changeScript) {
      return this._getUnspentValue()
    }
    return this._estimateFee()
  }

  /**
   * Estimates fee from serialized transaction size in bytes.
   */
  _estimateFee() {
    const estimatedSize = this._estimateSize()
    const available = this._getUnspentValue()
    return Transaction._estimateFee(estimatedSize, available, this._feePerKb)
  }

  _getUnspentValue() {
    return this._getInputAmount() - this._getOutputAmount()
  }

  _clearSignatures() {
    this.inputs.forEach((input) => input.clearSignatures())
  }

  _estimateSize() {
    let result = this.inputs.reduce(
      (acc, input) => acc + input._estimateSize(),
      Transaction.MAXIMUM_EXTRA_SIZE
    )
    result = this.outputs.reduce((acc, output) => acc + output.script.toBuffer().length + 9, result)
    return result
  }

  _removeOutput(index) {
    const output = this.outputs[index]
    this.outputs = this.outputs.filter((val) => val !== output)
    this._outputAmount = undefined
  }

  removeOutput(index) {
    this._removeOutput(index)
    this._updateChangeOutput()
  }

  /**
   * Sort a transaction's inputs and outputs according to BIP69
   *
   * @see {https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki}
   * @return {Transaction} this
   */
  sort() {
    /* eslint-disable max-len */
    this.sortInputs((inputs) => {
      const copy = Array.prototype.concat.apply([], inputs)
      copy.sort(
        (first, second) =>
          compare(first.prevTxId, second.prevTxId) || first.outputIndex - second.outputIndex
      )
      return copy
    })
    this.sortOutputs((outputs) => {
      const copy = Array.prototype.concat.apply([], outputs)
      copy.sort(
        (first, second) =>
          first.satoshis - second.satoshis ||
          compare(first.script.toBuffer(), second.script.toBuffer())
      )
      return copy
    })
    /* eslint-enable max-len */
    return this
  }

  /**
   * Randomize this transaction's outputs ordering. The shuffling algorithm is a
   * version of the Fisher-Yates shuffle, provided by lodash's _.shuffle().
   *
   * @return {Transaction} this
   */
  shuffleOutputs() {
    return this.sortOutputs(_.shuffle)
  }

  /**
   * Sort this transaction's outputs, according to a given sorting function that
   * takes an array as argument and returns a new array, with the same elements
   * but with a different order. The argument function MUST NOT modify the order
   * of the original array
   *
   * @param {Function} sortingFunction
   * @return {Transaction} this
   */
  sortOutputs(sortingFunction) {
    const outs = sortingFunction(this.outputs)
    return this._newOutputOrder(outs)
  }

  /**
   * Sort this transaction's inputs, according to a given sorting function that
   * takes an array as argument and returns a new array, with the same elements
   * but with a different order.
   *
   * @param {Function} sortingFunction
   * @return {Transaction} this
   */
  sortInputs(sortingFunction) {
    this.inputs = sortingFunction(this.inputs)
    this._clearSignatures()
    return this
  }

  _newOutputOrder(newOutputs) {
    const isInvalidSorting =
      this.outputs.length !== newOutputs.length ||
      _.difference(this.outputs, newOutputs).length !== 0
    if (isInvalidSorting) {
      throw new errors.Transaction.InvalidSorting()
    }

    if (this._changeIndex !== undefined) {
      const changeOutput = this.outputs[this._changeIndex]
      this._changeIndex = _.findIndex(newOutputs, changeOutput)
    }

    this.outputs = newOutputs
    return this
  }

  removeInput(txId, outputIndex) {
    let index
    if (!outputIndex && _.isNumber(txId)) {
      index = txId
    } else {
      index = _.findIndex(
        this.inputs,
        (input) => input.prevTxId.toString('hex') === txId && input.outputIndex === outputIndex
      )
    }
    if (index < 0 || index >= this.inputs.length) {
      throw new errors.Transaction.InvalidIndex(index, this.inputs.length)
    }
    const input = this.inputs[index]
    this.inputs = _.without(this.inputs, input)
    this._inputAmount = undefined
    this._updateChangeOutput()
  }

  /**
   * Sign the transaction using one or more private keys.
   *
   * It tries to sign each input, verifying that the signature will be valid
   * (matches a public key).
   *
   * @param {Array|String|PrivateKey} privateKeys
   * @param {number} sigtype
   * @return {Transaction} this, for chaining
   */
  sign(privateKeys, sigtype) {
    $.checkState(this.hasAllUtxoInfo(), 'Cannot sign because an input is not defined')
    const self = this
    if (Array.isArray(privateKeys)) {
      privateKeys.forEach((privateKey) => self.sign(privateKey, sigtype))
      return this
    }
    const signatures = this.getSignatures(privateKeys, sigtype)
    signatures.forEach((signature) => self.applySignature(signature))
    return this
  }

  getSignatures(privKey, sigtype) {
    privKey = new PrivateKey(privKey)
    // By default, signs using ALL|FORKID
    sigtype = sigtype || Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID
    const transaction = this
    const results = []
    const hashData = Hash.sha256ripemd160(privKey.publicKey.toBuffer())
    this.inputs.forEach((input, index) => {
      const signatures = input.getSignatures(transaction, privKey, index, sigtype, hashData)
      signatures.forEach((signature) => results.push(signature))
    })
    return results
  }

  /**
   * Add a signature to the transaction
   *
   * @param {Object} signature
   * @param {number} signature.inputIndex
   * @param {number} signature.sigtype
   * @param {PublicKey} signature.publicKey
   * @param {Signature} signature.signature
   * @return {Transaction} this, for chaining
   */
  applySignature(signature) {
    this.inputs[signature.inputIndex].addSignature(this, signature)
    return this
  }

  isFullySigned() {
    this.inputs.forEach((input) => {
      if (input.isFullySigned === Input.prototype.isFullySigned) {
        throw new errors.Transaction.UnableToVerifySignature(
          'Unrecognized script kind, or not enough information to execute script.' +
            'This usually happens when creating a transaction from a serialized transaction'
        )
      }
    })
    return this.inputs.map((input) => input.isFullySigned()).every((x) => x)
  }

  isValidSignature(signature) {
    const self = this
    if (this.inputs[signature.inputIndex].isValidSignature === Input.prototype.isValidSignature) {
      throw new errors.Transaction.UnableToVerifySignature(
        'Unrecognized script kind, or not enough information to execute script.' +
          'This usually happens when creating a transaction from a serialized transaction'
      )
    }
    return this.inputs[signature.inputIndex].isValidSignature(self, signature)
  }

  /**
   * @returns {bool} whether the signature is valid for this transaction input
   */
  verifySignature(sig, pubkey, nin, subscript) {
    return Sighash.verify(this, sig, pubkey, nin, subscript)
  }

  /**
   * Check that a transaction passes basic sanity tests. If not, return a string
   * describing the error. This function contains the same logic as
   * CheckTransaction in bitcoin core.
   */
  verify() {
    let i

    // Basic checks that don't depend on any context
    if (this.inputs.length === 0) {
      return 'transaction txins empty'
    }

    if (this.outputs.length === 0) {
      return 'transaction txouts empty'
    }

    // Check for negative or overflow output values
    let valueoutbn = new BN(0)
    for (i = 0; i < this.outputs.length; i += 1) {
      if (this.outputs[i].invalidSatoshis()) {
        return 'Transaction output contains invalid amount'
      }
      if (this.outputs[i]._satoshisBN.gt(new BN(Transaction.MAX_MONEY, 10))) {
        return 'Transaction output contains too high satoshi amount'
      }
      valueoutbn = valueoutbn.add(this.outputs[i]._satoshisBN)
      if (valueoutbn.gt(new BN(Transaction.MAX_MONEY))) {
        return 'Transaction output contains too high satoshi amount'
      }
    }

    // Size limits
    if (this.toBuffer().length > MAX_BLOCK_SIZE) {
      return 'Transaction over the maximum block size'
    }

    // Check for duplicate inputs
    const txinmap = {}
    for (i = 0; i < this.inputs.length; i += 1) {
      const inputid = `${this.inputs[i].prevTxId}:${this.inputs[i].outputIndex}`
      if (txinmap[inputid] !== undefined) {
        return 'Transaction contains duplicate input'
      }
      txinmap[inputid] = true
    }

    const isCoinbase = this.isCoinbase()
    if (isCoinbase) {
      const buf = this.inputs[0]._scriptBuffer
      if (buf.length < 2 || buf.length > 100) {
        return 'Coinbase transaction script size invalid'
      }
    } else if (this.inputs.filter((input) => input.isNull()).length > 0) {
      return 'Transaction has null input'
    }
    return true
  }

  /**
   * Analogous to bitcoind's IsCoinBase function in transaction.h
   */
  isCoinbase() {
    return this.inputs.length === 1 && this.inputs[0].isNull()
  }

  /**
   * Determines if this transaction can be replaced in the mempool with another
   * transaction that provides a sufficiently higher fee (RBF).
   */
  isRBF() {
    return this.inputs.some((input) => input.sequenceNumber < Input.MAXINT - 1)
  }

  /**
   * Enable this transaction to be replaced in the mempool (RBF) if a transaction
   * includes a sufficiently higher fee. It will set the sequenceNumber to
   * DEFAULT_RBF_SEQNUMBER for all inputs if the sequence number does not
   * already enable RBF.
   */
  enableRBF() {
    this.inputs = this.inputs.map((input) => {
      if (input.sequenceNumber >= Input.MAXINT - 1) {
        input.sequenceNumber = Input.DEFAULT_RBF_SEQNUMBER
      }
      return input
    })

    return this
  }

  /**
   * Create a 'shallow' copy of the transaction, by serializing and deserializing
   * it dropping any additional information that inputs and outputs may have hold
   *
   * @param {Transaction} transaction
   * @return {Transaction}
   */
  static shallowCopy(transaction) {
    return new Transaction(transaction.toBuffer())
  }

  static _estimateFee(size, amountAvailable, feePerKb) {
    const fee = Math.ceil((size / 1000) * (feePerKb || Transaction.FEE_PER_KB))
    if (amountAvailable > fee) {
      size += Transaction.CHANGE_OUTPUT_MAX_SIZE
    }
    return Math.ceil((size / 1000) * (feePerKb || Transaction.FEE_PER_KB))
  }
}

// Minimum amount for an output for it not to be considered a dust output
Transaction.DUST_AMOUNT = 546

// Margin of error to allow fees in the vecinity of the expected value but doesn't allow a big
// difference.
Transaction.FEE_SECURITY_MARGIN = 150

// max amount of satoshis in circulation
Transaction.MAX_MONEY = 21000000 * 1e8

// nlocktime limit to be considered block height rather than a timestamp
Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT = 5e8

// Max value for an unsigned 32 bit value
Transaction.NLOCKTIME_MAX_VALUE = 4294967295

// Value used for fee estimation (satoshis per kilobyte)
Transaction.FEE_PER_KB = 20000

// Safe upper bound for change address script size in bytes
Transaction.CHANGE_OUTPUT_MAX_SIZE = 20 + 4 + 34 + 4
Transaction.MAXIMUM_EXTRA_SIZE = 4 + 9 + 9 + 4

export default Transaction
