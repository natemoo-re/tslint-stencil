import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass } from './shared/utils';

type Options = 'call-order' | 'alphabetical';

export class Rule extends Lint.Rules.AbstractRule {
    public static CALL_ORDER_FAILURE_STRING = 'Component lifecycle methods should be sorted according to their call order';
    public static ALPHABETICAL_FAILURE_STRING = 'Component lifecycle methods should be sorted alphabetically';
    public static LIFECYCLE_METHODS = [
        'componentWillLoad',
        'componentDidLoad',
        'componentWillUpdate',
        'componentDidUpdate',
        'componentDidUnload'
    ]

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        let args = this.getOptions().ruleArguments[0];
        if (args) args = args.trim();
        let options: Options;
        
        if (args && args.match(/^(call-order|alphabetical)$/)) {
            options = args;
        } else {
            options = 'call-order';
        }

        return this.applyWithFunction(sourceFile, walk, options);
    }
}

function walk(ctx: Lint.WalkContext<Options>) {
    return ts.forEachChild(ctx.sourceFile, cb);
    
    function cb(node: ts.Node): void {
        if (!ts.isClassDeclaration(node)) return;
        if (!isComponentClass(node)) return;

        const match = (ctx.options === 'call-order') ? [...Rule.LIFECYCLE_METHODS] : [...Rule.LIFECYCLE_METHODS].sort();
        console.log(ctx.options, match);
        const nodes = new Map<string, ts.Node>();
        const names: string[] = [];
        
        node.members.forEach((member) => {
            if (member.name && ts.isIdentifier(member.name) && Rule.LIFECYCLE_METHODS.includes(member.name.text)) {
                nodes.set(member.name.text, member.name);
                names.push(member.name.text);
            }
        })

        if (names.length < 2) return;

        names.forEach((name, i) => {
            const prev = names[i - 1];
            const next = names[i + 1];

            let orders = {
                prev: prev ? match.findIndex((n) => n === prev) : -1,
                current: match.findIndex((n) => n === name),
                next: next ? match.findIndex((n) => n === next) : 999
            }
            
            if (!(orders.prev < orders.current && orders.current < orders.next)) return ctx.addFailureAtNode(nodes.get(name)!, getFailureString(ctx.options));
        })

        return ts.forEachChild(node, cb);
    }
}

function getFailureString(options: Options): string {
    return (options === 'call-order')
        ? Rule.CALL_ORDER_FAILURE_STRING
        : Rule.ALPHABETICAL_FAILURE_STRING;
}