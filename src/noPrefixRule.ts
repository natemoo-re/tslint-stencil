import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass, hasDecoratorNamed, getDeclarationParameters } from './shared/utils';

type Options = {
    blocklist: string[]
};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Invalid tag prefix "%s"';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options: Options = {
            blocklist: this.getOptions().ruleArguments[0]
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
        ctx.options.blocklist.forEach(prefix => {
            if (valid) valid = !tag.startsWith(`${prefix}-`);
        })

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