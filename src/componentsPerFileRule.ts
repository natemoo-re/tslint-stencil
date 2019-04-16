import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass } from "./shared/utils";

interface Options {
  maxComponents: number;
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "components-per-file",
    description: `Allows a maximum number of Components to be placed in a single file`,
    optionsDescription: Lint.Utils.dedent`
            This rule requires a single argument – a \`"number"\` representing the maximum number of @Component() decorated classes allowed in a single file.
        `,
    options: {
      type: "array",
      items: {
        type: "number"
      },
      minLength: 1,
      maxLength: 1
    },
    optionExamples: [`{ "components-per-file": [true, 1] }`],
    type: "maintainability",
    typescriptOnly: true
  };
  public static FAILURE_STRING = "Files may only contain %s component";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const options: Options = {
      maxComponents: this.getOptions().ruleArguments[0]
    };
    return this.applyWithFunction(sourceFile, walk, options);
  }
}

function walk(ctx: Lint.WalkContext<Options>) {
  let components = 0;
  let failure = false;
  function cb(node: ts.Node): void {
    if (!ts.isClassDeclaration(node)) return;
    if (!isComponentClass(node)) return;

    components++;
    failure = components > ctx.options.maxComponents;
    if (!failure) return;

    let FAILURE_STRING = Rule.FAILURE_STRING.replace(
      "%s",
      `${ctx.options.maxComponents}`
    );
    if (ctx.options.maxComponents > 1) FAILURE_STRING += "s";
    ctx.addFailureAtNode(node, FAILURE_STRING);

    return ts.forEachChild(node, cb);
  }

  return ts.forEachChild(ctx.sourceFile, cb);
}
