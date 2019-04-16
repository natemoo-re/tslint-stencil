const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

async function run(command) {
  const result = await exec(command);

  if (!!result.code) {
    return Promise.reject(result.stdout);
  }

  return Promise.resolve(result.stdout);
}

exports.run = run;
