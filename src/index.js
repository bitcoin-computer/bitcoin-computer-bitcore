import _ from 'lodash'
import elliptic from 'elliptic'
import bnjs from 'bn.js'
import bs58 from 'bs58'
import Address from './address'
import Base58 from './encoding/base58'
import Base58Check from './encoding/base58check'
import Block from './block/block'
import BlockHeader from './block/blockheader'
import BN from './crypto/bn'
import BufferReader from './encoding/bufferreader'
import BufferUtil from './util/buffer'
import BufferWriter from './encoding/bufferwriter'
import ECDSA from './crypto/ecdsa'
import errors from './errors'
import Hash from './crypto/hash'
import HDPrivateKey from './hdprivatekey'
import HDPublicKey from './hdpublickey'
import MerkleBlock from './block/merkleblock'
import Message from './message'
import Opcode from './opcode'
import preconditions from './util/preconditions'
import JSUtil from './util/js'
import Mnemonic from './mnemonic'
import Networks from './networks'
import PackageInfo from '../package.json'
import Point from './crypto/point'
import PrivateKey from './privatekey'
import PublicKey from './publickey'
import Random from './crypto/random'
import Script from './script/script'
import ScriptInterpreter from './script/interpreter'
import Signature from './crypto/signature'
import Transaction from './transaction/transaction'
import TransactionInput from './transaction/input/input'
import TransactionMultiSigInput from './transaction/input/multisig'
import TransactionMultiSigScriptHashInput from './transaction/input/multisigscripthash'
import TransactionPublicKeyInput from './transaction/input/publickey'
import TransactionPublicKeyHashInput from './transaction/input/publickeyhash'
import TransactionScriptHashInput from './transaction/input/scripthash'
import TransactionOutput from './transaction/output'
import TransactionOutputId from './transaction/output-id'
import TransactionSighash from './transaction/sighash'
import TransactionSignature from './transaction/signature'
import TransactionUnspentOutput from './transaction/unspentoutput'
import Unit from './unit'
import URI from './uri'
import Varint from './encoding/varint'

const bch = {}

// module information
bch.version = `v${PackageInfo.version}`

// eslint-disable-next-line no-unused-vars
bch.versionGuard = function(version) {
  // if (version !== undefined) {
  //   var message = 'More than one instance of bitcoincashjs found. ' +
  //     'Please make sure to require bitcoincashjs and check that submodules do' +
  //     ' not also include their own bitcoincashjs dependency.';
  //   throw new Error(message);
  // }
}
bch.versionGuard(global._bch)
global._bch = bch.version

// crypto
bch.crypto = {}
bch.crypto.BN = BN
bch.crypto.ECDSA = ECDSA
bch.crypto.Hash = Hash
bch.crypto.Random = Random
bch.crypto.Point = Point
bch.crypto.Signature = Signature

// encoding
bch.encoding = {}
bch.encoding.Base58 = Base58
bch.encoding.Base58Check = Base58Check
bch.encoding.BufferReader = BufferReader
bch.encoding.BufferWriter = BufferWriter
bch.encoding.Varint = Varint

// utilities
bch.util = {}
bch.util.buffer = BufferUtil
bch.util.js = JSUtil
bch.util.preconditions = preconditions

// errors thrown by the library
bch.errors = errors

// main bitcoin library
bch.Address = Address
bch.Block = Block
bch.Block.BlockHeader = BlockHeader
bch.Block.MerkleBlock = MerkleBlock
bch.BlockHeader = BlockHeader
bch.HDPrivateKey = HDPrivateKey
bch.HDPublicKey = HDPublicKey
bch.MerkleBlock = MerkleBlock
bch.Message = Message
bch.Mnemonic = Mnemonic
bch.Networks = Networks
bch.Opcode = Opcode
bch.PrivateKey = PrivateKey
bch.PublicKey = PublicKey
bch.Script = Script
bch.Script.Interpreter = ScriptInterpreter
bch.Transaction = Transaction
bch.Transaction.Input = TransactionInput
bch.Transaction.Input.MultiSig = TransactionMultiSigInput
bch.Transaction.Input.MultiSigScriptHash = TransactionMultiSigScriptHashInput
bch.Transaction.Input.PublicKey = TransactionPublicKeyInput
bch.Transaction.Input.PublicKeyHash = TransactionPublicKeyHashInput
bch.Transaction.Input.ScriptHash = TransactionScriptHashInput
bch.Transaction.Output = TransactionOutput
bch.Transaction.OutputId = TransactionOutputId
bch.Transaction.Sighash = TransactionSighash
bch.Transaction.Signature = TransactionSignature
bch.Transaction.UnspentOutput = TransactionUnspentOutput
bch.Unit = Unit
bch.URI = URI

// dependencies, subject to change
bch.deps = {}
bch.deps.bnjs = bnjs
bch.deps.bs58 = bs58
bch.deps.Buffer = Buffer
bch.deps.elliptic = elliptic
bch.deps._ = _

export default bch
