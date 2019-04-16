const path = require("path");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const mkdir = promisify(require("fs").mkdir);
const writeFile = promisify(require("fs").writeFile);
const { render, renderREADME } = require("./render");

const cwd = path.join(".", "scripts");

async function docs() {
  const dir = path.resolve(cwd, path.join("..", "rules"));
  const files = await readdir(dir);
  const rules = files
    .filter(x => x.endsWith("js"))
    .filter(x => x !== "index.js")
    .map(async file => {
      const fileName = path.join(dir, file);
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
        return { ruleName: e.message };
      }
    });

  let metadata = await Promise.all(rules);
  metadata = [...metadata].sort((a, b) => a.ruleName - b.ruleName);

  await writeReadme(metadata);
}

async function writeReadme(rules) {
  const docsPath = path.resolve(cwd, path.join("..", "docs"));
  const readmePath = path.resolve(cwd, path.join("..", "README.md"));
  const readmeContent = renderREADME(rules);

  await mkdir(docsPath);
  rules.map(async metadata => {
    const fileName = `${metadata.ruleName}.md`;
    const content = await render(metadata);
    await writeFile(path.join(docsPath, fileName), content);
  });

  await writeFile(readmePath, readmeContent);
  return;
}

function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function fileToRuleName(str) {
  return camelToDash(str)
    .replace("-rule", "")
    .replace(".js", "");
}

docs();
