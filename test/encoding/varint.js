import chai from 'chai'
import Bitcoin from '../bitcoin'

const should = chai.should()
const { BN } = Bitcoin.crypto
const { BufferReader } = Bitcoin.encoding
const { BufferWriter } = Bitcoin.encoding
const { Varint } = Bitcoin.encoding

describe('Varint', function() {
  it('should make a new varint', function() {
    const buf = Buffer.from('00', 'hex')
    let varint = new Varint(buf)
    should.exist(varint)
    varint.buf.toString('hex').should.equal('00')
    varint = Varint(buf)
    should.exist(varint)
    varint.buf.toString('hex').should.equal('00')

    // various ways to use the constructor
    Varint(Varint(0).toBuffer())
      .toNumber()
      .should.equal(0)
    Varint(0)
      .toNumber()
      .should.equal(0)
    Varint(new BN(0))
      .toNumber()
      .should.equal(0)
  })

  describe('#set', function() {
    it('should set a buffer', function() {
      const buf = Buffer.from('00', 'hex')
      const varint = Varint().set({ buf })
      varint.buf.toString('hex').should.equal('00')
      varint.set({})
      varint.buf.toString('hex').should.equal('00')
    })
  })

  describe('#fromString', function() {
    it('should set a buffer', function() {
      const buf = BufferWriter()
        .writeVarintNum(5)
        .concat()
      const varint = Varint().fromString(buf.toString('hex'))
      varint.toNumber().should.equal(5)
    })
  })

  describe('#toString', function() {
    it('should return a buffer', function() {
      const buf = BufferWriter()
        .writeVarintNum(5)
        .concat()
      const varint = Varint().fromString(buf.toString('hex'))
      varint.toString().should.equal('05')
    })
  })

  describe('#fromBuffer', function() {
    it('should set a buffer', function() {
      const buf = BufferWriter()
        .writeVarintNum(5)
        .concat()
      const varint = Varint().fromBuffer(buf)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromBufferReader', function() {
    it('should set a buffer reader', function() {
      const buf = BufferWriter()
        .writeVarintNum(5)
        .concat()
      const br = BufferReader(buf)
      const varint = Varint().fromBufferReader(br)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromBN', function() {
    it('should set a number', function() {
      const varint = Varint().fromBN(new BN(5))
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromNumber', function() {
    it('should set a number', function() {
      const varint = Varint().fromNumber(5)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#toBuffer', function() {
    it('should return a buffer', function() {
      const buf = BufferWriter()
        .writeVarintNum(5)
        .concat()
      const varint = Varint(buf)
      varint
        .toBuffer()
        .toString('hex')
        .should.equal(buf.toString('hex'))
    })
  })

  describe('#toBN', function() {
    it('should return a buffer', function() {
      const varint = Varint(5)
      varint
        .toBN()
        .toString()
        .should.equal(new BN(5).toString())
    })
  })

  describe('#toNumber', function() {
    it('should return a buffer', function() {
      const varint = Varint(5)
      varint.toNumber().should.equal(5)
    })
  })
})
