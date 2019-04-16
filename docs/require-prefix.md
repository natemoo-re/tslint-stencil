# `require-prefix`

Ensures that a Component's `tag` begins with the given prefix(es).

## Config

An array of `"string"` which a Component `tag` must use as a prefix.

### Config examples

```ts
{ "ban-prefix": [true, "ion"] }
```

```ts
{ "ban-prefix": [true, "ion", "ionic"] }
```

## Schema

```ts
{
  "type": "array",
  "items": {
    "type": "string"
  },
  "minLength": 1
}
```
