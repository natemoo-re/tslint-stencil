import * as ts from 'typescript';

export function identifierNameIs(node: ts.Node, value: string): boolean {
    if (!ts.isClassElement(node)) return false;

    return !!(node.name && ts.isIdentifier(node.name) && node.name.text === value);
}
