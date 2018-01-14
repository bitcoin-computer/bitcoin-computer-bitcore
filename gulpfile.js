/**
 * @file gulpfile.js
 *
 * Defines tasks that can be run on gulp.
 *
 * Summary:
 * <ul>
 *   <li> `test` - an alias for `test:node`
 *   <li> `test:node` - runs all the tests on node (mocha)
 *   <li> `test:browser` - runs all the tests in the browser (karma)
 *   <li> `build` - generate files needed for browser (browserify)
 *   <li> `build:test` - generate files needed for testing in the browser
 *   <li> `lint` - run `jshint`
 *   <li> `coveralls` - updates coveralls info
 * </ul>
 */

'use strict';

const gulp = require('gulp');
const shell = require('gulp-shell');
const npmPackage = require('./package.json');

gulp.task(
  'build',
  ['build:node', 'build:browser']
);

gulp.task(
  'build:node',
  shell.task([[
    'rm -rf lib', '&&',
    'mkdir -p lib', '&&',
    'npx babel-cli src --out-dir lib',
  ].join(' ')])
);

gulp.task(
  'build:browser',
  ['build:node'],
  shell.task([[
    'rm -rf dist', '&&',
    'mkdir -p dist', '&&',
    'npx browserify lib/bitcoincash.js --s bch', '|',
    `npx minify --out-file dist/bitcoincashjs.${npmPackage.version}.min.js`,
  ].join(' ')])
);

gulp.task(
  'build:test',
  ['build:node'],
  shell.task([[
    'rm -rf build', '&&',
    'mkdir -p build', '&&',
    'find test/ -type f -name "*.js" | xargs npx browserify -t brfs -o build/tests.js'
  ].join(' ')])
);

gulp.task(
  'test',
  ['test:node']
);

gulp.task(
  'test:all',
  ['test:node', 'test:browser']
);

gulp.task(
  'test:node',
  ['build:node'],
  shell.task([
    `npx nyc --reporter=html --reporter=text npx mocha ${getTaskArgs()}`,
  ])
);

gulp.task(
  'test:browser',
  ['build:test'],
  shell.task([
    'npx karma start',
  ])
);

gulp.task(
  'lint',
  shell.task([
    'find gulpfile.js src/ test/ -type f -name "*.js" | xargs npx jshint',
  ])
);

gulp.task(
  'coveralls',
  shell.task([
    'npx nyc report --reporter=text-lcov | npx coveralls',
  ])
);

gulp.task(
  'version',
  ['build'],
  shell.task([[
    'npx mustache package.json README.tpl.md > README.md', '&&',
    'git add -A dist README.md',
  ].join(' ')])
);

gulp.task(
  'postversion',
  shell.task([[
    'git push', '&&',
    'git push --tags', '&&',
    'npm publish',
  ].join(' ')])
);

function getTaskArgs() {
  if (process.argv.length < 4) {
    return '';
  }
  const args = process.argv.splice(3);
  const argsWithQuotes = args.map(a => a.indexOf(' ') !== -1 ? `"${a}"` : a);
  return argsWithQuotes.join(' ');
}

