
# tslint-stencil
Adds stylistic [tslint](https://github.com/palantir/tslint) rules for [Stencil](https://github.com/ionic-team/stencil) projects

## Getting started
Add the following line to your `tslint.json` file to enable the default ruleset (which follows the [Stencil Style Guide](https://stenciljs.com/docs/style-guide))

```json
{
    "extends": ["tslint-stencil/default"],
}
```

Alternatively, you can extend the bare package and enable each [rule](#rules) on a individual basis
```json
{
    "extends": ["tslint-stencil"],
    "rules": {
        "host-data-precedes-render": true
    }
}
```

## Rules

### `host-data-precedes-render`

[Read More](docs/host-data-precedes-render.md)

### `lifecycle-sort`
Ensures that Component lifecycle methods are sorted in a consistent order
[Read More](docs/lifecycle-sort.md)

### `method-decorator-style`
Ensures that component methods *(with a lowercase "m")* follow the specified style.
[Read More](docs/method-decorator-style.md)

### `no-prefix`

[Read More](docs/no-prefix.md)

### `one-component-per-file`

[Read More](docs/one-component-per-file.md)

### `render-as-final-method`

[Read More](docs/render-as-final-method.md)

### `require-prefix`

[Read More](docs/require-prefix.md)

### `variable-decorator-style`

[Read More](docs/variable-decorator-style.md)

### `watch-follows-prop`

[Read More](docs/watch-follows-prop.md)

## Contributing
Rules in the `src/` directory must be **camelCased** and end in **Rule**.
More information on developing custom tslint rules can be found on the [tslint site](https://palantir.github.io/tslint/develop/custom-rules/)

Before adding your custom rule, be sure to write a test for it. Then, you should be able to verify that it works by running:
```
npm run verify
```
