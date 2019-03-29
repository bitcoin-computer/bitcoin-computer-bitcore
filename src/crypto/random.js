// @flow

import crypto from 'crypto'

export function getRandomBufferNode(size: number) {
  return crypto.randomBytes(size)
}

export function getRandomBufferBrowser(size: number) {
  let windowCrypto
  if (window.crypto && window.crypto.getRandomValues) {
    windowCrypto = window.crypto
  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
    // internet explorer
    windowCrypto = window.msCrypto
  } else {
    throw new Error('window crypto.getRandomValues not available')
  }

  const bbuf = new Uint8Array(size)
  windowCrypto.getRandomValues(bbuf)
  const buf = Buffer.from(bbuf)

  return buf
}

/* secure random bytes that sometimes throws an error due to lack of entropy */
export function getRandomBuffer(size: number) {
  if (
    typeof window !== 'undefined' &&
    (typeof window.crypto !== 'undefined' || typeof window.msCrypto !== 'undefined')
  ) {
    return getRandomBufferBrowser(size)
  }
  return getRandomBufferNode(size)
}

/* insecure random bytes, but it never fails */
export function getPseudoRandomBuffer(size: number) {
  const b32 = 0x100000000
  const b = Buffer.alloc(size)
  let r = 0

  for (let i = 0; i <= size; i += 1) {
    const j = Math.floor(i / 4)
    const k = i - j * 4
    if (k === 0) {
      r = Math.random() * b32
      b[i] = r & 0xff
    } else {
      b[i] = (r >>>= 8) & 0xff
    }
  }

  return b
}
