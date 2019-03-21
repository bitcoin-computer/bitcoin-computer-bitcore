/**
 * @license
 * https://github.com/the-bitcoin-token/BitcoinSource
 * Copyright (c) 2018 Emilio Almansi
 * Copyright (c) 2018 Janez Urevc
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

const shell = require('shelljs'); // eslint-disable-line import/no-extraneous-dependencies

shell.config.fatal = true;
const { version } = require('../package.json');

shell.rm('-rf', 'dist');
shell.mkdir('-p', 'dist');

shell.exec('npx browserify src/index.js --s bch', { silent: true })
  .to(`dist/bitcoinsource-${version}.js`);
shell.echo(`Generated file: dist/bitcoinsource-${version}.js.`);

shell.cp('LICENSE.js', `dist/bitcoinsource-${version}.min.js`);
shell.exec(`cat dist/bitcoinsource-${version}.js | npx uglifyjs -c`, { silent: true })
  .toEnd(`dist/bitcoinsource-${version}.min.js`);
shell.echo(`Generated file: dist/bitcoinsource-${version}.min.js.`);
