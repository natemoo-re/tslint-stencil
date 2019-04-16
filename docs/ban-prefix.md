# `ban-prefix`

Ensures that a Component's `tag` does not use any of the given prefixes.

## Config

An array of `"string"`s which no Component `tag` will be allowed to use as a prefix.

### Config examples

```ts
{ "ban-prefix": [true, "stencil"] }
```

```ts
{ "ban-prefix": [true, "stencil", "st", "stnl"] }
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
