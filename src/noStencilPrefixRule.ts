import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass, hasDecoratorNamed, getDeclarationParameters } from './shared/utils';

type Options = {};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Avoid stencil-related prefixes in your components';
    public static DISALLOWED_PREFIXES = ['st', 'stnl', 'stencil'];

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

        const dec: ts.Decorator = node.decorators!.find(hasDecoratorNamed('Component'))!;
        const [{ tag }] = getDeclarationParameters<{ tag: string }>(dec);
        
        if (!tag) return;

        let valid = true;
        Rule.DISALLOWED_PREFIXES.forEach(prefix => {
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
                ctx.addFailureAtNode(property.getChildAt(2, ctx.sourceFile), Rule.FAILURE_STRING);
            }
        }
        

        return ts.forEachChild(node, cb);
    }
}