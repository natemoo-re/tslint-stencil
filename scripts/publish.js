const { Spinner } = require('cli-spinner');
const { run } = require('./shared/run');
const { verify } = require('./verify');
const { version } = require('./version');
const { red, green, bold } = require('colorette');

const loading = new Spinner();
loading.setSpinnerString(18);
loading.setSpinnerTitle('Running tests');

let pendingVerify = true;

async function handleVerify({ success, output }) {
    loading.stop(true);

    if (success) {
        console.log(`${green('✔')} ${bold('All tests passed')}\n`);
        console.log(output);
    } else {
        console.log(`${red('✖')} ${bold('Tests failed')}\n`);
        console.log(output);
    }
    console.log();

    return (success) ? Promise.resolve() : Promise.reject();
}

async function postVerify() {
    loading.setSpinnerTitle('Pushing to Git');
    loading.start();
    await run(`git push`);
    await run(`git push --tags`);
    loading.stop(true);
    console.log(`${green('✔')} ${bold('Pushed to Git')}\n`);

    loading.setSpinnerTitle('Publishing to NPM');
    loading.start();
    await run(`npm publish`);
    loading.stop(true);
    console.log(`${green('✔')} ${bold('Published to NPM')}\n`);

    console.log();
}

async function main() {
    const verified = verify()
        .then(args => {
            pendingVerify = false;
            return args;
        })
    
    const v = await version();
    if (!v) process.exit(0);
    await run(`npm version ${v}`);
    console.log();

    verified.then((result) => handleVerify(result))
        .then(() => postVerify())
        .catch(() => process.exit());
    if (pendingVerify) loading.start();
}

main();