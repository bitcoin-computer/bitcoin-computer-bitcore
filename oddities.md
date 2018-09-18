

# Some bad patterns that we found

Require inside a function def in [src/transaction/sighash.js](https://github.com/BitcoinDB/BitcoinCashFlow/blob/master/src/transaction/sighash.js#L139)

```
function sighash(transaction, sighashType, inputNumber, subscript, satoshisBN) {
  /* eslint-disable global-require */
  // TODO If this is moved in the global scope a bunch of tests fails. This is probably
  // due to a circular dependency. This file could probably use a major overhaul.
  // See GitHub isuse #42.
  const Transaction = require('./transaction');
  const Input = require('./input');
```



Dead code in [src/crypto/bn.js](https://github.com/BitcoinDB/BitcoinCashFlow/pull/75/files#diff-7318cf02df7fd57cc2392bffec7369adR79)

```
if (natlen === opts.size) {
      buf = buf; // Looks like do nothing
    } else */ if (natlen > opts.size) {
      buf = BN.trim(buf, natlen);
    } else if (natlen < opts.size) {
      buf = BN.pad(buf, natlen, opts.size);
    }
```