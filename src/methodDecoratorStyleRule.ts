import * as ts from "typescript";
import * as Lint from "tslint";
import { isComponentClass } from './shared/utils';
import { codeExamples } from './code-examples/methodDecoratorStyle.examples'

export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'method-decorator-style',
        description: `Ensures that component methods *(with a lowercase "m")* follow the specified style.`,
        descriptionDetails: ``,
        rationale: 'Enforces a consistent style across your components',
        optionsDescription: ``,
        options: {
            type: "'single-line'|'multi-line'"
        },
        optionExamples: [
            [true, "single-line"],
            [true, "multi-line"]
        ],
        type: 'style',
        typescriptOnly: true,
        codeExamples
    }
    public static SINGLE_FAILURE_STRING = "Component method decorators should be inlined";
    public static MULTI_FAILURE_STRING = "Component method decorators should be multi-line";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new MethodDecoratorWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class MethodDecoratorWalker extends Lint.RuleWalker {
    public visitMethodDeclaration(node: ts.MethodDeclaration) {
        const [style]: ['single-line' | 'multi-line'] = this.getOptions();
        
        if (style && isComponentClass(node.parent) && node.decorators && Array.isArray(node.decorators)) {
            const dec: ts.Decorator = node.decorators[node.decorators.length - 1];
            
            const { line: decoratorLine } = this.getLineAndCharacterOfPosition(dec.getEnd());
            const { line: propertyLine } = this.getLineAndCharacterOfPosition(node.name.getEnd());
            
            if (style === 'single-line') {
                if (decoratorLine !== propertyLine) {
                    // node.getText(this.getSourceFile()).indexOf('\n')
                    // const fix = this.deleteText();
                    return this.addFailure(this.createFailure(node.getStart(this.getSourceFile()), node.getWidth(), Rule.SINGLE_FAILURE_STRING));
                }
            } else if (style === 'multi-line') {
                if (decoratorLine === propertyLine) return this.addFailure(this.createFailure(node.getStart(this.getSourceFile()), node.getWidth(), Rule.MULTI_FAILURE_STRING));
            }

        };

        super.visitMethodDeclaration(node);
    }
}