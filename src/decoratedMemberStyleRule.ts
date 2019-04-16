import * as ts from "typescript";
import * as Lint from "tslint";
import {
  isComponentClass,
  getIndentationAtNode,
  getFirstNonDecoratorToken
} from "./shared/utils";
import { codeExamples } from "./code-examples/decoratedMemberStyle.examples";

interface Options {
  properties: "singleline" | "multiline" | "ignore";
  methods: "singleline" | "multiline" | "ignore";
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "decorated-member-style",
    description: `Requires decorated class members to follow a consistent style (singleline or multiline)`,
    optionsDescription: Lint.Utils.dedent`
            One argument which is an object with the keys \`"properties"\` and \`"methods"\`. Both can be set to a string, which must be one of the following values:
            - \`"singleline"\`
            - \`"multiline"\`
            - \`"ignore"\`

            If either key is excluded, the default behavior (\`"ignore"\`) will be applied.

            A member is considered “multiline” if its declaration is on a line after the last decorator. If decorators are composed (multiple decorators for a single declaration), "multiline" requires each decorator to be on its own line.
        `,
    options: {
      type: "object",
      properties: {
        properties: {
          type: "string",
          enum: ["singleline", "multiline", "ignore"]
        },
        methods: {
          type: "string",
          enum: ["singleline", "multiline", "ignore"]
        }
      }
    },
    optionExamples: [
      Lint.Utils.dedent`
                {
                  "decorated-member-style": [
                    true, 
                      {
                        "methods": "multiline"
                      }
                  ]
                }
            `,
      Lint.Utils.dedent`
                {
                  "decorated-member-style": [
                    true, 
                      {
                        "properties": "singleline",
                        "methods": "multiline"
                      }
                  ]
                }
            `
    ],
    type: "style",
    typescriptOnly: true,
    hasFix: true,
    codeExamples
  };

  public static FAILURE_STRING_SINGLE =
    "Component %s decorators should be inlined";
  public static FAILURE_STRING_MULTI =
    "Component %s decorators should be multiline";
  public static FAILURE_STRING_MULTI_COMPOSITION =
    "Component %s decorators should each be on their own lines";

  public static DEFAULT_ARGUMENTS = {
    properties: "ignore",
    methods: "ignore"
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let args = this.getOptions().ruleArguments;
    if (args) args = args[0];
    const options: Options = Object.assign(
      {},
      Rule.DEFAULT_ARGUMENTS,
      args
    ) as Options;

    return this.applyWithWalker(
      new MethodDecoratorWalker(sourceFile, this.getOptions(), options)
    );
  }
}

// The walker takes care of all the work.
class MethodDecoratorWalker extends Lint.RuleWalker {
  constructor(
    sourceFile: ts.SourceFile,
    options: Lint.IOptions,
    private _options: Options
  ) {
    super(sourceFile, options);
  }

  getOptions(): Options {
    return this._options;
  }

  public visitMethodDeclaration(node: ts.MethodDeclaration) {
    const { methods: style } = this.getOptions();

    if (style === "ignore") return;

    if (
      style &&
      isComponentClass(node.parent) &&
      node.decorators &&
      Array.isArray(node.decorators)
    ) {
      if (style === "multiline" && node.decorators.length > 1) {
        const decoratorLines = node.decorators.map(
          dec => this.getLineAndCharacterOfPosition(dec.getEnd()).line
        );
        const { line: propertyLine } = this.getLineAndCharacterOfPosition(
          node.name.getEnd()
        );
        const allMultiline = decoratorLines.every((line, i) => {
          if (decoratorLines[i - 1] === undefined) return true;
          return line > decoratorLines[i - 1];
        });

        if (!allMultiline) {
          const fix = createFixMultilineDecorators(node, this.getSourceFile());
          return this.addFailureAtNode(
            node,
            Rule.FAILURE_STRING_MULTI_COMPOSITION.replace("%s", "method"),
            fix
          );
        }
        if (decoratorLines[decoratorLines.length - 1] === propertyLine) {
          const fix = createFixMultiline(node, this.getSourceFile());
          return this.addFailureAtNode(
            node,
            Rule.FAILURE_STRING_MULTI.replace("%s", "method"),
            fix
          );
        }
      } else {
        const dec: ts.Decorator = node.decorators[node.decorators.length - 1];

        const { line: decoratorLine } = this.getLineAndCharacterOfPosition(
          dec.getEnd()
        );
        const { line: propertyLine } = this.getLineAndCharacterOfPosition(
          node.name.getEnd()
        );

        if (style === "singleline") {
          if (decoratorLine !== propertyLine) {
            const fix = createFixSingleline(node, this.getSourceFile());
            return this.addFailureAtNode(
              node,
              Rule.FAILURE_STRING_SINGLE.replace("%s", "method"),
              fix
            );
          }
        } else if (style === "multiline") {
          const fix = createFixMultiline(node, this.getSourceFile());
          if (decoratorLine === propertyLine)
            return this.addFailureAtNode(
              node,
              Rule.FAILURE_STRING_MULTI.replace("%s", "method"),
              fix
            );
        }
      }
    }

    super.visitMethodDeclaration(node);
  }

  public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    const { properties: style } = this.getOptions();

    if (style === "ignore") return;

    if (
      style &&
      isComponentClass(node.parent) &&
      node.decorators &&
      Array.isArray(node.decorators)
    ) {
      const dec: ts.Decorator = node.decorators[node.decorators.length - 1];

      const { line: decoratorLine } = this.getLineAndCharacterOfPosition(
        dec.getEnd()
      );
      const { line: propertyLine } = this.getLineAndCharacterOfPosition(
        node.name.getEnd()
      );

      if (style === "singleline") {
        if (decoratorLine !== propertyLine) {
          const fix = createFixSingleline(node, this.getSourceFile());
          return this.addFailureAtNode(
            node,
            Rule.FAILURE_STRING_SINGLE.replace("%s", "property"),
            fix
          );
        }
      } else if (style === "multiline") {
        const fix = createFixMultiline(node, this.getSourceFile());
        if (decoratorLine === propertyLine)
          return this.addFailureAtNode(
            node,
            Rule.FAILURE_STRING_MULTI.replace("%s", "property"),
            fix
          );
      }
    }

    super.visitPropertyDeclaration(node);
  }
}

function createFixSingleline(
  node: ts.Node,
  sourceFile: ts.SourceFile
): Lint.Replacement[] {
  const dec: ts.Decorator = node.decorators![node.decorators!.length - 1];
  let token = getFirstNonDecoratorToken(node);
  let fix: Lint.Replacement[] = [];

  if (token) {
    const decEnd = dec.getEnd();
    const tokenStart = token.getStart(sourceFile);
    fix.push(Lint.Replacement.replaceFromTo(decEnd, tokenStart, " "));
  }

  return fix;
}

function createFixMultiline(
  node: ts.Node,
  sourceFile: ts.SourceFile
): Lint.Replacement[] {
  const dec: ts.Decorator = node.decorators![node.decorators!.length - 1];
  const indent = getIndentationAtNode(node, sourceFile);
  let token = getFirstNonDecoratorToken(node);
  let fix: Lint.Replacement[] = [];

  if (token) {
    const decStart = dec.getFullStart();
    const tokenStart = token.getStart(sourceFile);
    fix.push(
      Lint.Replacement.replaceFromTo(
        decStart,
        tokenStart,
        dec.getFullText(sourceFile).trimRight()
      )
    );
    fix.push(Lint.Replacement.appendText(tokenStart, `\n${indent}`));
  }

  return fix;
}

function createFixMultilineDecorators(
  node: ts.Node,
  sourceFile: ts.SourceFile
): Lint.Replacement[] {
  const decFirst: ts.Decorator = node.decorators![0];
  const indent = getIndentationAtNode(node, sourceFile);
  let token = getFirstNonDecoratorToken(node);
  let fix: Lint.Replacement[] = [];

  if (token) {
    const decEnd = decFirst.getEnd();
    const tokenStart = token.getStart(sourceFile);

    fix.push(
      Lint.Replacement.replaceFromTo(
        decEnd,
        tokenStart,
        `\n${indent}` +
          node
            .decorators!.slice(1)
            .map(dec => {
              return dec.getFullText(sourceFile).trim();
            })
            .join(`\n${indent}`)
      )
    );
    fix.push(Lint.Replacement.appendText(tokenStart, `\n${indent}`));
  }

  return fix;
}
