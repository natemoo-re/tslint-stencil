import * as ts from "typescript";
import * as Lint from "tslint";
import {
  isComponentClass,
  hasDecoratorNamed,
  getDeclarationParameters
} from "./shared/utils";

type Options = {
  valid: string[];
};

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "require-prefix",
    description: `Ensures that a Component's \`tag\` begins with the given prefix(es).`,
    optionsDescription: Lint.Utils.dedent`
            An array of \`"string"\` which a Component \`tag\` must use as a prefix.
        `,
    options: {
      type: "array",
      items: {
        type: "string"
      },
      minLength: 1
    },
    optionExamples: [
      `{ "ban-prefix": [true, "ion"] }`,
      `{ "ban-prefix": [true, "ion", "ionic"] }`
    ],
    type: "style",
    typescriptOnly: true
  };
  public static FAILURE_STRING =
    'Invalid tag prefix "%s". Tag must begin with "%s"';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const options: Options = {
      valid: this.getOptions().ruleArguments.map(x =>
        x.trim().replace(/-$/, "")
      )
    };

    return this.applyWithFunction(sourceFile, walk, options);
  }
}

function walk(ctx: Lint.WalkContext<Options>) {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    if (!ts.isClassDeclaration(node)) return;
    if (!isComponentClass(node)) return;

    const dec: ts.Decorator = node.decorators!.find(
      hasDecoratorNamed("Component")
    )!;
    const [{ tag }] = getDeclarationParameters<{ tag: string }>(dec);

    if (!tag) return;

    let valid = ctx.options.valid.some(prefix => tag.startsWith(`${prefix}-`));

    if (valid) return;
    const obj =
      ts.isCallExpression(dec.expression) &&
      (dec.expression as ts.CallExpression).arguments[0];
    if (obj && ts.isObjectLiteralExpression(obj)) {
      const property = obj.properties.filter(property => {
        let name = property.name!.getText(ctx.sourceFile);
        return name.indexOf("tag") > -1;
      })[0];
      if (property) {
        ctx.addFailureAtNode(
          property.getChildAt(2, ctx.sourceFile),
          Rule.FAILURE_STRING.replace("%s", tag.split("-")[0]).replace(
            "%s",
            Array.isArray(ctx.options.valid)
              ? ctx.options.valid.join("|")
              : ctx.options.valid
          )
        );
      }
    }

    return ts.forEachChild(node, cb);
  }
}
