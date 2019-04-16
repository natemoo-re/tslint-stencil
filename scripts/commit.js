const prompt = require("prompts");
const { run } = require("./shared/run");
const { dim } = require("colorette");

async function commit() {
  const TYPES = new Map([
    ["feat", "A new feature"],
    ["fix", "A bug fix"],
    ["docs", "Documentation only changes"],
    [
      "style",
      "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)"
    ],
    ["refactor", "A code change that neither fixes a bug nor adds a feature"],
    ["perf", "A code change that improves performance"],
    ["test", "Adding missing tests"],
    [
      "chore",
      "Changes to the build process or auxiliary tools and libraries such as documentation generation"
    ]
  ]);

  const typeChoices = [];
  for (let [key, doc] of TYPES.entries()) {
    typeChoices.push({
      title: `${key} ${dim(doc)}`,
      value: key
    });
  }

  // const scopeChoices = Array.from(new Set(SCOPES)).map(scope => ({ title: scope, value: scope }));

  const { type, scope, subject } = await prompt([
    {
      type: "select",
      name: "type",
      message: "Select commit type",
      choices: typeChoices,
      initial: 0
    },
    {
      type: "text",
      name: "scope",
      message: "Describe commit scope"
    },
    {
      type: "text",
      name: "subject",
      message: "Describe commit subject",
      validate: value => {
        if (!value) return `Please enter a commit message`;
        return value.length > 50
          ? `Message must be shorter than 50 characters`
          : true;
      }
    }
  ]);

  if (!type || !subject) {
    process.exit(0);
  }

  const message = `${type}(${scope}): ${subject}`;
  return run(`git commit -m "${message}"`);
}

commit();
