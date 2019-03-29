import bch from '../..'

const should = require('chai').should()

const { MerkleBlock } = bch
const { BufferReader } = bch.encoding
const { BufferWriter } = bch.encoding
const { Transaction } = bch
const data = require('../data/merkleblocks.js')
const transactionVector = require('../data/tx_creation')

describe('MerkleBlock', function() {
  const blockhex = data.HEX[0]
  const blockbuf = Buffer.from(blockhex, 'hex')
  const blockJSON = JSON.stringify(data.JSON[0])
  const blockObject = JSON.parse(JSON.stringify(data.JSON[0]))

  describe('#constructor', function() {
    it('should make a new merkleblock from buffer', function() {
      const b = new MerkleBlock(blockbuf)
      b.toBuffer()
        .toString('hex')
        .should.equal(blockhex)
    })

    it('should make a new merkleblock from object', function() {
      const b = new MerkleBlock(blockObject)
      b.toObject().should.deep.equal(blockObject)
    })

    it('should make a new merkleblock from JSON', function() {
      const b = new MerkleBlock(JSON.parse(blockJSON))
      JSON.stringify(b).should.equal(blockJSON)
    })

    it('should not make an empty block', function() {
      ;(function() {
        return new MerkleBlock()
      }.should.throw('Unrecognized argument for MerkleBlock'))
    })
  })

  describe('#fromObject', function() {
    it('should set these known values', function() {
      const block = MerkleBlock.fromObject(JSON.parse(blockJSON))
      should.exist(block.header)
      should.exist(block.numTransactions)
      should.exist(block.hashes)
      should.exist(block.flags)
    })

    it('should set these known values', function() {
      const block = new MerkleBlock(JSON.parse(blockJSON))
      should.exist(block.header)
      should.exist(block.numTransactions)
      should.exist(block.hashes)
      should.exist(block.flags)
    })

    it('accepts an object as argument', function() {
      const block = new MerkleBlock(blockbuf)
      MerkleBlock.fromObject(block.toObject()).should.exist()
    })
  })

  describe('#toJSON', function() {
    it('should recover these known values', function() {
      const block = new MerkleBlock(JSON.parse(blockJSON))
      const b = JSON.parse(JSON.stringify(block))
      should.exist(block.header)
      should.exist(block.numTransactions)
      should.exist(block.hashes)
      should.exist(block.flags)
      should.exist(b.header)
      should.exist(b.numTransactions)
      should.exist(b.hashes)
      should.exist(b.flags)
    })
  })

  describe('#fromBuffer', function() {
    it('should make a block from this known buffer', function() {
      const block = MerkleBlock.fromBuffer(blockbuf)
      block
        .toBuffer()
        .toString('hex')
        .should.equal(blockhex)
    })
  })

  describe('#fromBufferReader', function() {
    it('should make a block from this known buffer', function() {
      const block = MerkleBlock.fromBufferReader(BufferReader(blockbuf))
      block
        .toBuffer()
        .toString('hex')
        .should.equal(blockhex)
    })
  })

  describe('#toBuffer', function() {
    it('should recover a block from this known buffer', function() {
      const block = MerkleBlock.fromBuffer(blockbuf)
      block
        .toBuffer()
        .toString('hex')
        .should.equal(blockhex)
    })
  })

  describe('#toBufferWriter', function() {
    it('should recover a block from this known buffer', function() {
      const block = MerkleBlock.fromBuffer(blockbuf)
      block
        .toBufferWriter()
        .concat()
        .toString('hex')
        .should.equal(blockhex)
    })

    it("doesn't create a bufferWriter if one provided", function() {
      const writer = new BufferWriter()
      const block = MerkleBlock.fromBuffer(blockbuf)
      block.toBufferWriter(writer).should.equal(writer)
    })
  })

  describe('#validMerkleTree', function() {
    it('should validate good merkleblocks', function() {
      data.JSON.forEach(function(data2) {
        const b = new MerkleBlock(data2)
        b.validMerkleTree().should.equal(true)
      })
    })

    it('should not validate merkleblocks with too many hashes', function() {
      const b = new MerkleBlock(data.JSON[0])
      // Add too many hashes
      let i = 0
      while (i <= b.numTransactions) {
        b.hashes.push(`bad${(i += 1)}`)
      }
      b.validMerkleTree().should.equal(false)
    })

    it('should not validate merkleblocks with too few bit flags', function() {
      const b = new MerkleBlock(JSON.parse(blockJSON))
      b.flags.pop()
      b.validMerkleTree().should.equal(false)
    })
  })

  describe('#hasTransaction', function() {
    it('should find transactions via hash string', function() {
      const jsonData = data.JSON[0]
      const txId = Buffer.from(jsonData.hashes[1], 'hex').toString('hex')
      const b = new MerkleBlock(jsonData)
      b.hasTransaction(txId).should.equal(true)
      b.hasTransaction(`${txId}abcd`).should.equal(false)
    })

    it('should find transactions via Transaction object', function() {
      const jsonData = data.JSON[0]
      const txBuf = Buffer.from(data.TXHEX[0][0], 'hex')
      const tx = new Transaction().fromBuffer(txBuf)
      const b = new MerkleBlock(jsonData)
      b.hasTransaction(tx).should.equal(true)
    })

    it('should not find non-existant Transaction object', function() {
      // Reuse another transaction already in data/ dir
      const serialized = transactionVector[0][7]
      const tx = new Transaction().fromBuffer(Buffer.from(serialized, 'hex'))
      const b = new MerkleBlock(data.JSON[0])
      b.hasTransaction(tx).should.equal(false)
    })

    it('should not match with merkle nodes', function() {
      const b = new MerkleBlock(data.JSON[0])

      const hashData = [
        ['3612262624047ee87660be1a707519a443b1c1ce3d248cbfc6c15870f6c5daa2', false],
        ['019f5b01d4195ecbc9398fbf3c3b1fa9bb3183301d7a1fb3bd174fcfa40a2b65', true],
        ['41ed70551dd7e841883ab8f0b16bf04176b7d1480e4f0af9f3d4c3595768d068', false],
        ['20d2a7bc994987302e5b1ac80fc425fe25f8b63169ea78e68fbaaefa59379bbf', false]
      ]

      hashData.forEach(function check(d) {
        b.hasTransaction(d[0]).should.equal(d[1])
      })
    })
  })
})
