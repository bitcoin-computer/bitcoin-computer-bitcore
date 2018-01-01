/**
 * @file gulpfile.js
 *
 * Defines tasks that can be run on gulp.
 *
 * Summary:
 * <ul>
 *   <li> `test` - an alias for `test:mocha`
 *   <li> `test:mocha` - runs all the tests on node (mocha)
 *   <li> `test:karma` - runs all the tests in the browser (karma)
 *   <li> `build` - generate files needed for browser (browserify)
 *   <li> `build:tests` - generate files needed for testing in the browser
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
  shell.task([[
    'npx browserify index.js --s bitcoinCash -t [ babelify --presets [ env ] ]', '|',
    `npx uglifyjs --comments -c -o dist/bitcoincashjs.${npmPackage.version}.min.js`,
  ].join(' ')])
);

gulp.task(
  'build:tests',
  shell.task([
    'find test/ -type f -name "*.js" | xargs npx browserify -t brfs -o build/tests.js'
  ])
);

gulp.task(
  'test',
  ['test:mocha']
);

gulp.task(
  'test:mocha',
  shell.task([
    'npx nyc --reporter=html --reporter=text npx mocha',
  ])
);

gulp.task(
  'test:karma',
  ['build:tests'],
  shell.task([
    'npx karma start',
  ])
);

gulp.task(
  'lint',
  shell.task([
    'find index.js gulpfile.js src/ test/ -type f -name "*.js" | xargs npx jshint',
  ])
);

gulp.task(
  'coveralls',
  shell.task([
    'npx nyc report --reporter=text-lcov | npx coveralls',
  ])
);
