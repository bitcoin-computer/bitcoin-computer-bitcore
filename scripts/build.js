/**
 * @license
 * https://github.com/bitcoincashjs/bitcoincashjs
 * Copyright (c) 2018 Emilio Almansi
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

var shell = require('shelljs')
shell.config.fatal = true
var version = require('../package.json').version

shell.rm('-rf', 'dist')
shell.mkdir('-p', 'dist')

shell.exec('npx browserify src/bitcoincash.js --s bch', { silent: true })
  .to('dist/bitcoincash-' + version + '.js')
shell.echo('Generated file: dist/bitcoincash-' + version + '.js.')

shell.cp('LICENSE.js', 'dist/bitcoincash-' + version + '.min.js')
shell.exec('cat dist/bitcoincash-' + version + '.js | npx uglifyjs -c', { silent: true })
  .toEnd('dist/bitcoincash-' + version + '.min.js')
shell.echo('Generated file: dist/bitcoincash-' + version + '.min.js.')
