/**
 * @license
 * https://github.com/bitcoincashjs/bitcoincashjs
 * Copyright (c) 2018 Emilio Almansi
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

var shell = require('shelljs')
shell.config.fatal = false

shell.exec('find src/ test/ scripts/ -type f -name "*.js"', { silent: true })
  .exec('xargs npx jshint')
