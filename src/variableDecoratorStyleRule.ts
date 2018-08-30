import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass } from './shared/utils';

export class Rule extends Lint.Rules.AbstractRule {
    public static SINGLE_FAILURE_STRING = "Variable decorators should be inlined";
    public static MULTI_FAILURE_STRING = "Variable decorators should be multi-line";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new VariableDecoratorWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class VariableDecoratorWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        const [style]: ['single-line' | 'multi-line'] = this.getOptions();
        
        if (style && isComponentClass(node.parent) && node.decorators && Array.isArray(node.decorators)) {
            const dec: ts.Decorator = node.decorators[node.decorators.length - 1];
            
            const { line: decoratorLine } = this.getLineAndCharacterOfPosition(dec.getEnd());
            const { line: propertyLine } = this.getLineAndCharacterOfPosition(node.name.getEnd());

            if (style === 'single-line') {
                if (decoratorLine !== propertyLine) return this.addFailure(this.createFailure(node.getStart(this.getSourceFile()), node.getWidth(), Rule.SINGLE_FAILURE_STRING));
            } else if (style === 'multi-line') {
                if (decoratorLine === propertyLine) return this.addFailure(this.createFailure(node.getStart(this.getSourceFile()), node.getWidth(), Rule.MULTI_FAILURE_STRING));
            }

        };

        super.visitPropertyDeclaration(node);
    }
}