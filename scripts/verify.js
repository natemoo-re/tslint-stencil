const { run } = require("./shared/run");
const { dim, green, red, underline } = require("colorette");

async function verify() {
  try {
    const result = await run(`npm run verify`);

    const output = result
      .split("> tslint --test test/rules/**/*")[1]
      .trim()
      .replace(/Passed/g, green("Passed"));

    return Promise.resolve({ success: true, output });
  } catch (e) {
    const output = e.stdout
      .split("> tslint --test test/rules/**/*")[1]
      .trim()
      .replace(/Passed/g, green("Passed"))
      .replace(/Failed!/g, red("Failed!"))
      .split("\n")
      .map(ln => {
        if (ln === "Expected (from .lint file)") return red(ln);
        if (ln === "Actual (from TSLint)") return green(ln);
        if (ln.startsWith("+")) return green(ln);
        if (ln.startsWith("-")) return red(ln);

        if (ln.startsWith("test/rules")) return ln;
        return dim(ln);
      })
      .join("\n");
    return Promise.resolve({ success: false, output });
  }
}

exports.verify = verify;
