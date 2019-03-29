import Bitcoin from '../bitcoin'
import vectorsValid from '../data/bitcoind/tx_valid.json'
import vectorsInvalid from '../data/bitcoind/tx_invalid.json'

const { Transaction } = Bitcoin

describe('Transaction deserialization', function() {
  describe('valid transaction test case', function() {
    let index = 0
    vectorsValid.forEach(function(vector) {
      it(`vector #${index}`, function() {
        if (vector.length > 1) {
          const hexa = vector[1]
          new Transaction(hexa).serialize(true).should.equal(hexa)
          index += 1
        }
      })
    })
  })
  describe('invalid transaction test case', function() {
    let index = 0
    vectorsInvalid.forEach(function(vector) {
      it(`invalid vector #${index}`, function() {
        if (vector.length > 1) {
          const hexa = vector[1]
          new Transaction(hexa).serialize(true).should.equal(hexa)
          index += 1
        }
      })
    })
  })
})
