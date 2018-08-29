import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass } from './shared/utils';

type Options = {};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Component lifecycle methods should be ordered according to their call order';
    public static LIFECYCLE_METHODS = [
        'componentWillLoad',
        'componentDidLoad',
        'componentWillUpdate',
        'componentDidUpdate',
        'componentDidUnload'
    ]

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
                prev: prev ? Rule.LIFECYCLE_METHODS.findIndex((n) => n === prev) : -1,
                current: Rule.LIFECYCLE_METHODS.findIndex((n) => n === name),
                next: next ? Rule.LIFECYCLE_METHODS.findIndex((n) => n === next) : 999
            }
            
            if (!(orders.prev < orders.current && orders.current < orders.next)) return ctx.addFailureAtNode(nodes.get(name)!, Rule.FAILURE_STRING);
        })

        return ts.forEachChild(node, cb);
    }
}