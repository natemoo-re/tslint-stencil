const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const cmdArguments = process.argv.slice(2);
const semverType = cmdArguments[0];

console.log(semverType);

if (!semverType || !semverType.match(/^(major|minor|patch|premajor|preminor|prepatch|prerelease)$/)) {
    console.log(`Usage: major|minor|patch|premajor|preminor|prepatch|prerelease`);
    process.exit(1);
}


async function run(command) {
    const result = await exec(command);
    
    if (!!result.code) {
        console.log(result.stdout);
        process.exit(1);
    }
}

async function main() {
    await run(`npm run verify`);
    await run(`npm version ${semverType}`);
    await run(`git push`);
    await run(`git push --tags`);
    await run(`npm publish`);
}

main();