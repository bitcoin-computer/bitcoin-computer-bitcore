import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const should = chai.should()
const { expect } = chai
const BufferUtil = Bitcoin.util.buffer
const { Script } = Bitcoin
const { Networks } = Bitcoin
const { Opcode } = Bitcoin
const { PublicKey } = Bitcoin
const { Address } = Bitcoin

describe('Script', () => {
  it('should make a new script', () => {
    const script = new Script()
    should.exist(script)
  })

  describe('#fromBuffer', () => {
    it('should parse this buffer containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = Opcode.OP_0
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opcodenum.should.equal(buf[0])
    })

    it('should parse this buffer containing another OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = Opcode.OP_CHECKMULTISIG
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opcodenum.should.equal(buf[0])
    })

    it('should parse this buffer containing three bytes of data', () => {
      const buf = Buffer.from([3, 1, 2, 3])
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer containing OP_PUSHDATA1 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA1
      buf.writeUInt8(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA2
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA4
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = Opcode.OP_0
      buf[1] = Opcode.OP_PUSHDATA4
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = Opcode.OP_0
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opcodenum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opcodenum.should.equal(buf[buf.length - 1])
    })
  })

  describe('#toBuffer', () => {
    it('should output this buffer containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = Opcode.OP_0
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opcodenum.should.equal(buf[0])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing another OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = Opcode.OP_CHECKMULTISIG
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opcodenum.should.equal(buf[0])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing three bytes of data', () => {
      const buf = Buffer.from([3, 1, 2, 3])
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA1 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA1
      buf.writeUInt8(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA2
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3])
      buf[0] = Opcode.OP_PUSHDATA4
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = Opcode.OP_0
      buf[1] = Opcode.OP_PUSHDATA4
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = Opcode.OP_0
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opcodenum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opcodenum.should.equal(buf[buf.length - 1])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })
  })

  describe('#fromASM', () => {
    it('should parse this known script in ASM', () => {
      const asm =
        'OP_DUP OP_HASH160 f4c03610e60ad15100929cc23da2f3a799af1725 OP_EQUALVERIFY OP_CHECKSIG'
      const script = Script.fromASM(asm)
      script.chunks[0].opcodenum.should.equal(Opcode.OP_DUP)
      script.chunks[1].opcodenum.should.equal(Opcode.OP_HASH160)
      script.chunks[2].opcodenum.should.equal(20)
      script.chunks[2].buf.toString('hex').should.equal('f4c03610e60ad15100929cc23da2f3a799af1725')
      script.chunks[3].opcodenum.should.equal(Opcode.OP_EQUALVERIFY)
      script.chunks[4].opcodenum.should.equal(Opcode.OP_CHECKSIG)
    })
  })

  describe('#fromString', () => {
    it('should parse these known scripts', () => {
      Script.fromString('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
      Script.fromString('OP_0 OP_PUSHDATA2 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA2 3 0x010203 OP_0')
      Script.fromString('OP_0 OP_PUSHDATA1 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA1 3 0x010203 OP_0')
      Script.fromString('OP_0 3 0x010203 OP_0').toString().should.equal('OP_0 3 0x010203 OP_0')
    })
  })

  describe('#toString', () => {
    it('should work with an empty script', () => {
      const script = new Script()
      script.toString().should.equal('')
    })

    it('should output this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = Opcode.OP_0
      buf[1] = Opcode.OP_PUSHDATA4
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = Opcode.OP_0
      const script = Script.fromBuffer(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opcodenum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opcodenum.should.equal(buf[buf.length - 1])
      script.toString().toString('hex').should.equal('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
    })

    it('should output this known script as ASM', () => {
      const script = Script.fromHex('76a914f4c03610e60ad15100929cc23da2f3a799af172588ac')
      script
        .toASM()
        .should.equal(
          'OP_DUP OP_HASH160 f4c03610e60ad15100929cc23da2f3a799af1725 OP_EQUALVERIFY OP_CHECKSIG'
        )
    })
  })

  describe('toHex', () => {
    it('should return an hexa string "03010203" as expected from [3, 1, 2, 3]', () => {
      const buf = Buffer.from([3, 1, 2, 3])
      const script = Script.fromBuffer(buf)
      script.toHex().should.equal('03010203')
    })
  })

  describe('#isDataOut', () => {
    it('should know this is a (blank) OP_RETURN script', () => {
      Script('OP_RETURN').isDataOut().should.equal(true)
    })

    it('validates that this 40-byte OP_RETURN is standard', () => {
      const buf = Buffer.alloc(40)
      buf.fill(0)
      Script(`OP_RETURN 40 0x${buf.toString('hex')}`)
        .isDataOut()
        .should.equal(true)
    })
    it('validates that this 80-byte OP_RETURN is standard', () => {
      const buf = Buffer.alloc(80)
      buf.fill(0)
      Script(`OP_RETURN OP_PUSHDATA1 80 0x${buf.toString('hex')}`)
        .isDataOut()
        .should.equal(true)
    })

    it('validates that this 40-byte long OP_CHECKMULTISIG is not standard op_return', () => {
      const buf = Buffer.alloc(40)
      buf.fill(0)
      Script(`OP_CHECKMULTISIG 40 0x${buf.toString('hex')}`)
        .isDataOut()
        .should.equal(false)
    })

    it('validates that this 81-byte OP_RETURN is not a valid standard OP_RETURN', () => {
      const buf = Buffer.alloc(81)
      buf.fill(0)
      Script(`OP_RETURN OP_PUSHDATA1 81 0x${buf.toString('hex')}`)
        .isDataOut()
        .should.equal(false)
    })
  })

  describe('#isPublicKeyIn', () => {
    it('correctly identify scriptSig as a public key in', () => {
      // from txid: 5c85ed63469aa9971b5d01063dbb8bcdafd412b2f51a3d24abf2e310c028bbf8
      // and input index: 5
      const scriptBuffer = Buffer.from(
        '483045022050eb59c79435c051f45003d9f82865c8e4df5699d7722e77113ef8cadbd92109022100d4ab233e070070eb8e0e62e3d2d2eb9474a5bf135c9eda32755acb0875a6c20601',
        'hex'
      )
      const script = Bitcoin.Script.fromBuffer(scriptBuffer)
      script.isPublicKeyIn().should.equal(true)
    })
  })

  describe('#isPublicKeyHashIn', () => {
    it('should identify this known pubkeyhashin (uncompressed pubkey version)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x04e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known pubkeyhashin (hybrid pubkey version w/06)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x06e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known pubkeyhashin (hybrid pubkey version w/07)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x07e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known pubkeyhashin (compressed pubkey w/ 0x02)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 21 0x02aec6b86621e7fef63747fbfd6a6e7d54c8e1052044ef2dd2c5e46656ef1194d4'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known pubkeyhashin (compressed pubkey w/ 0x03)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 21 0x03e724d93c4fda5f1236c525de7ffac6c5f1f72b0f5cdd1fc4b4f5642b6d055fcc'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known non-pubkeyhashin (bad ops length)', () => {
      Script(
        '73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x04e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6 OP_CHECKSIG'
      )
        .isPublicKeyHashIn()
        .should.equal(false)
    })

    it('should identify this known pubkey', () => {
      Script(
        '70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 33 0x0370b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369'
      )
        .isPublicKeyHashIn()
        .should.equal(true)
    })

    it('should identify this known non-pubkeyhashin (bad version)', () => {
      Script(
        '70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 33 0x1270b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369'
      )
        .isPublicKeyHashIn()
        .should.equal(false)
    })

    it('should identify this known non-pubkeyhashin (bad signature version)', () => {
      Script(
        '70 0x4043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 33 0x0370b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369'
      )
        .isPublicKeyHashIn()
        .should.equal(false)
    })

    it('should identify this known non-pubkeyhashin (no public key)', () => {
      Script(
        '70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 OP_CHECKSIG'
      )
        .isPublicKeyHashIn()
        .should.equal(false)
    })

    it('should identify this known non-pubkeyhashin (no signature)', () => {
      Script('OP_DROP OP_CHECKSIG').isPublicKeyHashIn().should.equal(false)
    })
  })

  describe('#isPublicKeyHashOut', () => {
    it('should identify this known pubkeyhashout as pubkeyhashout', () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .isPublicKeyHashOut()
        .should.equal(true)
    })

    it('should identify this known non-pubkeyhashout as not pubkeyhashout 1', () => {
      Script('OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000')
        .isPublicKeyHashOut()
        .should.equal(false)
    })

    it('should identify this known non-pubkeyhashout as not pubkeyhashout 2', () => {
      Script('OP_DUP OP_HASH160 2 0x0000 OP_EQUALVERIFY OP_CHECKSIG')
        .isPublicKeyHashOut()
        .should.equal(false)
    })
  })

  describe('#isMultisigOut', () => {
    it('should identify known multisig out 1', () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
        .isMultisigOut()
        .should.equal(true)
    })
    it('should identify known multisig out 2', () => {
      Script(
        'OP_1 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
        .isMultisigOut()
        .should.equal(true)
    })
    it('should identify known multisig out 3', () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x03363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640 OP_3 OP_CHECKMULTISIG'
      )
        .isMultisigOut()
        .should.equal(true)
    })

    it('should identify non-multisig out 1', () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG OP_EQUAL'
      )
        .isMultisigOut()
        .should.equal(false)
    })
    it('should identify non-multisig out 2', () => {
      Script('OP_2').isMultisigOut().should.equal(false)
    })
  })

  describe('#isMultisigIn', () => {
    it('should identify multisig in 1', () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01'
      )
        .isMultisigIn()
        .should.equal(true)
    })
    it('should identify multisig in 2', () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01 0x48 0x30450220357011fd3b3ad2b8f2f2d01e05dc6108b51d2a245b4ef40c112d6004596f0475022100a8208c93a39e0c366b983f9a80bfaf89237fcd64ca543568badd2d18ee2e1d7501'
      )
        .isMultisigIn()
        .should.equal(true)
    })
    it('should identify non-multisig in 1', () => {
      Script(
        '0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01'
      )
        .isMultisigIn()
        .should.equal(false)
    })
    it('should identify non-multisig in 2', () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01 OP_0'
      )
        .isMultisigIn()
        .should.equal(false)
    })
  })

  describe('#isScriptHashIn', () => {
    it('should identify this known scripthashin', () => {
      const sstr =
        'OP_0 73 0x30460221008ca148504190c10eea7f5f9c283c719a37be58c3ad617928011a1bb9570901d2022100ced371a23e86af6f55ff4ce705c57d2721a09c4d192ca39d82c4239825f75a9801 72 0x30450220357011fd3b3ad2b8f2f2d01e05dc6108b51d2a245b4ef40c112d6004596f0475022100a8208c93a39e0c366b983f9a80bfaf89237fcd64ca543568badd2d18ee2e1d7501 OP_PUSHDATA1 105 0x5221024c02dff2f0b8263a562a69ec875b2c95ffad860f428acf2f9e8c6492bd067d362103546324a1351a6b601c623b463e33b6103ca444707d5b278ece1692f1aa7724a42103b1ad3b328429450069cc3f9fa80d537ee66ba1120e93f3f185a5bf686fb51e0a53ae'
      const s = Script(sstr)
      s.toString().should.equal(sstr)
      s.isScriptHashIn().should.equal(true)
    })

    it('should identify this known non-scripthashin', () => {
      Script('20 0000000000000000000000000000000000000000 OP_CHECKSIG')
        .isScriptHashIn()
        .should.equal(false)
    })

    it('should identify this problematic non-scripthashin scripts', () => {
      const s = new Script(
        '71 0x3044022017053dad84aa06213749df50a03330cfd24d6' +
          'b8e7ddbb6de66c03697b78a752a022053bc0faca8b4049fb3944a05fcf7c93b2861' +
          '734d39a89b73108f605f70f5ed3401 33 0x0225386e988b84248dc9c30f784b06e' +
          '02fdec57bbdbd443768eb5744a75ce44a4c'
      )
      const s2 = new Script(
        'OP_RETURN 32 0x19fdb20634911b6459e6086658b3a6ad2dc6576bd6826c73ee86a5f9aec14ed9'
      )
      s.isScriptHashIn().should.equal(false)
      s2.isScriptHashIn().should.equal(false)
    })
    it('identifies this other problematic non-p2sh in', () => {
      const s = Script.fromString(
        '73 0x3046022100dc7a0a812de14acc479d98ae209402cc9b5e0692bc74b9fe0a2f083e2f9964b002210087caf04a711bebe5339fd7554c4f7940dc37be216a3ae082424a5e164faf549401'
      )
      s.isScriptHashIn().should.equal(false)
    })
  })

  describe('#isScripthashOut', () => {
    it('should identify this known p2shout as p2shout', () => {
      Script('OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUAL')
        .isScriptHashOut()
        .should.equal(true)
    })

    it('should identify result of .isScriptHashOut() as p2sh', () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .toScriptHashOut()
        .isScriptHashOut()
        .should.equal(true)
    })

    it('should identify these known non-p2shout as not p2shout', () => {
      Script('OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUAL OP_EQUAL')
        .isScriptHashOut()
        .should.equal(false)
      Script('OP_HASH160 21 0x000000000000000000000000000000000000000000 OP_EQUAL')
        .isScriptHashOut()
        .should.equal(false)
    })
  })

  describe('#isPushOnly', () => {
    it("should know these scripts are or aren't push only", () => {
      Script('OP_NOP 1 0x01').isPushOnly().should.equal(false)
      Script('OP_0').isPushOnly().should.equal(true)
      Script('OP_0 OP_RETURN').isPushOnly().should.equal(false)
      Script('OP_PUSHDATA1 5 0x1010101010').isPushOnly().should.equal(true)
      // like bitcoind, we regard OP_RESERVED as being "push only"
      Script('OP_RESERVED').isPushOnly().should.equal(true)
    })
  })

  describe('#classifyInput', () => {
    it("shouldn't classify public key hash out", () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .classifyInput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify public key hash in', () => {
      Script(
        '47 0x3044022077a8d81e656c4a1c1721e68ce35fa0b27f13c342998e75854858c12396a15ffa02206378a8c6959283c008c87a14a9c0ada5cf3934ac5ee29f1fef9cac6969783e9801 21 0x03993c230da7dabb956292851ae755f971c50532efc095a16bee07f83ab9d262df'
      )
        .classifyInput()
        .should.equal(Script.types.PUBKEYHASH_IN)
    })
    it("shouldn't classify script hash out", () => {
      Script('OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUAL')
        .classifyInput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify script hash in', () => {
      Script(
        'OP_0 73 0x30460221008ca148504190c10eea7f5f9c283c719a37be58c3ad617928011a1bb9570901d2022100ced371a23e86af6f55ff4ce705c57d2721a09c4d192ca39d82c4239825f75a9801 72 0x30450220357011fd3b3ad2b8f2f2d01e05dc6108b51d2a245b4ef40c112d6004596f0475022100a8208c93a39e0c366b983f9a80bfaf89237fcd64ca543568badd2d18ee2e1d7501 OP_PUSHDATA1 105 0x5221024c02dff2f0b8263a562a69ec875b2c95ffad860f428acf2f9e8c6492bd067d362103546324a1351a6b601c623b463e33b6103ca444707d5b278ece1692f1aa7724a42103b1ad3b328429450069cc3f9fa80d537ee66ba1120e93f3f185a5bf686fb51e0a53ae'
      )
        .classifyInput()
        .should.equal(Script.types.SCRIPTHASH_IN)
    })
    it("shouldn't classify MULTISIG out", () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
        .classifyInput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify MULTISIG in', () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01'
      )
        .classifyInput()
        .should.equal(Script.types.MULTISIG_IN)
    })
    it("shouldn't classify OP_RETURN data out", () => {
      Script('OP_RETURN 1 0x01').classifyInput().should.equal(Script.types.UNKNOWN)
    })
    it("shouldn't classify public key out", () => {
      Script(
        '41 0x0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8 OP_CHECKSIG'
      )
        .classifyInput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify public key in', () => {
      Script(
        '47 0x3044022007415aa37ce7eaa6146001ac8bdefca0ddcba0e37c5dc08c4ac99392124ebac802207d382307fd53f65778b07b9c63b6e196edeadf0be719130c5db21ff1e700d67501'
      )
        .classifyInput()
        .should.equal(Script.types.PUBKEY_IN)
    })
    it('should classify unknown', () => {
      Script('OP_TRUE OP_FALSE').classifyInput().should.equal(Script.types.UNKNOWN)
    })
    it("should classify scriptHashIn, eventhough it's opreturn", () => {
      Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
        .classifyInput()
        .should.equal(Script.types.SCRIPTHASH_IN)
    })
  })

  describe('#classifyOutput', () => {
    it('should classify public key hash out', () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .classifyOutput()
        .should.equal(Script.types.PUBKEYHASH_OUT)
    })
    it("shouldn't classify public key hash in", () => {
      Script(
        '47 0x3044022077a8d81e656c4a1c1721e68ce35fa0b27f13c342998e75854858c12396a15ffa02206378a8c6959283c008c87a14a9c0ada5cf3934ac5ee29f1fef9cac6969783e9801 21 0x03993c230da7dabb956292851ae755f971c50532efc095a16bee07f83ab9d262df'
      )
        .classifyOutput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify script hash out', () => {
      Script('OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUAL')
        .classifyOutput()
        .should.equal(Script.types.SCRIPTHASH_OUT)
    })
    it("shouldn't classify script hash in", () => {
      Script(
        'OP_0 73 0x30460221008ca148504190c10eea7f5f9c283c719a37be58c3ad617928011a1bb9570901d2022100ced371a23e86af6f55ff4ce705c57d2721a09c4d192ca39d82c4239825f75a9801 72 0x30450220357011fd3b3ad2b8f2f2d01e05dc6108b51d2a245b4ef40c112d6004596f0475022100a8208c93a39e0c366b983f9a80bfaf89237fcd64ca543568badd2d18ee2e1d7501 OP_PUSHDATA1 105 0x5221024c02dff2f0b8263a562a69ec875b2c95ffad860f428acf2f9e8c6492bd067d362103546324a1351a6b601c623b463e33b6103ca444707d5b278ece1692f1aa7724a42103b1ad3b328429450069cc3f9fa80d537ee66ba1120e93f3f185a5bf686fb51e0a53ae'
      )
        .classifyOutput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify MULTISIG out', () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
        .classifyOutput()
        .should.equal(Script.types.MULTISIG_OUT)
    })
    it("shouldn't classify MULTISIG in", () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01'
      )
        .classifyOutput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify OP_RETURN data out', () => {
      Script('OP_RETURN 1 0x01').classifyOutput().should.equal(Script.types.DATA_OUT)
    })
    it('should classify public key out', () => {
      Script(
        '41 0x0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8 OP_CHECKSIG'
      )
        .classifyOutput()
        .should.equal(Script.types.PUBKEY_OUT)
    })
    it("shouldn't classify public key in", () => {
      Script(
        '47 0x3044022007415aa37ce7eaa6146001ac8bdefca0ddcba0e37c5dc08c4ac99392124ebac802207d382307fd53f65778b07b9c63b6e196edeadf0be719130c5db21ff1e700d67501'
      )
        .classifyOutput()
        .should.equal(Script.types.UNKNOWN)
    })
    it('should classify unknown', () => {
      Script('OP_TRUE OP_FALSE').classifyOutput().should.equal(Script.types.UNKNOWN)
    })
    it('should classify opreturn eventhough it also looks like a scriptHashIn', () => {
      Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
        .classifyOutput()
        .should.equal(Script.types.DATA_OUT)
    })
  })

  describe('#classify', () => {
    it('should classify public key hash out', () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .classify()
        .should.equal(Script.types.PUBKEYHASH_OUT)
    })
    it('should classify public key hash in', () => {
      Script(
        '47 0x3044022077a8d81e656c4a1c1721e68ce35fa0b27f13c342998e75854858c12396a15ffa02206378a8c6959283c008c87a14a9c0ada5cf3934ac5ee29f1fef9cac6969783e9801 21 0x03993c230da7dabb956292851ae755f971c50532efc095a16bee07f83ab9d262df'
      )
        .classify()
        .should.equal(Script.types.PUBKEYHASH_IN)
    })
    it('should classify script hash out', () => {
      Script('OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUAL')
        .classify()
        .should.equal(Script.types.SCRIPTHASH_OUT)
    })
    it('should classify script hash in', () => {
      Script(
        'OP_0 73 0x30460221008ca148504190c10eea7f5f9c283c719a37be58c3ad617928011a1bb9570901d2022100ced371a23e86af6f55ff4ce705c57d2721a09c4d192ca39d82c4239825f75a9801 72 0x30450220357011fd3b3ad2b8f2f2d01e05dc6108b51d2a245b4ef40c112d6004596f0475022100a8208c93a39e0c366b983f9a80bfaf89237fcd64ca543568badd2d18ee2e1d7501 OP_PUSHDATA1 105 0x5221024c02dff2f0b8263a562a69ec875b2c95ffad860f428acf2f9e8c6492bd067d362103546324a1351a6b601c623b463e33b6103ca444707d5b278ece1692f1aa7724a42103b1ad3b328429450069cc3f9fa80d537ee66ba1120e93f3f185a5bf686fb51e0a53ae'
      )
        .classify()
        .should.equal(Script.types.SCRIPTHASH_IN)
    })
    it('should classify MULTISIG out', () => {
      Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
        .classify()
        .should.equal(Script.types.MULTISIG_OUT)
    })
    it('should classify MULTISIG in', () => {
      Script(
        'OP_0 0x47 0x3044022002a27769ee33db258bdf7a3792e7da4143ec4001b551f73e6a190b8d1bde449d02206742c56ccd94a7a2e16ca52fc1ae4a0aa122b0014a867a80de104f9cb18e472c01'
      )
        .classify()
        .should.equal(Script.types.MULTISIG_IN)
    })
    it('should classify OP_RETURN data out', () => {
      Script('OP_RETURN 1 0x01').classify().should.equal(Script.types.DATA_OUT)
    })
    it('should classify public key out', () => {
      Script(
        '41 0x0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8 OP_CHECKSIG'
      )
        .classify()
        .should.equal(Script.types.PUBKEY_OUT)
    })
    it('should classify public key in', () => {
      Script(
        '47 0x3044022007415aa37ce7eaa6146001ac8bdefca0ddcba0e37c5dc08c4ac99392124ebac802207d382307fd53f65778b07b9c63b6e196edeadf0be719130c5db21ff1e700d67501'
      )
        .classify()
        .should.equal(Script.types.PUBKEY_IN)
    })
    it('should classify unknown', () => {
      Script('OP_TRUE OP_FALSE').classify().should.equal(Script.types.UNKNOWN)
    })
    it('should classify opreturn eventhough it also looks like a scriptHashIn', () => {
      Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
        .classifyInput()
        .should.equal(Script.types.SCRIPTHASH_IN)
      Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
        .classify()
        .should.equal(Script.types.DATA_OUT)
    })
    it('should classify scriptHashIn eventhough it is opreturn when script is marked is input', () => {
      Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
        .classify()
        .should.equal(Script.types.DATA_OUT)
      const s = Script('6a1c3630fd3792f7e847ae5e27985dfb127542ef37ac2a5147c3b9cec7ba')
      s._isInput = true // this is normally set by when Script is initiated as part if Input or Output objects
      s.classify().should.equal(Script.types.SCRIPTHASH_IN)
    })
    it('should classify unknown eventhough it is public key hash when marked as input', () => {
      Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
        .classify()
        .should.equal(Script.types.PUBKEYHASH_OUT)
      const s = Script(
        'OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG'
      )
      s._isInput = true // this is normally set by when Script is initiated as part if Input or Output objects
      s.classify().should.equal(Script.types.UNKNOWN)
    })
    it('should classify unknown eventhough it is public key hash in when marked as output', () => {
      const s = Script(
        '47 0x3044022077a8d81e656c4a1c1721e68ce35fa0b27f13c342998e75854858c12396a15ffa02206378a8c6959283c008c87a14a9c0ada5cf3934ac5ee29f1fef9cac6969783e9801 21 0x03993c230da7dabb956292851ae755f971c50532efc095a16bee07f83ab9d262df'
      )
      s.classify().should.equal(Script.types.PUBKEYHASH_IN)
      s._isOutput = true // this is normally set by when Script is initiated as part if Input or Output objects
      s.classify().should.equal(Script.types.UNKNOWN)
    })
  })

  describe('#add and #prepend', () => {
    it('should add these ops', () => {
      Script().add(1).add(10).add(186).toString().should.equal('0x01 0x0a 0xba')
      Script().add(1000).toString().should.equal('0x03e8')
      Script().add('OP_CHECKMULTISIG').toString().should.equal('OP_CHECKMULTISIG')
      Script().add('OP_1').add('OP_2').toString().should.equal('OP_1 OP_2')
      Script().add(Opcode.OP_CHECKMULTISIG).toString().should.equal('OP_CHECKMULTISIG')
      Script().add(Opcode.map.OP_CHECKMULTISIG).toString().should.equal('OP_CHECKMULTISIG')
    })

    it('should prepend these ops', () => {
      Script().prepend('OP_CHECKMULTISIG').toString().should.equal('OP_CHECKMULTISIG')
      Script().prepend('OP_1').prepend('OP_2').toString().should.equal('OP_2 OP_1')
    })

    it('should add and prepend correctly', () => {
      Script()
        .add('OP_1')
        .prepend('OP_2')
        .add('OP_3')
        .prepend('OP_4')
        .toString()
        .should.equal('OP_4 OP_2 OP_1 OP_3')
    })

    it('should add these push data', () => {
      let buf = Buffer.alloc(1)
      buf.fill(0)
      Script().add(buf).toString().should.equal('1 0x00')
      buf = Buffer.alloc(255)
      buf.fill(0)
      Script()
        .add(buf)
        .toString()
        .should.equal(`OP_PUSHDATA1 255 0x${buf.toString('hex')}`)
      buf = Buffer.alloc(256)
      buf.fill(0)
      Script()
        .add(buf)
        .toString()
        .should.equal(`OP_PUSHDATA2 256 0x${buf.toString('hex')}`)
      buf = Buffer.alloc(2 ** 16)
      buf.fill(0)
      Script()
        .add(buf)
        .toString()
        .should.equal(`OP_PUSHDATA4 ${2 ** 16} 0x${buf.toString('hex')}`)
    })

    it('should add both pushdata and non-pushdata chunks', () => {
      Script().add('OP_CHECKMULTISIG').toString().should.equal('OP_CHECKMULTISIG')
      Script().add(Opcode.map.OP_CHECKMULTISIG).toString().should.equal('OP_CHECKMULTISIG')
      const buf = Buffer.alloc(1)
      buf.fill(0)
      Script().add(buf).toString().should.equal('1 0x00')
    })

    it('should work for no data OP_RETURN', () => {
      Script().add(Opcode.OP_RETURN).add(Buffer.from('')).toString().should.equal('OP_RETURN')
    })
    it('works with objects', () => {
      Script()
        .add({
          opcodenum: 106,
        })
        .toString()
        .should.equal('OP_RETURN')
    })
    it('works with another script', () => {
      const someScript = Script(
        'OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 ' +
          '21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG'
      )
      const s = new Script().add(someScript)
      s.toString().should.equal(someScript.toString())
    })
    it('fails with wrong type', () => {
      const fails = function () {
        return new Script().add(true)
      }
      fails.should.throw('Invalid script chunk')
    })
  })

  describe('#isStandard', () => {
    it('should classify correctly standard script', () => {
      Script('OP_RETURN 1 0x00').isStandard().should.equal(true)
    })
    it('should classify correctly non standard script', () => {
      Script('OP_TRUE OP_FALSE').isStandard().should.equal(false)
    })
  })

  describe('#buildMultisigOut', () => {
    const pubKeyHexes = [
      '022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da',
      '03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9',
      '021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18',
      '02bf97f572a02a8900246d72c2e8fa3d3798a6e59c4e17de2d131d9c60d0d9b574',
      '036a98a36aa7665874b1ba9130bc6d318e52fd3bdb5969532d7fc09bf2476ff842',
      '033aafcbead78c08b0e0aacc1b0cdb40702a7c709b660bebd286e973242127e15b',
    ]
    const sortkeys = pubKeyHexes.slice(0, 3).map(PublicKey)
    it('should create sorted script by default', () => {
      const s = Script.buildMultisigOut(sortkeys, 2)
      s.toString().should.equal(
        'OP_2 33 0x021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18 33 0x022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da 33 0x03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9 OP_3 OP_CHECKMULTISIG'
      )
      s.isMultisigOut().should.equal(true)
    })
    it('should fail when number of required signatures is greater than number of pubkeys', () => {
      expect(sortkeys.length).to.equal(3)
      expect(() => Script.buildMultisigOut(sortkeys, 4)).to.throw(
        'Number of required signatures must be less than or equal to the number of public keys'
      )
    })
    it('should create unsorted script if specified', () => {
      const s = Script.buildMultisigOut(sortkeys, 2)
      const u = Script.buildMultisigOut(sortkeys, 2, {
        noSorting: true,
      })
      s.toString().should.not.equal(u.toString())
      u.toString().should.equal(
        'OP_2 33 0x022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da 33 0x03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9 33 0x021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18 OP_3 OP_CHECKMULTISIG'
      )
      s.isMultisigOut().should.equal(true)
    })
    const testMn = function (m, n) {
      const pubkeys = pubKeyHexes.slice(0, n).map(PublicKey)
      const s = Script.buildMultisigOut(pubkeys, m)
      s.isMultisigOut().should.equal(true)
    }
    for (let n = 1; n < 6; n++) {
      for (let m = 1; m <= n; m++) {
        it(`should create ${m}-of-${n}`, testMn.bind(null, m, n))
      }
    }
  })
  describe('#buildWitnessMultisigOutFromScript', () => {
    it('it will build nested witness scriptSig', () => {
      const redeemScript = new Script();
      const redeemHash = Bitcoin.crypto.Hash.sha256(redeemScript.toBuffer());
      const s = Script.buildWitnessMultisigOutFromScript(redeemScript);
      const buf = s.toBuffer();
      buf[0].should.equal(0);
      buf.slice(2, 34).toString('hex').should.equal(redeemHash.toString('hex'));
    })
  })
  describe('#buildPublicKeyHashOut', () => {
    it('should create script from livenet address', () => {
      const address = Address.fromString('1NaTVwXDDUJaXDQajoa9MqHhz4uTxtgK14')
      const s = Script.buildPublicKeyHashOut(address)
      should.exist(s)
      s.toString().should.equal(
        'OP_DUP OP_HASH160 20 0xecae7d092947b7ee4998e254aa48900d26d2ce1d OP_EQUALVERIFY OP_CHECKSIG'
      )
      s.isPublicKeyHashOut().should.equal(true)
      s.toAddress().toString().should.equal('1NaTVwXDDUJaXDQajoa9MqHhz4uTxtgK14')
    })
    it('should create script from testnet address', () => {
      const address = Address.fromString('mxRN6AQJaDi5R6KmvMaEmZGe3n5ScV9u33')
      const s = Script.buildPublicKeyHashOut(address)
      should.exist(s)
      s.toString().should.equal(
        'OP_DUP OP_HASH160 20 0xb96b816f378babb1fe585b7be7a2cd16eb99b3e4 OP_EQUALVERIFY OP_CHECKSIG'
      )
      s.isPublicKeyHashOut().should.equal(true)
      s.toAddress().toString().should.equal('mxRN6AQJaDi5R6KmvMaEmZGe3n5ScV9u33')
    })
    it('should create script from public key', () => {
      const pubkey = new PublicKey(
        '022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da'
      )
      const s = Script.buildPublicKeyHashOut(pubkey)
      should.exist(s)
      s.toString().should.equal(
        'OP_DUP OP_HASH160 20 0x9674af7395592ec5d91573aa8d6557de55f60147 OP_EQUALVERIFY OP_CHECKSIG'
      )
      s.isPublicKeyHashOut().should.equal(true)
      should.exist(s._network)
      s._network.should.equal(pubkey.network)
    })
  })
  describe('#buildPublicKeyOut', () => {
    it('should create script from public key', () => {
      const pubkey = new PublicKey(
        '022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da'
      )
      const s = Script.buildPublicKeyOut(pubkey)
      should.exist(s)
      s.toString().should.equal(
        '33 0x022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da OP_CHECKSIG'
      )
      s.isPublicKeyOut().should.equal(true)
    })
  })
  describe('#buildDataOut', () => {
    it('should create script from no data', () => {
      const s = Script.buildDataOut()
      should.exist(s)
      s.toString().should.equal('OP_RETURN')
      s.isDataOut().should.equal(true)
    })
    it('should create script from empty data', () => {
      const data = Buffer.from('')
      const s = Script.buildDataOut(data)
      should.exist(s)
      s.toString().should.equal('OP_RETURN')
      s.isDataOut().should.equal(true)
    })
    it('should create script from some data', () => {
      const data = Buffer.from('bacacafe0102030405', 'hex')
      const s = Script.buildDataOut(data)
      should.exist(s)
      s.toString().should.equal('OP_RETURN 9 0xbacacafe0102030405')
      s.isDataOut().should.equal(true)
    })
    it('should create script from string', () => {
      const data = 'hello world!!!'
      const s = Script.buildDataOut(data)
      should.exist(s)
      s.toString().should.equal('OP_RETURN 14 0x68656c6c6f20776f726c64212121')
      s.isDataOut().should.equal(true)
    })
    it('should create script from a hex string', () => {
      const hexString = 'abcdef0123456789'
      const s = Script.buildDataOut(hexString, 'hex')
      should.exist(s)
      s.toString().should.equal('OP_RETURN 8 0xabcdef0123456789')
      s.isDataOut().should.equal(true)
    })
  })
  describe('#buildScriptHashOut', () => {
    it('should create script from another script', () => {
      const inner = new Script(
        'OP_DUP OP_HASH160 20 0x06c06f6d931d7bfba2b5bd5ad0d19a8f257af3e3 OP_EQUALVERIFY OP_CHECKSIG'
      )
      const s = Script.buildScriptHashOut(inner)
      should.exist(s)
      s.toString().should.equal('OP_HASH160 20 0x45ea3f9133e7b1cef30ba606f8433f993e41e159 OP_EQUAL')
      s.isScriptHashOut().should.equal(true)
    })

    it('inherits network property from other script', () => {
      const s1 = Script.fromAddress(new Address('1FSMWkjVPAxzUNjbxT52p3mVKC971rfW3S'))
      const s2 = Script.buildScriptHashOut(s1)
      should.exist(s1._network)
      s1._network.should.equal(s2._network)
    })

    it('inherits network property form an address', () => {
      const address = new Address('34Nn91aTGaULqWsZiunrBPHzFBDrZ3B8XS')
      const script = Script.buildScriptHashOut(address)
      should.exist(script._network)
      script._network.should.equal(address.network)
    })
  })
  describe('#toScriptHashOut', () => {
    it('should create script from another script', () => {
      const s = new Script(
        'OP_DUP OP_HASH160 20 0x06c06f6d931d7bfba2b5bd5ad0d19a8f257af3e3 OP_EQUALVERIFY OP_CHECKSIG'
      )
      const sho = s.toScriptHashOut()
      sho
        .toString()
        .should.equal('OP_HASH160 20 0x45ea3f9133e7b1cef30ba606f8433f993e41e159 OP_EQUAL')
      sho.isScriptHashOut().should.equal(true)
    })
  })

  describe('#removeCodeseparators', () => {
    it('should remove any OP_CODESEPARATORs', () => {
      Script('OP_CODESEPARATOR OP_0 OP_CODESEPARATOR')
        .removeCodeseparators()
        .toString()
        .should.equal('OP_0')
    })
  })

  describe('#findAndDelete', () => {
    it('should find and delete this buffer', () => {
      Script('OP_RETURN 2 0xf0f0')
        .findAndDelete(Script('2 0xf0f0'))
        .toString()
        .should.equal('OP_RETURN')
    })
    it('should do nothing', () => {
      Script('OP_RETURN 2 0xf0f0')
        .findAndDelete(Script('2 0xffff'))
        .toString()
        .should.equal('OP_RETURN 2 0xf0f0')
    })
  })

  describe('#checkMinimalPush', () => {
    it('should check these minimal pushes', () => {
      Script().add(1).checkMinimalPush(0).should.equal(true)
      Script().add(0).checkMinimalPush(0).should.equal(true)
      Script().add(-1).checkMinimalPush(0).should.equal(true)
      Script().add(1000).checkMinimalPush(0).should.equal(true)
      Script().add(0xffffffff).checkMinimalPush(0).should.equal(true)
      Script().add(0xffffffffffffffff).checkMinimalPush(0).should.equal(true)
      Script()
        .add(Buffer.from([0]))
        .checkMinimalPush(0)
        .should.equal(true)

      let buf = Buffer.alloc(75)
      buf.fill(1)
      Script().add(buf).checkMinimalPush(0).should.equal(true)

      buf = Buffer.alloc(76)
      buf.fill(1)
      Script().add(buf).checkMinimalPush(0).should.equal(true)

      buf = Buffer.alloc(256)
      buf.fill(1)
      Script().add(buf).checkMinimalPush(0).should.equal(true)
    })
  })

  describe('getData returns associated data', () => {
    it('works with this testnet transaction', () => {
      // testnet block: 00000000a36400fc06440512354515964bc36ecb0020bd0b0fd48ae201965f54
      // txhash: e362e21ff1d2ef78379d401d89b42ce3e0ce3e245f74b1f4cb624a8baa5d53ad (output 0);
      const script = Script.fromBuffer(Buffer.from('6a', 'hex'))
      const dataout = script.isDataOut()
      dataout.should.equal(true)
      const data = script.getData()
      data.should.deep.equal(Buffer.alloc(0))
    })
    it('for a P2PKH address', () => {
      const address = Address.fromString('1NaTVwXDDUJaXDQajoa9MqHhz4uTxtgK14')
      const script = Script.buildPublicKeyHashOut(address)
      expect(BufferUtil.equal(script.getData(), address.hashBuffer)).to.equal(true)
    })
    it('for a P2SH address', () => {
      const address = Address.fromString('3GhtMmAbWrUf6Y8vDxn9ETB14R6V7Br3mt')
      const script = new Script(address)
      expect(BufferUtil.equal(script.getData(), address.hashBuffer)).to.equal(true)
    })
    it('for a standard opreturn output', () => {
      expect(BufferUtil.equal(Script('OP_RETURN 1 0xFF').getData(), Buffer.from([255]))).to.equal(
        true
      )
    })
    it('fails if content is not recognized', () => {
      expect(() => Script('1 0xFF').getData()).to.throw()
    })
  })

  describe('toAddress', () => {
    const pubkey = new PublicKey(
      '027ffeb8c7795d529ee9cd96512d472cefe398a0597623438ac5d066a64af50072'
    )
    const liveAddress = pubkey.toAddress(Networks.livenet)
    const testAddress = pubkey.toAddress(Networks.testnet)

    it('priorize the network argument', () => {
      const script = new Script(liveAddress)
      script.toAddress(Networks.testnet).toString().should.equal(testAddress.toString())
      script.toAddress(Networks.testnet).network.should.equal(Networks.testnet)
    })
    it('use the inherited network', () => {
      let script = new Script(liveAddress)
      script.toAddress().toString().should.equal(liveAddress.toString())
      script = new Script(testAddress)
      script.toAddress().toString().should.equal(testAddress.toString())
    })
    it('uses default network', () => {
      const script = new Script(
        'OP_DUP OP_HASH160 20 ' +
          '0x06c06f6d931d7bfba2b5bd5ad0d19a8f257af3e3 OP_EQUALVERIFY OP_CHECKSIG'
      )
      script.toAddress().network.should.equal(Networks.defaultNetwork)
    })
    it('for a P2PKH address', () => {
      const stringAddress = '1NaTVwXDDUJaXDQajoa9MqHhz4uTxtgK14'
      const address = new Address(stringAddress)
      const script = new Script(address)
      script.toAddress().toString().should.equal(stringAddress)
    })
    it('for a P2SH address', () => {
      const stringAddress = '3GhtMmAbWrUf6Y8vDxn9ETB14R6V7Br3mt'
      const address = new Address(stringAddress)
      const script = new Script(address)
      script.toAddress().toString().should.equal(stringAddress)
    })
    it('fails if content is not recognized', () => {
      Script().toAddress(Networks.livenet).should.equal(false)
    })

    it('works for p2pkh output', () => {
      // taken from tx 7e519caca256423320b92e3e17be5701f87afecbdb3f53af598032bfd8d164f5
      const script = new Script(
        'OP_DUP OP_HASH160 20 ' +
          '0xc8e11b0eb0d2ad5362d894f048908341fa61b6e1 OP_EQUALVERIFY OP_CHECKSIG'
      )
      script.toAddress().toString().should.equal('1KK9oz4bFH8c1t6LmighHaoSEGx3P3FEmc')
    })
    it('works for p2pkh input', () => {
      // taken from tx 7e519caca256423320b92e3e17be5701f87afecbdb3f53af598032bfd8d164f5
      const script = new Script(
        '72 0x3045022100eff96230ca0f55b1e8c7a63e014f48611ff1af40875ecd33dee9062d7a6f5e2002206320405b5f6992c756e03e66b21a05a812b60996464ac6af815c2638b930dd7a01 65 0x04150defa035a2c7d826d7d5fc8ab2154bd1bb832f1a5c8ecb338f436362ad232e428b57db44677c5a8bd42c5ed9e2d7e04e742c59bee1b40080cfd57dec64b23a'
      )
      script.toAddress().toString().should.equal('1KK9oz4bFH8c1t6LmighHaoSEGx3P3FEmc')
      // taken from tx 7f8f95752a59d715dae9e0008a42e7968d2736741591bbfc6685f6e1649c21ed
      const s2 = new Script(
        '71 0x3044022017053dad84aa06213749df50a03330cfd24d6b8e7ddbb6de66c03697b78a752a022053bc0faca8b4049fb3944a05fcf7c93b2861734d39a89b73108f605f70f5ed3401 33 0x0225386e988b84248dc9c30f784b06e02fdec57bbdbd443768eb5744a75ce44a4c'
      )
      s2.toAddress().toString().should.equal('17VArX6GRE6i6MVscBUZoXwi6NhnHa68B7')
    })

    it('works for p2sh output', () => {
      // taken from tx fe1f764299dc7f3b5a8fae912050df2b633bf99554c68bf1c456edb9c2b63585
      const script = new Script('OP_HASH160 20 0x99d29051af0c29adcb9040034752bba7dde33e35 OP_EQUAL')
      script.toAddress().toString().should.equal('3FiMZ7stbfH2WG5JQ7CiuzrFo7CEnGUcAP')
    })
    it('works for p2sh input', () => {
      // taken from tx fe1f764299dc7f3b5a8fae912050df2b633bf99554c68bf1c456edb9c2b63585
      const script = new Script(
        'OP_FALSE 72 0x3045022100e824fbe979fac5834d0062dd5a4e82a898e00ac454bd254cd708ad28530816f202206251ff0fa4dd70c0524c690d4e4deb2bd167297e7bbdf6743b4a8050d681555001 37 0x512102ff3ae0aaa4679ea156d5581dbe6695cc0c311df0aa42af76670d0debbd8f672951ae'
      )
      script.toAddress().toString().should.equal('3GYicPxCvsKvbJmZNBBeWkC3cLuGFhtrQi')
    })

    // no address scripts
    it('works for OP_RETURN script', () => {
      const script = new Script('OP_RETURN 20 0x99d29051af0c29adcb9040034752bba7dde33e35')
      script.toAddress().should.equal(false)
    })
  })
  describe('equals', () => {
    it('returns true for same script', () => {
      Script('OP_TRUE').equals(Script('OP_TRUE')).should.equal(true)
    })
    it('returns false for different chunks sizes', () => {
      Script('OP_TRUE').equals(Script('OP_TRUE OP_TRUE')).should.equal(false)
    })
    it('returns false for different opcodes', () => {
      Script('OP_TRUE OP_TRUE').equals(Script('OP_TRUE OP_FALSE')).should.equal(false)
    })
    it('returns false for different data', () => {
      Script().add(Buffer.from('a')).equals(Script('OP_TRUE')).should.equal(false)
    })
    it('returns false for different data', () => {
      Script()
        .add(Buffer.from('a'))
        .equals(Script().add(Buffer.from('b')))
        .should.equal(false)
    })
  })

  describe('#getSignatureOperationsCount', () => {
    // comes from bitcoind src/test/sigopcount_tests
    // only test calls to function with boolean param, not signature ref param
    const pubKeyHexes = [
      '022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da',
      '03e3818b65bcc73a7d64064106a859cc1a5a728c4345ff0b641209fba0d90de6e9',
      '021f2f6e1e50cb6a953935c3601284925decd3fd21bc445712576873fb8c6ebc18',
    ]
    it('should return zero for empty scripts', () => {
      Script().getSignatureOperationsCount(false).should.equal(0)
      Script().getSignatureOperationsCount(true).should.equal(0)
    })
    it('should handle multi-sig multisig scripts from string', () => {
      let s1 = 'OP_1 01 FF OP_2 OP_CHECKMULTISIG'
      Script(s1).getSignatureOperationsCount(true).should.equal(2)
      s1 += ' OP_IF OP_CHECKSIG OP_ENDIF'
      Script(s1).getSignatureOperationsCount(true).should.equal(3)
      Script(s1).getSignatureOperationsCount(false).should.equal(21)
    })
    it('should handle multi-sig-out scripts from utility function', () => {
      const sortKeys = pubKeyHexes.slice(0, 3).map(PublicKey)
      const s2 = Script.buildMultisigOut(sortKeys, 1)
      Script(s2).getSignatureOperationsCount(true).should.equal(3)
      Script(s2).getSignatureOperationsCount(false).should.equal(20)
    })
    it('should handle P2SH-multisig-in scripts from utility', () => {
      // create a well-formed signature, does not need to match pubkeys
      const signature = Bitcoin.crypto.Signature.fromString('30060201FF0201FF')
      const signatures = [signature.toBuffer()]
      const p2sh = Script.buildP2SHMultisigIn(pubKeyHexes, 1, signatures, {})
      p2sh.getSignatureOperationsCount(true).should.equal(0)
      p2sh.getSignatureOperationsCount(false).should.equal(0)
    })
    it('should default the one and only argument to true', () => {
      const s1 = 'OP_1 01 FF OP_2 OP_CHECKMULTISIG'
      const trueCount = Script(s1).getSignatureOperationsCount(true)
      const falseCount = Script(s1).getSignatureOperationsCount(false)
      const defaultCount = Script(s1).getSignatureOperationsCount()
      trueCount.should.not.equal(falseCount)
      trueCount.should.equal(defaultCount)
    })
  })
})
