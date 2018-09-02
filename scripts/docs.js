const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

function camelToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function docs() {
    const files = await readdir('./src');
    const rules = files
        .filter(x => x.endsWith('ts'))
        .filter(x => x !== 'index.ts')
        .map(x => x.replace('Rule.ts', ''))
        .map(camelToDash);
    console.log(rules);
}

docs();