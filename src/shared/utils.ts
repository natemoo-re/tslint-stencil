import * as ts from 'typescript';

export function isIdentifierNamed(node: ts.Node, value: string): boolean {
    if (!ts.isClassElement(node)) return false;

    return !!(node.name && ts.isIdentifier(node.name) && node.name.text === value);
}

export function hasDecoratorNamed(name: string): (dec: ts.Decorator) => boolean {
    return (dec: ts.Decorator) => (
        ts.isCallExpression(dec.expression)
            && dec.expression.expression
            && ts.isIdentifier(dec.expression.expression)
            && dec.expression.expression.text === name
    );
}