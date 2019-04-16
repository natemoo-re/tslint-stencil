const { README } = require("./README");

// https://github.com/palantir/tslint/blob/0437cd9fc85d65f53dbecf0decdfb137171811b5/src/utils.ts#L66
function dedent(strings, ...values) {
  let fullString = strings.reduce(
    (accumulator, str, i) => `${accumulator}${values[i - 1]}${str}`
  );

  // match all leading spaces/tabs at the start of each line
  const match = fullString.match(/^[ \t]*(?=\S)/gm);
  if (match === null) {
    // e.g. if the string is empty or all whitespace.
    return fullString;
  }

  // find the smallest indent, we don't want to remove all leading whitespace
  const indent = Math.min(...match.map(el => el.length));
  const regexp = new RegExp(`^[ \\t]{${indent}}`, "gm");
  fullString = indent > 0 ? fullString.replace(regexp, "") : fullString;
  return fullString;
}

function renderDescription(metadata) {
  const details = metadata.descriptionDetails
    ? `\n${metadata.descriptionDetails}`
    : "";
  return metadata.description ? `${metadata.description}${details}` : false;
}

function renderNotes(metadata) {
  const notes = [];
  // Stencil is always written in Typescript
  // So let's ignore this... (just know it's there)
  // if (metadata.typescriptOnly) notes.push(`📄 TS Only`);
  if (metadata.hasFix) notes.push("**`🛠 Has Fixer`**");
  if (metadata.requiresTypeInfo) notes.push("**`ℹ️ Requires Type Info`**");

  return notes.length ? notes.join(" | ") : false;
}

function renderRationale(metadata) {
  return metadata.rationale
    ? `## Rationale
${metadata.rationale}`
    : false;
}

function renderConfig(metadata) {
  const config = [
    "## Config",
    metadata.optionsDescription
      ? metadata.optionsDescription
      : "Not configurable.",
    "",
    "### Config examples",
    [...(metadata.optionExamples || [`{ "${metadata.ruleName}": true }`])]
      .map(x => "```ts\n" + x.trim() + "\n```")
      .join("\n")
  ].join("\n");

  return config;
}

function renderSchema(metadata) {
  const schema = [
    "## Schema",
    metadata.optionsDescription
      ? "```ts\n" + JSON.stringify(metadata.options, null, 2) + "\n```"
      : "```ts\nnull\n```"
  ].join("\n");

  return schema;
}

function renderCodeExample(title, example, padding = 4) {
  const pad = " ".repeat(padding);
  if (example) {
    return [
      pad,
      `${pad}**${title}**`,
      `${pad}\`\`\`ts\n${example
        .trim()
        .split("\n")
        .map(x => pad + x)
        .join("\n")}\n${pad}\`\`\``
    ].join("\n");
  } else {
    return "";
  }
}

function renderCodeExamples(metadata) {
  const codeExamples = metadata.codeExamples || [];
  const examples = [
    "## Code Examples",
    codeExamples
      .map(example => {
        return [
          `- ${example.description}`,
          renderCodeExample("⚙️ Config", example.config),
          renderCodeExample("✅ Pass", example.pass),
          renderCodeExample("🚫 Fail", example.fail)
        ].join("\n");
      })
      .join("\n")
  ].join("\n");

  return codeExamples.length ? examples : false;
}

exports.render = function(metadata) {
  return [
    `# \`${metadata.ruleName}\``,
    renderDescription(metadata),
    renderNotes(metadata),
    renderRationale(metadata),
    renderConfig(metadata),
    renderSchema(metadata),
    renderCodeExamples(metadata)
  ]
    .filter(x => x)
    .map(x => `\n${x}`)
    .join("\n");

  // const readme = README.replace('%docs%', docs.join('\n'));
  // return readme;
};

exports.renderREADME = function(rules) {
  const docs = rules.map(metadata => {
    return [
      "",
      `### [\`${metadata.ruleName}\`](docs/${metadata.ruleName}.md)`,
      metadata.description
    ].join("\n");
  });

  const readme = README.replace("%docs%", docs.join("\n"));
  return readme;
};
