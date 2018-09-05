import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass, followsOrder } from "./shared/utils";
import { STENCIL_METHODS } from "./shared/constants";


type StencilMethod = "hostData"|"render";
type Options = {
    order: StencilMethod[]
};

export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'stencil-method-order',
        description: 'Ensures that Stencil methods (`hostData`, `render`) are ordered consistently',
        descriptionDetails: Lint.Utils.dedent`
            If you wish to define where Stencil methods exist within a Component class, see \`component-member-order\` instead.
        `,
        optionsDescription: Lint.Utils.dedent`
            One argument, which is an object, must be provided. It should contain an \`"order"\` property. The \`"order"\` property should be an array consisting of the following strings:
                - \`hostData\`
                - \`render\`
        `,
        options: {
            "type": "object",
            "properties": {
                "order": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "hostData",
                            "render",
                        ]
                    },
                    "minLength": 2,
                    "maxLength": 2
                }
            },
            "additionalProperties": false
        },
        optionExamples: [
            `{ "stencil-method-order": [true, { "order": ["hostData", "render"] }] }`
        ],
        type: 'maintainability',
        typescriptOnly: true
    }
    public static FAILURE_STRING_ORDER = 'Stencil methods should be in the following order: "%s"';
    public static FAILURE_STRING_GROUP = 'Stencil methods should all be grouped together';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options: Options = this.getOptions().ruleArguments[0];
        if (!options || options && !options.order) return [];

        return this.applyWithFunction(sourceFile, walk, options);
    }
}

function walk(ctx: Lint.WalkContext<Options>) {
    const { order } = ctx.options;
    let componentIndex = -1;
    const found: { name: StencilMethod, node: ts.MethodDeclaration }[][] = [];


    function cb(node: ts.Node): void {
        if (ts.isClassDeclaration(node) && isComponentClass(node)) {
            componentIndex++;
            found.push([]);
        }

        if (ts.isMethodDeclaration(node)) {
            if (!isComponentClass(node.parent)) return;

            if (ts.isIdentifier(node.name)) {
                const name: any = node.name.text;
                if (STENCIL_METHODS.includes(name)) {
                    found[componentIndex].push({ node, name });
                } else {
                    if (found[componentIndex].length >= 1) { ctx.addFailureAtNode(node, Rule.FAILURE_STRING_GROUP); }
                }
            }
        }
        return node.forEachChild(cb);
    }

    ts.forEachChild(ctx.sourceFile, cb);
    
    found.map(methods => {
        if (methods.length <= 1) return;
        
        const follows = followsOrder(methods.map(x => x.name), order);
        if (follows) return;

        return methods.map(({ node }) => ctx.addFailureAtNode(node, Rule.FAILURE_STRING_ORDER.replace('%s', order.join(', '))))
    })
}