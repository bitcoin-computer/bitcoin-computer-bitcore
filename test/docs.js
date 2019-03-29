import bch from '..'

const fs = require('fs')

describe('Documentation', function() {
  it('major and minor versions should match', function() {
    const versionRE = /v[0-9]+\.[0-9]+/
    const docIndex = fs.readFileSync('./docs/index.md', 'ascii')
    const docVersion = docIndex.match(versionRE)[0]
    bch.version.indexOf(docVersion).should.equal(0)
  })
})
