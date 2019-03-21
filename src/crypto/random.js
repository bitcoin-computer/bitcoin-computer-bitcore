const crypto = require('crypto');

function Random() {}

/* secure random bytes that sometimes throws an error due to lack of entropy */
Random.getRandomBuffer = function(size) {
  if (process.browser) {
    return Random.getRandomBufferBrowser(size);
  }
  return Random.getRandomBufferNode(size);
};

Random.getRandomBufferNode = function(size) {
  return crypto.randomBytes(size);
};

Random.getRandomBufferBrowser = function(size) {
  let windowCrypto;
  if (!window.crypto && !window.msCrypto) {
    throw new Error('window.crypto not available');
  }

  if (window.crypto && window.crypto.getRandomValues) {
    windowCrypto = window.crypto;
  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
    // internet explorer
    windowCrypto = window.msCrypto;
  } else {
    throw new Error('window crypto.getRandomValues not available');
  }

  const bbuf = new Uint8Array(size);
  windowCrypto.getRandomValues(bbuf);
  const buf = Buffer.from(bbuf);

  return buf;
};

/* insecure random bytes, but it never fails */
Random.getPseudoRandomBuffer = function(size) {
  const b32 = 0x100000000;
  const b = Buffer.alloc(size);
  let r;

  for (let i = 0; i <= size; i += 1) {
    const j = Math.floor(i / 4);
    const k = i - j * 4;
    if (k === 0) {
      r = Math.random() * b32;
      b[i] = r & 0xff;
    } else {
      b[i] = (r >>>= 8) & 0xff;
    }
  }

  return b;
};

module.exports = Random;
