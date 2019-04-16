# `components-per-file`

Allows a maximum number of Components to be placed in a single file

## Config

This rule requires a single argument – a `"number"` representing the maximum number of @Component() decorated classes allowed in a single file.

### Config examples

```ts
{ "components-per-file": [true, 1] }
```

## Schema

```ts
{
  "type": "array",
  "items": {
    "type": "number"
  },
  "minLength": 1,
  "maxLength": 1
}
```
