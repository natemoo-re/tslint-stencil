import * as ts from 'typescript';

export function isComponentClass(node: ts.Node): node is ts.ClassDeclaration {
    if (!ts.isClassDeclaration(node)) return false;

    return Array.isArray(node.decorators) && !!(node.decorators.filter(hasDecoratorNamed('Component')).length);
}

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

// TODO Actual Implementation
export function getDecoratorArgs<T>(dec: ts.Decorator): T|null {
    const args = dec.expression && ts.isCallExpression(dec.expression) && ts.isStringLiteral(dec.expression.arguments[0]) && (dec.expression.arguments[0] as any).text;
    return args ? args as any: null;
}

