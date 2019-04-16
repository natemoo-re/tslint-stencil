import * as ts from "typescript";
import { ComponentMetadata } from "../componentMemberOrderRule";

export function evalText(text: string) {
  const fnStr = `return ${text};`;
  return new Function(fnStr)();
}

export interface GetDeclarationParameters {
  <T>(decorator: ts.Decorator): [T];
  <T, T1>(decorator: ts.Decorator): [T, T1];
  <T, T1, T2>(decorator: ts.Decorator): [T, T1, T2];
}
export const getDeclarationParameters: GetDeclarationParameters = (
  decorator: ts.Decorator
): any => {
  if (!ts.isCallExpression(decorator.expression)) {
    return [];
  }

  return decorator.expression.arguments.map(arg => {
    return evalText(arg.getText().trim());
  });
};

export function isComponentClass(node: ts.Node): node is ts.ClassDeclaration {
  if (!ts.isClassDeclaration(node)) return false;

  return (
    Array.isArray(node.decorators) &&
    !!node.decorators.filter(hasDecoratorNamed("Component")).length
  );
}

export function isIdentifierNamed(node: ts.Node, value: string): boolean {
  if (
    !(
      ts.isClassElement(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isPropertyDeclaration(node)
    )
  )
    return false;

  return !!(
    node.name &&
    ts.isIdentifier(node.name) &&
    node.name.text === value
  );
}

export function hasDecoratorNamed(
  name: string
): (dec: ts.Decorator) => boolean {
  return (dec: ts.Decorator) => {
    if (!ts.isDecorator(dec)) return false;
    return (
      ts.isCallExpression(dec.expression) &&
      dec.expression.expression &&
      ts.isIdentifier(dec.expression.expression) &&
      dec.expression.expression.text === name
    );
  };
}

export function getIndentationAtNode(
  node: ts.Node,
  sourceFile: ts.SourceFile
): string {
  const text = node
    .getFullText(sourceFile)
    .split("\n")
    .map(ln => {
      const text = /^(\s+)\S/g.exec(ln);
      return text ? text[1] : false;
    })
    .filter(x => x);
  return text[0] as string;
}

export function getFirstNonDecoratorToken(node: ts.Node): ts.Node | false {
  let token: boolean | ts.Node = false;
  function isNonDecorator(node: ts.Node) {
    if (!token) token = !ts.isDecorator(node) && node;
  }
  node.forEachChild(isNonDecorator);
  return token;
}

// TODO Actual Implementation
export function getDecoratorArgs<T>(dec: ts.Decorator): T | null {
  const args =
    dec.expression &&
    ts.isCallExpression(dec.expression) &&
    ts.isStringLiteral(dec.expression.arguments[0]) &&
    (dec.expression.arguments[0] as any).text;
  return args ? (args as any) : null;
}

export function followsOrder(actual: string[], expected: string[]): boolean {
  expected = expected.filter(x => actual.includes(x));
  return actual.map((item, i) => expected[i] === item).every(x => x);
}

export function firstGroupOutOfOrder(
  actual: string[],
  expected: string[]
): false | string {
  expected = expected.filter(x => actual.includes(x));
  const map = actual.map((item, i) => expected[i] === item);

  return map.every(x => x) ? false : actual[map.findIndex(x => x === false)];
}

export function count(arr: ComponentMetadata[], key: string): number {
  return arr.filter(x => x.key === key).length;
}

export function checkGroupings(test: ComponentMetadata[]): ComponentMetadata[] {
  const ungrouped: string[] = [];

  // Loop through and save any items that occur more than once
  let counts: { [key: string]: number } = {};
  test.forEach(value => {
    if (counts[value.key] !== undefined) return;
    const num = count(test, value.key);
    if (num > 1) counts[value.key] = num;
  });
  const multiples = Object.keys(counts);

  // Save original value and index
  // Then get all the items that occur more than once
  const map = test
    .map((value, index) => ({ value, index }))
    .filter(x => multiples.includes(x.value.key));

  // For each unique key, check all of the items of that key
  // and determine if they are in sequential order
  multiples.forEach(key => {
    const sequential = map
      .filter(x => x.value.key === key)
      .every((curr, i, arr) => {
        const next = arr[i + 1];
        if (!next) return true;
        return curr.index === next.index - 1;
      });
    if (!sequential) ungrouped.push(key);
  });

  return test.filter(comp => ungrouped.includes(comp.key));
}
