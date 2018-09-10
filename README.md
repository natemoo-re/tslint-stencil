
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

### [`ban-prefix`](docs/ban-prefix.md)
Ensures that a Component's `tag` does not use any of the given prefixes.

### [`component-member-order`](docs/component-member-order.md)
Ensures that Component members are ordered consistently

### [`components-per-file`](docs/components-per-file.md)
Allows a maximum number of Components to be placed in a single file

### [`decorated-member-style`](docs/decorated-member-style.md)
Requires decorated class members to follow a consistent style (singleline or multiline)

### [`lifecycle-order`](docs/lifecycle-order.md)
Ensures that Component lifecycle methods are ordered consistently

### [`require-prefix`](docs/require-prefix.md)
Ensures that a Component's `tag` begins with the given prefix(es).

### [`stencil-method-order`](docs/stencil-method-order.md)
Ensures that Stencil methods (`hostData`, `render`) are ordered consistently

## Contributing
Rules in the `src/` directory must be **camelCased** and end in **Rule**.
More information on developing custom tslint rules can be found on the [tslint site](https://palantir.github.io/tslint/develop/custom-rules/)

Before adding your custom rule, be sure to write a test for it. Then, you should be able to verify that it works by running:
```
npm run verify
```
