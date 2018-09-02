export const codeExamples = [
    {
        description: "Require all decorated component methods to be multi-line.",
        config: `
            "rules": { "method-decorator-style": [true, "multi-line"] }
        `,
        pass: `
            @Listen('click')
            handleClick() {}
        `,
        fail: `
            @Listen('click') handleClick() {}
        `,
    },
    {
        description: "Require all decorated component methods to be inlined.",
        config: `
            "rules": { "method-decorator-style": [true, "single-line"] }
        `,
        pass: `
            @Listen('click') handleClick() {}
        `,
        fail: `
            @Listen('click')
            handleClick() {}
        `,
    }
];