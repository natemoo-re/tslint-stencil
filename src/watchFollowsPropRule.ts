import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass, hasDecoratorNamed, getDecoratorArgs, isIdentifierNamed } from './shared/utils';

type Options = {};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Watch methods should immediately follow the declaration of the Prop/State they watch';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options: Options = this.getOptions();
        return this.applyWithFunction(sourceFile, walk, options);
    }
}

function walk(ctx: Lint.WalkContext<Options>) {
    return ts.forEachChild(ctx.sourceFile, cb);

    function cb(node: ts.Node): void {
        if (!ts.isClassDeclaration(node)) return;
        if (!isComponentClass(node)) return;

        node.members.forEach((member, i) => {
            if (member.decorators && Array.isArray(member.decorators) && member.decorators.filter(hasDecoratorNamed('Watch')).length) {
                const watcher = member.decorators.find(hasDecoratorNamed('Watch'))!;
                const watched = getDecoratorArgs<string>(watcher)!;

                const prev = node.members[i - 1];

                if (!prev) return ctx.addFailureAtNode(member, Rule.FAILURE_STRING);
                
                if (Array.isArray(prev.decorators) && (prev.decorators!.filter(hasDecoratorNamed('Prop')).length || prev.decorators!.filter(hasDecoratorNamed('State')).length)) {
                    if (prev.name && !isIdentifierNamed(prev, watched)) return ctx.addFailureAtNode(member, Rule.FAILURE_STRING);
                    else return;
                }
            }
        })

        return ts.forEachChild(node, cb);
    }
}