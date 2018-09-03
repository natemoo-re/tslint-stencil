const path = require('path');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const writeFile = promisify(require('fs').writeFile);
const { README } = require('./README');

// https://github.com/palantir/tslint/blob/0437cd9fc85d65f53dbecf0decdfb137171811b5/src/utils.ts#L66
function dedent(strings, ...values) {
    let fullString = strings.reduce(
        (accumulator, str, i) => `${accumulator}${values[i - 1]}${str}`);

    // match all leading spaces/tabs at the start of each line
    const match = fullString.match(/^[ \t]*(?=\S)/gm);
    if (match === null) {
        // e.g. if the string is empty or all whitespace.
        return fullString;
    }

    // find the smallest indent, we don't want to remove all leading whitespace
    const indent = Math.min(...match.map((el) => el.length));
    const regexp = new RegExp(`^[ \\t]{${indent}}`, "gm");
    fullString = indent > 0 ? fullString.replace(regexp, "") : fullString;
    return fullString;
}

function camelToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function fileToRuleName(str) {
    return camelToDash(str).replace('-rule', '').replace('.js', '');
}

function metaDocs(metadata) {
    return dedent`
    
    ### \`${metadata.ruleName}\`
    ${metadata.description ? metadata.description : ''}
    
    `.trim()
}

async function docs() {
    const cwd = path.join('.', 'scripts');
    const dir = path.resolve(cwd, path.join('..', 'rules'));
    const files = await readdir(dir);
    const rules = files
        .filter(x => x.endsWith('js'))
        .filter(x => x !== 'index.js')
        .map(async (file) => {
            const fileName = path.join(dir, file)
            try {
                const { Rule } = require(fileName);
                if (Rule) {
                    const { metadata } = Rule;
                    if (metadata) return metadata;

                    throw new Error(fileToRuleName(file));
                } else {
                    throw new Error(fileToRuleName(file));
                }
            } catch (e) {
                return { ruleName: e.message }
            }
            // const metaDeclaration = Rule.members.find(x => (x.name && ts.isIdentifier(x.name) && x.name.text === 'metadata'));
            // let metadata = null;
            // if (metaDeclaration) {
            // metadata = evalText(metaDeclaration.initializer.getText(sourceFile));
            // }
        });

    let metadata = await Promise.all(rules);
    metadata = [...metadata].sort((a, b) => a.ruleName - b.ruleName);

    const readme = README.replace('%docs%', metadata.map(metaDocs).map(x => `\n${x}`).join('\n'));
    writeFile(path.resolve(cwd, path.join('..', 'README.md')), readme);
}

docs();