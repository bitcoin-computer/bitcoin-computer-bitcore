Contributing to BitcoinCash.js
==============================

We're working hard to make *BitcoinCashFlow* the most powerful JavaScript library for working with Bitcoin Cash. Our goal is to have *BitcoinCashFlow* be a library that can be used by anyone interested in Bitcoin Cash.

## Quick Checklist

Ideally, please make sure to run the following commands before pushing the code:

* `npm run` runs all the tests.
* `npm run lint` checks the code for the linting errors.

## Design Guidelines

BitcoinCashFlow adopted the [AirBnb JavaScript style guide](https://github.com/airbnb/javascript). We encourage our contributors to review it and follow its recommendations when writing the code. 

### Tests

Write a test for all your code. We encourage Test Driven Development so we know when our code is right. The test coverage is around 95% and are targeting 100% as we move towards our 1.0 release.

#### Tests Must be Written Elegantly

Style guidelines are not relaxed for tests. Tests are a good way to show how to use the library, and maintaining them is extremely necessary.

Don't write long tests, write helper functions to make them be as short and concise as possible (they should take just a few lines each), and use good variable names.

#### Tests Must not be Random

Inputs for tests should not be generated randomly. Also, the type and structure of outputs should be checked.

#### Require 'bitcoincashflow' and Look up Classes from There

This helps to make tests more useful as examples, and more independent of where they are placed. This also helps prevent forgetting to include all sub-modules in the bitcoincashflow object.

DO:
```javascript
var bitcoincashflow = require('../');
var PublicKey = bitcoincashflow.PublicKey;
```
DON'T:
```javascript
var PublicKey = require('../src/publickey');
```

#### Data for Tests Included in a JSON File

If possible, data for tests should be included in a JSON file in the `test/data` directory. This improves interoperability with other libraries and keeps tests cleaner.

### Documentation

#### Guide and API Reference

All modules should include a developer guide and API reference. The API reference documentation is generated using JSDOC. Each function that exposes a public API should include a description, @return and @param, as appropriate. The general documentation guide for the module should be located in the `docs/guide` directory and is written in GitHub Flavored Markdown.

#### Proofread

Please proofread documentation to avoid unintentional spelling and grammatical mistakes before submitting a pull request.

## Pull Request Workflow

Our workflow is based on GitHub's pull requests. Before contributing fork the main repository into your personal namespace by clicking the "Fork" button on the project page.

After forking clone the forked repository (replace `[personal_namespace_prefix]` with the namespace prefix (your GitHub username in most cases):
```sh
git clone git@github.com:[personal_namespace_prefix]/BitcoinCashFlow.git
cd BitcoinCashFlow
```

Now you can add main repository as a second remote:
```sh
git remote add upstream git@github.com:BitcoinDB/BitcoinCashFlow.git
cd BitcoinCashFlow
```

Before creating new branches it is recommended to update your local master branch with the latest changes:
```sh
git checkout master
git pull upstream master
```

We use feature branches, prefixed with: `test`, `feature`, `fix`, `refactor`, or `remove` according to the change the branch introduces:
```sh
git checkout -b test/some-module
git checkout -b feature/some-new-stuff
git checkout -b fix/some-bug
git checkout -b remove/some-file
```

We expect pull requests to be rebased to the master branch before merging:
```sh
git pull --rebase upstream master
```

We require feature branches to be rebased instead of merging the upstream changes into it. This significantly improves the commit history readability. 

We also require meaningful commit messages. Consider [squashing minor changes into a single commit](https://stackoverflow.com/questions/5189560/squash-my-last-x-commits-together-using-git) and [rewording commit messages](https://help.github.com/articles/changing-a-commit-message/) as needed.

After that, you can push the changes to your fork, by doing:
```sh
git push origin your_branch_name
git push origin feature/some-new-stuff
git push origin fix/some-bug
```

Finally go to [github.com/BitcoinDB/BitcoinCashFlow](https://github.com/BitcoinDB/BitcoinCashFlow) in your web browser and issue a new pull request.

Maintainers and other contributors will review your code and possibly ask for changes before your code is pulled in to the main repository.  We'll check that all tests pass, review the coding style, and check for general code correctness. If everything is OK, we'll merge your pull request and your code will be part of BitcoinCashFlow.

If you have any questions feel free to post them to
[github.com/BitcoinDB/BitcoinCashFlow/issues](https://github.com/BitcoinDB/BitcoinCashFlow/issues).

Thanks for your time and code!
