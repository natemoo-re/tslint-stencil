# tslint-stencil
Contributes some helpful [tslint](https://github.com/palantir/tslint) rules for [Stencil](https://github.com/ionic-team/stencil) projects

## Rules
- `one-component-per-file`
- `render-as-final-method`
- `host-data-precedes-render`
- `watch-follows-prop`
- `lifecycle-mirrors-call-order`

## Contributing
Rules in the `src/` directory must be **camelCased** and end in **Rule**.
More information on developing custom tslint rules can be found on the [tslint site](https://palantir.github.io/tslint/develop/custom-rules/)

Before adding your custom rule, be sure to write a test for it. Then, you should be able to verify that it works by running:
```
npm run verify
```