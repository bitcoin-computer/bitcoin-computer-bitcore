

const _ = require('lodash');
const errors = require('../errors');

module.exports = {
  checkState(condition, message) {
    if (!condition) {
      throw new errors.InvalidState(message);
    }
  },
  checkArgument(condition, argumentName, message, docsPath) {
    if (!condition) {
      throw new errors.InvalidArgument(argumentName, message, docsPath);
    }
  },
  checkArgumentType(argument, type, argumentName) {
    argumentName = argumentName || '(unknown name)';
    if (_.isString(type)) {
      if (type === 'Buffer') {
        const buffer = require('buffer'); // './buffer' fails on cordova & RN
        if (!buffer.Buffer.isBuffer(argument)) {
          throw new errors.InvalidArgumentType(argument, type, argumentName);
        }
      } else if (typeof argument !== type) {
        throw new errors.InvalidArgumentType(argument, type, argumentName);
      }
    } else if (!(argument instanceof type)) {
      throw new errors.InvalidArgumentType(argument, type.name, argumentName);
    }
  },
};
