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

const Bitcoin = {}

// module information
Bitcoin.version = `v${PackageInfo.version}`

// eslint-disable-next-line no-unused-vars
Bitcoin.versionGuard = function(version) {
  // if (version !== undefined) {
  //   var message = 'More than one instance of bitcoincashjs found. ' +
  //     'Please make sure to require bitcoincashjs and check that submodules do' +
  //     ' not also include their own bitcoincashjs dependency.';
  //   throw new Error(message);
  // }
}
Bitcoin.versionGuard(global._bitcoin)
global._bitcoin = Bitcoin.version

// crypto
Bitcoin.crypto = {}
Bitcoin.crypto.BN = BN
Bitcoin.crypto.ECDSA = ECDSA
Bitcoin.crypto.Hash = Hash
Bitcoin.crypto.Random = Random
Bitcoin.crypto.Point = Point
Bitcoin.crypto.Signature = Signature

// encoding
Bitcoin.encoding = {}
Bitcoin.encoding.Base58 = Base58
Bitcoin.encoding.Base58Check = Base58Check
Bitcoin.encoding.BufferReader = BufferReader
Bitcoin.encoding.BufferWriter = BufferWriter
Bitcoin.encoding.Varint = Varint

// utilities
Bitcoin.util = {}
Bitcoin.util.buffer = BufferUtil
Bitcoin.util.js = JSUtil
Bitcoin.util.preconditions = preconditions

// errors thrown by the library
Bitcoin.errors = errors

// main bitcoin library
Bitcoin.Address = Address
Bitcoin.Block = Block
Bitcoin.Block.BlockHeader = BlockHeader
Bitcoin.Block.MerkleBlock = MerkleBlock
Bitcoin.BlockHeader = BlockHeader
Bitcoin.HDPrivateKey = HDPrivateKey
Bitcoin.HDPublicKey = HDPublicKey
Bitcoin.MerkleBlock = MerkleBlock
Bitcoin.Message = Message
Bitcoin.Mnemonic = Mnemonic
Bitcoin.Networks = Networks
Bitcoin.Opcode = Opcode
Bitcoin.PrivateKey = PrivateKey
Bitcoin.PublicKey = PublicKey
Bitcoin.Script = Script
Bitcoin.Script.Interpreter = ScriptInterpreter
Bitcoin.Transaction = Transaction
Bitcoin.Transaction.Input = TransactionInput
Bitcoin.Transaction.Input.MultiSig = TransactionMultiSigInput
Bitcoin.Transaction.Input.MultiSigScriptHash = TransactionMultiSigScriptHashInput
Bitcoin.Transaction.Input.PublicKey = TransactionPublicKeyInput
Bitcoin.Transaction.Input.PublicKeyHash = TransactionPublicKeyHashInput
Bitcoin.Transaction.Input.ScriptHash = TransactionScriptHashInput
Bitcoin.Transaction.Output = TransactionOutput
Bitcoin.Transaction.OutputId = TransactionOutputId
Bitcoin.Transaction.Sighash = TransactionSighash
Bitcoin.Transaction.Signature = TransactionSignature
Bitcoin.Transaction.UnspentOutput = TransactionUnspentOutput
Bitcoin.Unit = Unit
Bitcoin.URI = URI

// dependencies, subject to change
Bitcoin.deps = {}
Bitcoin.deps.bnjs = bnjs
Bitcoin.deps.bs58 = bs58
Bitcoin.deps.Buffer = Buffer
Bitcoin.deps.elliptic = elliptic
Bitcoin.deps._ = _

export default Bitcoin
