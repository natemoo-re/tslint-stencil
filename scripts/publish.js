const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const cmdArguments = process.argv.slice(2);
const semverType = cmdArguments[0];

if (!semverType || !semverType.match(/^(major | minor | patch | premajor | preminor | prepatch | prerelease)$/)) {
    console.log(`Usage: major|minor|patch`);
    process.exit(1);
}

run(`npm run verify`);
run(`npm version ${semverType}`);
run(`git push`);
run(`git push --tags`);
run(`npm publish`);

async function run(command) {
    const result = await exec(command);

    if (!!result.code) {
        console.log(result.stdout);
        process.exit(1);
    }
}