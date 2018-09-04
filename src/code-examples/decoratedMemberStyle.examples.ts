import * as Lint from 'tslint';

export const codeExamples: Lint.ICodeExample[] = [
    {
        description: "Require all decorated component methods to be multi-line.",
        config: `"rules": { "decorated-member-style": [true, { "properties": "singleline" }] }`,
        pass: `@Prop() propName: string;`,
        fail: Lint.Utils.dedent`
            @Prop()
            propName: string;
        `.trim(),
    },
    {
        description: "Require all decorated component methods to be multi-line.",
        config: `"rules": { "decorated-member-style": [true, { "properties": "multiline" }] }`,
        pass: Lint.Utils.dedent`
            @Prop()
            propName: string;
        `.trim(),
        fail: `@Prop() propName: string;`,
    },
    {
        description: "Require all decorated component methods to be multi-line.",
        config: `"rules": { "decorated-member-style": [true, { "methods": "multiline" }] }`,
        pass: Lint.Utils.dedent`
            @Listen('click')
            handleClick() {}
        `.trim(),
        fail: `@Listen('click') handleClick() {}`,
    },
    {
        description: "Require all decorated component methods to be inlined.",
        config: `"rules": { "decorated-member-style": [true, { "methods": "multiline" }] }`,
        pass: Lint.Utils.dedent`
            @Listen('click') handleClick() {}
        `.trim(),
        fail: Lint.Utils.dedent`
            @Listen('click')
            handleClick() {}
        `.trim(),
    }
];