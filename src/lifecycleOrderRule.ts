import * as ts from "typescript";
import * as Lint from "tslint";
import { codeExamples } from "./code-examples/lifecycleSort.example";
import { isComponentClass } from "./shared/utils";
import { LIFECYCLE_METHODS } from "./shared/constants";

type Options = "call-order" | "alphabetical";

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "lifecycle-order",
    description:
      "Ensures that Component lifecycle methods are ordered consistently",
    optionsDescription: Lint.Utils.dedent`
            This rule optionally accepts a single argument, which is a string. It should be one of the following values:
            - \`call-order\`
            - \`alphabetical\`

            If no argument is provided, this rule will enforce the default functionality (which matches that of \`call-order\`.)
        `,
    options: {
      type: "array",
      items: {
        type: "string",
        enum: ["alphabetical", "call-order"]
      },
      minLength: 0,
      maxLength: 2
    },
    optionExamples: [
      `{ "lifecycle-sort": [true, "call-order"] }`,
      `{ "lifecycle-sort": [true, "alphabetical"] }`
    ],
    rationale: Lint.Utils.dedent`
            A consistent ordering for Component lifecycle methods can make Components easier to read, navigate, and edit.
            
            Ordering lifecycle methods by their natural call order (\`call-order\`) makes the functionality of each self-documenting.
        `,
    type: "style",
    typescriptOnly: true,
    codeExamples
  };
  public static FAILURE_STRING_CALL_ORDER =
    "Component lifecycle methods should be ordered according to their call order";
  public static FAILURE_STRING_ALPHABETICAL =
    "Component lifecycle methods should be ordered alphabetically";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let args = this.getOptions().ruleArguments[0];
    if (args) args = args.trim();
    let options: Options;

    if (args && args.match(/^(call-order|alphabetical)$/)) {
      options = args;
    } else {
      options = "call-order";
    }

    return this.applyWithFunction(sourceFile, walk, options);
  }
}

function walk(ctx: Lint.WalkContext<Options>) {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    if (!ts.isClassDeclaration(node)) return;
    if (!isComponentClass(node)) return;

    const match =
      ctx.options === "call-order"
        ? [...LIFECYCLE_METHODS]
        : [...LIFECYCLE_METHODS].sort();

    const nodes = new Map<string, ts.Node>();
    const names: string[] = [];

    node.members.forEach(member => {
      if (
        member.name &&
        ts.isIdentifier(member.name) &&
        LIFECYCLE_METHODS.includes(member.name.text)
      ) {
        nodes.set(member.name.text, member.name);
        names.push(member.name.text);
      }
    });

    if (names.length < 2) return;

    names.forEach((name, i) => {
      const prev = names[i - 1];
      const next = names[i + 1];

      let orders = {
        prev: prev ? match.findIndex(n => n === prev) : -1,
        current: match.findIndex(n => n === name),
        next: next ? match.findIndex(n => n === next) : 999
      };

      if (!(orders.prev < orders.current && orders.current < orders.next))
        return ctx.addFailureAtNode(
          nodes.get(name)!,
          getFailureString(ctx.options)
        );
    });

    return ts.forEachChild(node, cb);
  }
}

function getFailureString(options: Options): string {
  return options === "call-order"
    ? Rule.FAILURE_STRING_CALL_ORDER
    : Rule.FAILURE_STRING_ALPHABETICAL;
}
