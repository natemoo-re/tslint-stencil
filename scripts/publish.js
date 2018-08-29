const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const args = process.argv.slice(2);
const semverType = args[0];

const prerelease = args.indexOf('--pre') >= 0;
const prereleaseType = prerelease ? args[args.indexOf('--pre') + 1] : null;


console.log(semverType);

if (!semverType || !semverType.match(/^(major|minor|patch)$/)) {
    console.log(`Usage: major|minor|patch`);
    process.exit(1);
}
if (prerelease && !prereleaseType.match(/^(alpha|beta|rc)$/)) {
    console.log(`Usage: major|minor|patch --pre [alpha|beta|rc]`);
    process.exit(1);
} 


async function run(command) {
    const result = await exec(command);
    
    console.log(result.stdout);
    
    if (!!result.code) {
        console.log(result.stdout);
        process.exit(1);
    }
}

async function main() {
    const version = prerelease ? `pre${semverType} --preid=${prereleaseType}` : semverType;
    await run(`npm run verify`);
    console.log(version)
    // await run(`npm version ${version}`);
    // await run(`git push`);
    // await run(`git push --tags`);
    // await run(`npm publish`);
}

main();