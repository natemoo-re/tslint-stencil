# `decorated-member-style`

Requires decorated class members to follow a consistent style (singleline or multiline)

**`🛠 Has Fixer`**

## Config

One argument which is an object with the keys `"properties"` and `"methods"`. Both can be set to a string, which must be one of the following values:

- `"singleline"`
- `"multiline"`
- `"ignore"`

If either key is excluded, the default behavior (`"ignore"`) will be applied.

A member is considered “multiline” if its declaration is on a line after the last decorator. If decorators are composed (multiple decorators for a single declaration), "multiline" requires each decorator to be on its own line.

### Config examples

```ts
{
  "decorated-member-style": [
    true,
      {
        "methods": "multiline"
      }
  ]
}
```

```ts
{
  "decorated-member-style": [
    true,
      {
        "properties": "singleline",
        "methods": "multiline"
      }
  ]
}
```

## Schema

```ts
{
  "type": "object",
  "properties": {
    "properties": {
      "type": "string",
      "enum": [
        "singleline",
        "multiline",
        "ignore"
      ]
    },
    "methods": {
      "type": "string",
      "enum": [
        "singleline",
        "multiline",
        "ignore"
      ]
    }
  }
}
```

## Code Examples

- Require all decorated component properties to be singleline.
  **⚙️ Config**
  ```ts
  "rules": { "decorated-member-style": [true, { "properties": "singleline" }] }
  ```
  **✅ Pass**
  ```ts
  @Prop() propName: string;
  ```
  **🚫 Fail**
  ```ts
  @Prop()
  propName: string;
  ```
- Require all decorated component properties to be multiline.
  **⚙️ Config**
  ```ts
  "rules": { "decorated-member-style": [true, { "properties": "multiline" }] }
  ```
  **✅ Pass**
  ```ts
  @Prop()
  propName: string;
  ```
  **🚫 Fail**
  ```ts
  @Prop() propName: string;
  ```
- Require all decorated component methods to be inlined.
  **⚙️ Config**
  ```ts
  "rules": { "decorated-member-style": [true, { "methods": "singleline" }] }
  ```
  **✅ Pass**
  ```ts
  @Listen('click') handleClick() {}
  ```
  **🚫 Fail**
  ```ts
  @Listen('click')
  handleClick() {}
  ```
- Require all decorated component methods to be multiline.
  **⚙️ Config**
  ```ts
  "rules": { "decorated-member-style": [true, { "methods": "multiline" }] }
  ```
  **✅ Pass**
  ```ts
  @Listen('click')
  handleClick() {}

  @Listen('click')
  @Listen('tap')
  handleClickOrTap() {}
  ```
  **🚫 Fail**
  ```ts
  @Listen('click') handleClick() {}
  ```
