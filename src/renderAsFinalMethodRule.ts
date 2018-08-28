import * as ts from "typescript";
import * as Lint from "tslint";
import { identifierNameIs } from './shared/utils';

type Options = {};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Render should be the last method';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options: Options = this.getOptions();
        // Call `applyWithFunction` with your callback function, `walk`.
        // This creates a `WalkContext<T>` and passes it in as an argument.
        // An optional 3rd parameter allows you to pass in a parsed version of `this.ruleArguments`. If used, it is not recommended to
        //     simply pass in `this.getOptions()`, but to parse it into a more useful object instead.
        return this.applyWithFunction(sourceFile, walk, options);
    }
}

// Here, the options object type is `void` because we don't pass any options in this example.
function walk(ctx: Lint.WalkContext<Options>) {
    // Recursively walk the AST starting with root node, `ctx.sourceFile`.
    // Call the function `cb` (defined below) for each child.
    return ts.forEachChild(ctx.sourceFile, cb);

    function cb(node: ts.Node): void {
        if (!ts.isClassDeclaration(node)) return;

        node.members.forEach((member, i) => {
            if (member.name && identifierNameIs(member, 'render')) {
                if (i !== node.members.length - 1) {
                    return ctx.addFailureAtNode(member.name, Rule.FAILURE_STRING);
                }
            }
        })

        return ts.forEachChild(node, cb);
    }
}