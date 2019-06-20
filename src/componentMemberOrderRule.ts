import * as ts from "typescript";
import * as Lint from "tslint";
import {
  isComponentClass,
  getDeclarationParameters,
  hasDecoratorNamed,
  followsOrder,
  checkGroupings,
  firstGroupOutOfOrder,
  getIndentationAtNode,
  getDecoratorArgs
} from "./shared/utils";
import {
  LIFECYCLE_METHODS,
  STENCIL_METHODS,
  VERBOSE_COMPONENT_MEMBERS
} from "./shared/constants";

type ComponentMember =
  | "element"
  | "event"
  | "internal-prop"
  | "lifecycle"
  | "listen"
  | "method"
  | "own-method"
  | "own-prop"
  | "prop"
  | "state"
  | "stencil-method"
  | "watch"
  | "watched-prop"
  | "watched-state";
export interface ComponentMetadata {
  name: string;
  key: ComponentMember;
  node: ts.Node;
  watches?: string | false;
  watchedBy?: ComponentMetadata;
}
type Options = {
  order: ComponentMember[];
  "watch-follows-prop": boolean;
  alphabetical: boolean;
};

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "component-member-order",
    description: "Ensures that Component members are ordered consistently",
    optionsDescription: Lint.Utils.dedent`
            One argument, which is an object, must be provided. It should contain an \`"order"\` property. The \`"order"\` property should be an array consisting of the following strings:

                - \`element\`, which refers to \`@Element()\` decorated properties
                - \`event\`, which refers to \`@Event()\` decorated properties
                - \`internal-prop\`, which refers to \`@Prop()\` decorated properties using \`context\` or \`connect\`
                - \`lifecycle\`, which refers to Stencil lifecycle methods (such as \`componentWillLoad\`)
                - \`listen\`, which refers to \`@Listen()\` decorated methods
                - \`method\`, which refers to \`@Method()\` decorated methods
                - \`own-method\`, which refers to undecorated methods
                - \`own-prop\`, which refers to undecorated properties
                - \`prop\`, which refers to \`@Prop()\` decorated properties
                - \`state\`, which refers to \`@State()\` decorated properties
                - \`stencil-method\`, which refers to Stencil \`render()\` method
                - \`watch\`, which refers to \`@Watch()\` decorated methods
                - \`watched-prop\`, which refers to \`@Prop()\` decorated properties that have a \`@Watch()\` method
                - \`watched-state\`, which refers to \`@State()\` decorated properties that have a \`@Watch()\` method

        `,
    options: {
      type: "object",
      properties: {
        order: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "element",
              "event",
              "internal-prop",
              "lifecycle",
              "listen",
              "method",
              "own-method",
              "own-prop",
              "prop",
              "state",
              "stencil-method",
              "watch",
              "watched-state",
              "watched-prop"
            ]
          },
          minLength: 2,
          maxLength: 12
        },
        "watch-follows-prop": {
          type: "boolean"
        },
        alphabetical: {
          type: "boolean"
        }
      },
      additionalProperties: false
    },
    optionExamples: [
      `{
                "component-member-order": [
                  true,
                  {
                    "order": [
                        "own-prop",
                        "element",
                        "state",
                        "watched-state",
                        "internal-prop",
                        "prop",
                        "watched-prop",
                        "event",
                        "lifecycle",
                        "listen",
                        "method",
                        "own-method",
                        "stencil-method"
                    ],
                    "alphabetical": true
                  }
                ]
              }`,
      `{
                "component-member-order": [
                  true,
                  {
                    "order": false,
                    "watch-follows-prop": true
                  }
                ]
              }`
    ],
    type: "maintainability",
    typescriptOnly: true
  };
  public static FAILURE_STRING_ORDER = `Component member "%a" should be placed %b`;
  public static FAILURE_STRING_GROUP = `%a and %b should not be mixed`;
  public static FAILURE_STRING_ALPHABETICAL = `Component members of the same type should be alphabetized`;
  public static FAILURE_STRING_WATCH = `Watch methods should immediately follow the declaration of the Prop/State they watch`;

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const options: Options = Object.assign(
      {
        order: false,
        "watch-follows-prop": false,
        alphabetical: false
      },
      this.getOptions().ruleArguments[0]
    );

    return this.applyWithFunction(sourceFile, walk, options);
  }
}

function walk(ctx: Lint.WalkContext<Options>) {
  const {
    order,
    "watch-follows-prop": watchFollowsProp,
    alphabetical
  } = ctx.options;

  function cb(node: ts.Node): void {
    let collected: any[] = [];

    if (ts.isClassDeclaration(node) && isComponentClass(node)) {
      node.members.forEach((member: ts.ClassElement) => {
        const name =
          member.name && ts.isIdentifier(member.name) && member.name.text;
        const key = getOrderKey(member);
        const watches = determineWatchedProp(member, key);

        if (name && key) {
          collected.push({ name, key, watches, node: member });
        }
      });

      const watchable = ["prop", "state"];

      const watchers = collected.filter(x => x.watches);
      const watchedNames = watchers.map(watcher => watcher.watches);
      collected.forEach(componentMember => {
        const { key, name } = componentMember;

        if (watchedNames.includes(componentMember.name)) {
          componentMember.watchedBy = watchers.find(
            watcher => watcher.watches === name
          );
          componentMember.key = watchable.includes(key)
            ? (`watched-${key}` as ComponentMember)
            : key;
        }
      });
    }

    const collectedKeys = collected.map(x => x.key);
    const collectedKeysSet = new Set(collectedKeys);

    if (collected.length) {
      if (order) {
        // First, check that all items of the same type are grouped together
        const ungrouped = checkGroupings(collected);
        if (ungrouped.length) {
          let groups: ComponentMetadata[] = ungrouped;

          // filter out all watchers and watched props/state
          if (watchFollowsProp) {
            groups = ungrouped.reduce((acc, componentMemb) => {
              if (componentMemb.watches || componentMemb.watchedBy) {
                return acc;
              }

              return [...acc, componentMemb];
            }, []);
          }

          if (groups.length) {
            const failures = [
              ...collected.filter(
                x => groups.findIndex(g => g.key === x.key) > -1
              )
            ].map(x => x.node);

            const firstGroupMember = groups[0];
            const misplacedGroupMemberIndex =
              [...collectedKeysSet].findIndex(x => x === firstGroupMember.key) +
              1;
            const misplacedGroupMemberKey: string = [...collectedKeysSet][
              misplacedGroupMemberIndex
            ];

            const a = VERBOSE_COMPONENT_MEMBERS[firstGroupMember.key];
            const b = VERBOSE_COMPONENT_MEMBERS[misplacedGroupMemberKey];

            return addFailureToNodeGroup(
              ctx,
              failures,
              Rule.FAILURE_STRING_GROUP.replace(/\%a/g, a).replace(/\%b/g, b)
            );
          }
          return;
        }

        // Next, add failures to the nodes that are out of order
        const actual = Array.from(
          new Set(collected.map(value => value.key))
        ).filter(x => order.includes(x));
        const follows = followsOrder(actual, order);
        if (!follows) {
          const group: ComponentMember = firstGroupOutOfOrder(
            actual,
            order
          ) as ComponentMember;
          const existing = order.filter(x => actual.includes(x));
          const prev = existing[existing.indexOf(group) - 1];
          const next = existing[existing.indexOf(group) + 1];
          const failures = collected
            .filter(x => x.key === group)
            .map(x => x.node);

          addFailureToNodeGroup(
            ctx,
            failures,
            Rule.FAILURE_STRING_ORDER.replace(/\%a/g, group).replace(
              /\%b/g,
              () => {
                if (next && prev) {
                  return `between "${prev}" and "${next}"`;
                }

                return next ? `before "${next}"` : `after "${prev}"`;
              }
            )
          );
        }
      }

      if (watchFollowsProp) {
        const watched = collected
          .map((value, index) => ({ value, index }))
          .filter(({ value }) => value.key === "watch")
          .map(({ value, index }) => {
            const name = getDeclarationParameters<string>(
              value.node.decorators!.find(hasDecoratorNamed("Watch"))!
            )[0];
            return {
              node: value.node,
              name,
              index
            };
          });
        collected.forEach((current, i) => {
          if (current.key.startsWith("watched-")) {
            const watch = watched.find(x => x.name === current.name);
            if (!watch) return;
            if (i === watch.index - 1) return;

            return ctx.addFailureAtNode(watch.node, Rule.FAILURE_STRING_WATCH);
          }
        });
      }

      // Finally, if alphabetical, check that groupings are in alphabetical order
      if (alphabetical) {
        let actual: ComponentMember[] = [];
        if (order)
          actual = Array.from(
            new Set(collected.map(value => value.key))
          ).filter(x => order.includes(x));
        if (!order)
          actual = Array.from(new Set(collected.map(value => value.key)));

        const groups = actual
          .map(key => {
            if (key === "lifecycle" || key === "stencil-method") {
              return { key, alphabetical: true };
            }
            const group = collected.filter(x => x.key === key).map(x => x.name);
            const alpha = group.every((item, i, arr) => {
              const next = arr[i + 1];
              if (!next) return true;
              return item.toUpperCase() < next.toUpperCase();
            });

            return { key, alphabetical: alpha };
          })
          .filter(x => !x.alphabetical)
          .map(x => x.key);

        if (groups.length) {
          const failures = [...collected.filter(x => groups.includes(x.key))];
          const fix = createFixAlphabetical(failures, ctx.sourceFile);
          return addFailureToNodeGroup(
            ctx,
            failures.map(x => x.node),
            Rule.FAILURE_STRING_ALPHABETICAL,
            fix
          );
        }
      }
    }

    return node.forEachChild(cb);
  }

  ts.forEachChild(ctx.sourceFile, cb);
}

function getOrderKey(node: ts.Node): ComponentMember | false {
  if (!ts.isClassElement(node)) return false;

  let key: ComponentMember | false = false;
  if (node.decorators && Array.isArray(node.decorators)) {
    const decorators: string[] = node.decorators
      .map(
        dec =>
          ts.isCallExpression(dec.expression) &&
          ts.isIdentifier(dec.expression.expression) &&
          dec.expression.expression.text.toLowerCase()
      )
      .filter(x => x) as string[];
    if (decorators.length === 1) {
      key = decorators[0] as ComponentMember;
      if (key === "prop") {
        const args = getDeclarationParameters<any>(
          node.decorators.find(hasDecoratorNamed("Prop"))!
        )[0];
        if (args && (args.context || args.connect)) key = "internal-prop";
      }
    }
  } else {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        key = "own-prop";
        break;
      case ts.SyntaxKind.MethodDeclaration:
        const name = node.name && ts.isIdentifier(node.name) && node.name.text;
        if (name) {
          if (LIFECYCLE_METHODS.includes(name)) key = "lifecycle";
          else if (STENCIL_METHODS.includes(name)) key = "stencil-method";
          else key = "own-method";
          break;
        }
    }
  }

  return key;
}

function addFailureToNodeGroup(
  ctx: Lint.WalkContext<any>,
  nodes: ts.Node[],
  failure: string,
  fix?: Lint.Replacement | Lint.Replacement[]
) {
  if (nodes.length === 1) {
    ctx.addFailureAtNode(nodes[0], failure, fix);
  } else {
    const start = nodes[0].getStart(ctx.sourceFile, true);
    const width = nodes[nodes.length - 1].getEnd() - start;

    return ctx.addFailureAt(start, width, failure, fix);
  }
}

function createFixAlphabetical(
  collected: ComponentMetadata[],
  sourceFile: ts.SourceFile
) {
  const fix: Lint.Replacement[] = [];
  const nodes = collected.map(x => x.node);
  const start = nodes[0].getStart(sourceFile, true);
  const end = nodes[nodes.length - 1].getEnd();
  const indent = getIndentationAtNode(nodes[0], sourceFile);

  const sorted = [...collected]
    .sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    })
    .map(({ node }, i) => {
      const text = node.getFullText(sourceFile);
      if (i === 0) return `${text.trim()}`;
      else return `${indent}${text.trim()}`;
    });
  fix.push(Lint.Replacement.replaceFromTo(start, end, sorted.join("\n")));

  return fix;
}

function determineWatchedProp(
  member: ts.ClassElement,
  key: ComponentMember | false
): string {
  if (!key || key !== "watch" || !member.decorators || !member.decorators[0]) {
    return "";
  }
  return getDecoratorArgs<string>(member.decorators[0]) || "";
}
