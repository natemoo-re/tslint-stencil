import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass, hasDecoratorNamed, getDeclarationParameters } from './shared/utils';

type Options = {
    isArray: boolean
    valid: string|string[]
};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Invalid tag prefix "%s"\nTag must begin with "%s"';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const valid = this.getOptions().ruleArguments[0];
        const options: Options = {
            isArray: Array.isArray(valid),
            valid
        };

        return this.applyWithFunction(sourceFile, walk, options);
    }
}

function walk(ctx: Lint.WalkContext<Options>) {
    return ts.forEachChild(ctx.sourceFile, cb);

    function cb(node: ts.Node): void {
        if (!ts.isClassDeclaration(node)) return;
        if (!isComponentClass(node)) return;

        const dec: ts.Decorator = node.decorators!.find(hasDecoratorNamed('Component'))!;
        const [{ tag }] = getDeclarationParameters<{ tag: string }>(dec);
        
        if (!tag) return;

        let valid = true;
        if (ctx.options.isArray) {
            (ctx.options.valid as string[]).forEach(prefix => {
                if (valid) valid = tag.startsWith(`${prefix}-`);
            })
        } else {
            valid = tag.startsWith(`${(ctx.options.valid as string)}-`);
        }

        if (valid) return;
        const obj = ts.isCallExpression(dec.expression) && (dec.expression as ts.CallExpression).arguments[0];
        if (obj && ts.isObjectLiteralExpression(obj)) {
            const property = obj.properties.filter((property) => {
                let name = property.name!.getText(ctx.sourceFile);
                return name.indexOf('tag') > -1;
            }).pop();
            if (property) {
                ctx.addFailureAtNode(property.getChildAt(2, ctx.sourceFile), Rule.FAILURE_STRING.replace('%s', tag.split('-')[0]));
            }
        }
        

        return ts.forEachChild(node, cb);
    }
}