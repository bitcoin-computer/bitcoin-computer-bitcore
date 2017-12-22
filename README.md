BitcoinCash.js v0.1
===================

[![NPM Package](https://img.shields.io/npm/v/bitcoincashjs.svg?style=flat-square)](https://www.npmjs.org/package/bitcoincashjs)
[![Build Status](https://img.shields.io/travis/bitcoincashjs/bitcoincashjs.svg?branch=master&style=flat-square)](https://travis-ci.org/bitcoincashjs/bitcoincashjs)
[![Coverage Status](https://img.shields.io/coveralls/bitcoincashjs/bitcoincashjs.svg?style=flat-square)](https://coveralls.io/r/bitcoincashjs/bitcoincashjs)

A pure and powerful JavaScript Bitcoin Cash library.

## Bitcoin Cash

Bitcoin Cash is the continuation of the Bitcoin project as peer-to-peer electronic cash for the Internet.

Bitcoin Cash uses a different `SigHash` for transaction signatures. The implementation in BitcoinCash.js has been tested agains the original Bitcoin Cash test vectors (see sighash.json in `/test`). Modifications in script evaluation have not yet been implemented.

## Get Started

```
npm install --save bitcoincashjs
```

```
bower install bitcoincashjs
```

## Documentation

The complete docs are hosted here: [BitcoinCash.js documentation](http://bitcore.io/guide/).

- [Read the Developer Guide](http://bitcore.io/guide/)

## Examples

* [Generate a random address](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#generate-a-random-address)
* [Generate a address from a SHA256 hash](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#generate-a-address-from-a-sha256-hash)
* [Import an address via WIF](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#import-an-address-via-wif)
* [Create a Transaction](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#create-a-transaction)
* [Sign a Bitcoin message](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#sign-a-bitcoin-message)
* [Verify a Bitcoin message](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#verify-a-bitcoin-message)
* [Create an OP RETURN transaction](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#create-an-op-return-transaction)
* [Create a 2-of-3 multisig P2SH address](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
* [Spend from a 2-of-2 multisig P2SH address](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)


## Security

BitcoinCash.js is built upon Bitcore, which is used in production at Bitpay and many other [projects](http://bitcore.io#projects).

If you find a security issue, please email bitcoincashjs@tuta.io.

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement. For more information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/CONTRIBUTING.md) file.

## Building the Browser Bundle

To build a bitcoincashjs full bundle for the browser:

```sh
gulp browser
```

This will generate files named `bitcoincashjs.js` and `bitcoincashjs.min.js`.

## Development & Tests

```sh
git clone https://github.com/bitcoincashjs/bitcoincashjs
cd bitcoincashjs
npm install
```

Run all the tests:

```sh
gulp test
```

You can also run just the Node.js tests with `gulp test:node`, just the browser tests with `gulp test:browser`
or create a test coverage report (you can open `coverage/lcov-report/index.html` to visualize it) with `gulp coverage`.

## License

Code released under [the MIT license](https://github.com/bitcoincashjs/bitcoincashjs/blob/master/LICENSE).

Copyright 2013-2017 BitPay, Inc. Bitcore is a trademark maintained by BitPay, Inc.
