const { run } = require('./shared/run');
const { evalText } = require('./shared/eval-text');
const { dim, yellow, green, cyan } = require('colorette');
const semver = require('semver');
const prompt = require('prompts');

async function version() {
    const current = evalText(await run('npm version'))['tslint-stencil'];
    const preids = ['alpha', 'beta', 'rc'];
    const pre = semver.parse(current).prerelease;
    const bumped = {
        patch: semver.inc(current, 'patch'),
        minor: semver.inc(current, 'minor'),
        major: semver.inc(current, 'major')
    }

    let response;
    if (pre && pre[0]) {
        response = await prompt({
            type: 'select',
            name: 'type',
            message: 'Select a version',
            choices: [
                { title: 'Prerelease', value: 'prerelease' },
                { title: `Release ${dim(bumped.patch)}`, value: 'patch' }
            ],
            initial: 0
        })
    } else {
        response = await prompt({
                type: 'select',
                name: 'type',
                message: 'Select a version',
                choices: [
                    { title: 'Prerelease', value: 'prerelease' },
                    { title: `Patch ${dim(bumped.patch)}`, value: 'patch' },
                    { title: `Minor ${dim(bumped.minor)}`, value: 'minor' },
                    { title: `Major ${dim(bumped.major)}`, value: 'major' }
                ],
                initial: 0
        })
    }
    if (!response) process.exit(0);
    const { type } = response;

    if (type === 'prerelease') {
        const next = preids[preids.findIndex((x) => x === pre[0]) + 1];

        if (pre.length) {
            if (!next) return Promise.resolve(semver.inc(current, 'prerelease', false, pre[0]));
            
            const { increment } = await prompt({
                type: 'toggle',
                name: 'increment',
                message: `Select a prerelease version`,
                initial: false,
                inactive: `${pre[0]}.${pre[1] + 1}`,
                active: `${next}.0`
            });

            return increment
                ? Promise.resolve(semver.inc(current, 'prerelease', false, next))
                : Promise.resolve(semver.inc(current, 'prerelease', false, pre[0]))
            
        } else {
            const prereleaseId = preids[0];
            const { prereleaseType } = await prompt({
                    type: 'select',
                    name: 'prereleaseType',
                    message: 'Select a prerelease version',
                    choices: [
                        // { title: `Prerelease ${dim(current + '-' + prereleaseId + '.0')}`, value: 'prerelease' },
                        { title: `Patch ${dim(bumped.patch + '-' + prereleaseId + '.0')}`, value: 'prepatch' },
                        { title: `Minor ${dim(bumped.minor + '-' + prereleaseId + '.0')}`, value: 'preminor' },
                        { title: `Major ${dim(bumped.major + '-' + prereleaseId + '.0')}`, value: 'premajor' }
                    ],
                    initial: 0
            })
            return Promise.resolve(semver.inc(current, prereleaseType, false, prereleaseId));
        }
    }

    if (type === 'patch' || !pre[0]) {
        const next = preids.slice(preids.findIndex((x) => x === pre[0]) + 1);
        if (!next.length) return Promise.resolve(undefined);

        console.log(`
${yellow('▲')} Warning! Updating from ${green(current)} to ${green(bumped[type])} skips ${next.map(cyan).join(', ')} prerelease${next.length > 1 ? 's' : ''}`);
        const { skip } = await prompt({
            type: 'toggle',
            name: 'skip',
            message: 'Do you wish to proceed?',
            initial: false,
            active: 'yes',
            inactive: 'no'
        })

        if (skip) {
            return Promise.resolve(bumped.patch);
        } else {
            return Promise.resolve(undefined);
        }
    }
}

exports.version = version;