const _ = require('lodash');
const buffer = require('buffer');
const BN = require('../crypto/bn');
const bufferUtil = require('../util/buffer');
const JSUtil = require('../util/js');
const BufferWriter = require('../encoding/bufferwriter');
const Script = require('../script');
const $ = require('../util/preconditions');
const errors = require('../errors');

const MAX_SAFE_INTEGER = 0x1fffffffffffff;

function Output(args) {
  if (!(this instanceof Output)) {
    return new Output(args);
  }
  if (_.isObject(args)) {
    this.satoshis = args.satoshis;
    if (bufferUtil.isBuffer(args.script)) {
      this._scriptBuffer = args.script;
    } else {
      let script;
      if (_.isString(args.script) && JSUtil.isHexa(args.script)) {
        script = new buffer.Buffer(args.script, 'hex');
      } else {
        ({ script } = args);
      }
      this.setScript(script);
    }
  } else {
    throw new TypeError('Unrecognized argument for Output');
  }
}

Object.defineProperty(Output.prototype, 'script', {
  configurable: false,
  enumerable: true,
  get() {
    if (this._script) {
      return this._script;
    }
    this.setScriptFromBuffer(this._scriptBuffer);
    return this._script;
  },
});

Object.defineProperty(Output.prototype, 'satoshis', {
  configurable: false,
  enumerable: true,
  get() {
    return this._satoshis;
  },
  set(num) {
    if (num instanceof BN) {
      this._satoshisBN = num;
      this._satoshis = num.toNumber();
    } else if (_.isString(num)) {
      this._satoshis = parseInt(num, 10);
      this._satoshisBN = BN.fromNumber(this._satoshis);
    } else {
      $.checkArgument(
        JSUtil.isNaturalNumber(num),
        'Output satoshis is not a natural number',
      );
      this._satoshisBN = BN.fromNumber(num);
      this._satoshis = num;
    }
    $.checkState(
      JSUtil.isNaturalNumber(this._satoshis),
      'Output satoshis is not a natural number',
    );
  },
});

Output.prototype.invalidSatoshis = function () {
  if (this._satoshis > MAX_SAFE_INTEGER) {
    return 'transaction txout satoshis greater than max safe integer';
  }
  if (this._satoshis !== this._satoshisBN.toNumber()) {
    return 'transaction txout satoshis has corrupted value';
  }
  if (this._satoshis < 0) {
    return 'transaction txout negative';
  }
  return false;
};


Object.defineProperty(Output.prototype, 'satoshisBN', {
  configurable: false,
  enumerable: true,
  get() {
    return this._satoshisBN;
  },
  set(num) {
    this._satoshisBN = num;
    this._satoshis = num.toNumber();
    $.checkState(
      JSUtil.isNaturalNumber(this._satoshis),
      'Output satoshis is not a natural number',
    );
  },
});

Output.prototype.toJSON = function toObject() {
  const obj = {
    satoshis: this.satoshis,
  };
  obj.script = this._scriptBuffer.toString('hex');
  return obj;
};

Output.prototype.toObject = Output.prototype.toJSON;

Output.fromObject = function (data) {
  return new Output(data);
};

Output.prototype.setScriptFromBuffer = function (buff) {
  this._scriptBuffer = buff;
  try {
    this._script = Script.fromBuffer(this._scriptBuffer);
    this._script._isOutput = true;
  } catch (e) {
    if (e instanceof errors.Script.InvalidBuffer) {
      this._script = null;
    } else {
      throw e;
    }
  }
};

Output.prototype.setScript = function (script) {
  if (script instanceof Script) {
    this._scriptBuffer = script.toBuffer();
    this._script = script;
    this._script._isOutput = true;
  } else if (_.isString(script)) {
    this._script = Script.fromString(script);
    this._scriptBuffer = this._script.toBuffer();
    this._script._isOutput = true;
  } else if (bufferUtil.isBuffer(script)) {
    this.setScriptFromBuffer(script);
  } else {
    throw new TypeError('Invalid argument type: script');
  }
  return this;
};

Output.prototype.inspect = function () {
  let scriptStr;
  if (this.script) {
    scriptStr = this.script.inspect();
  } else {
    scriptStr = this._scriptBuffer.toString('hex');
  }
  return `<Output (${this.satoshis} sats) ${scriptStr}>`;
};

Output.fromBufferReader = function (br) {
  const obj = {};
  obj.satoshis = br.readUInt64LEBN();
  const size = br.readVarintNum();
  if (size !== 0) {
    obj.script = br.read(size);
  } else {
    obj.script = new buffer.Buffer([]);
  }
  return new Output(obj);
};

Output.prototype.toBufferWriter = function (writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  writer.writeUInt64LEBN(this._satoshisBN);
  const script = this._scriptBuffer;
  writer.writeVarintNum(script.length);
  writer.write(script);
  return writer;
};

module.exports = Output;
