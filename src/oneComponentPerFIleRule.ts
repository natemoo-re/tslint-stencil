import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass} from './shared/utils';

type Options = {};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Files may only contain a single component';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options: Options = this.getOptions();
        return this.applyWithFunction(sourceFile, walk, options);
    }
}

function walk(ctx: Lint.WalkContext<Options>) {
    return ts.forEachChild(ctx.sourceFile, cb);

    let component = false;
    function cb(node: ts.Node): void {
        if (!ts.isClassDeclaration(node)) return;
        if (!isComponentClass(node)) return;

        if (!component) {
            component = true;
            return;
        }
        
        ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
        return ts.forEachChild(node, cb);
    }
}