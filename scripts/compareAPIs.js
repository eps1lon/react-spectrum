
let fs = require('fs-extra');
let fg = require('fast-glob');
let path = require('path');
let changesets = require('json-diff-ts');
let util = require('util');
let {walkObject} = require('walk-object');
let chalk = require('chalk');

compare().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

async function compare() {
  let branchDir = path.join(__dirname, '..', 'dist', 'branch-api');
  let publishedDir = path.join(__dirname, '..', 'dist', 'published-api');
  if (!(fs.existsSync(branchDir) && fs.existsSync(publishedDir))) {
    console.log('one of the api directories does not exist');
    return;
  }
  let summaryMessages = [];
  // don't worry about private packages, they don't make it through the build
  let branchAPIs = fg.sync(`${branchDir}/**/api.json`);
  let publishedAPIs = fg.sync(`${publishedDir}/**/api.json`);
  let pairs = [];
  for (let pubApi of publishedAPIs) {
    let pubApiPath = pubApi.split(path.sep);
    let sharedPath = path.join(...pubApiPath.slice(pubApiPath.length - 4));
    let matchingBranchFile;
    for (let branchApi of branchAPIs) {
      if (branchApi.includes(sharedPath)) {
        matchingBranchFile = branchApi;
        pairs.push({pubApi, branchApi});
        break;
      }
    }
    if (!matchingBranchFile) {
      summaryMessages.push({msg: `removed module ${pubApi}`, severity: 'error'});
    }
  }
  for (let branchApi of branchAPIs) {
    let branchApiPath = branchApi.split(path.sep);
    let sharedPath = path.join(...branchApiPath.slice(branchApiPath.length - 4));
    let matchingPubFile;
    for (let pubApi of publishedAPIs) {
      if (pubApi.includes(sharedPath)) {
        matchingPubFile = pubApi;
        // don't re-add to pairs
        break;
      }
    }
    if (!matchingPubFile) {
      summaryMessages.push({msg: `added module ${branchApi}`, severity: 'warn'});
    }
  }

  let count = 0;
  for (let pair of pairs) {
    console.log(`comparing ${pair.branchApi.replace(/.*branch-api/, '')}`);
    let publishedApi = fs.readJsonSync(pair.pubApi);
    delete publishedApi.links;
    walkObject(publishedApi, ({value, location, isLeaf}) => {
      if (!isLeaf && value.id && typeof value.id === 'string') {
        value.id = value.id.replace(/.*(node_modules|packages)/, '');
      }
    });
    let branchApi = fs.readJsonSync(pair.branchApi);
    delete branchApi.links;
    walkObject(branchApi, ({value, location, isLeaf}) => {
      if (!isLeaf && value.id && typeof value.id === 'string') {
        value.id = value.id.replace(/.*(node_modules|packages)/, '');
      }
    });
    let diff = changesets.diff(publishedApi, branchApi);
    if (diff.length > 0) {
      count += 1;
      console.log(util.inspect(diff, {depth: null}));
    }

    let publishedExports = publishedApi.exports;
    let branchExports = branchApi.exports;
    let addedExports = Object.keys(branchExports).filter(key => !publishedExports[key]);
    let removedExports = Object.keys(publishedExports).filter(key => !branchExports[key]);
    if (addedExports.length > 0) {
      summaryMessages.push({msg: `added exports ${addedExports} to ${pair.branchApi}`, severity: 'warn'});
    }
    if (removedExports.length > 0) {
      summaryMessages.push({msg: `removed exports ${removedExports} from ${pair.branchApi}`, severity: 'error'});
    }
  }
  summaryMessages.forEach(({msg, severity}) => {
    console[severity](chalk[severity === 'warn' ? 'yellow' : 'red'](msg));
  });
  let modulesAdded = branchAPIs.length - publishedAPIs.length;
  if (modulesAdded !== 0) {
    console.log(chalk[modulesAdded > 0 ? 'yellow' : 'red'](`${Math.abs(modulesAdded)} modules ${modulesAdded > 0 ? 'added' : 'removed'}`));
  } else {
    console.log(chalk.green('no modules removed or added'));
  }
  if (count !== 0) {
    console.log(chalk.yellow(`${count} modules had changes to their API`));
  } else {
    console.log(chalk.green('no modules changed their API'));
  }
}

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    let child = spawn(cmd, args, opts);
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error('Child process failed'));
        return;
      }

      resolve();
    });
  });
}
