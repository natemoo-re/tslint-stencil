
# `component-member-order`

Ensures that Component members are ordered consistently

## Config

One argument, which is an object, must be provided. It should contain an `"order"` property. The `"order"` property should be an array consisting of the following strings:

- `element`, which refers to `@Element()` decorated properties
- `event`, which refers to `@Event()` decorated properties
- `internal-prop`, which refers to `@Prop()` decorated properties using `context` or `connect`
- `lifecycle`, which refers to Stencil lifecycle methods (such as `componentWillLoad`)
- `listen`, which refers to `@Listen()` decorated methods
- `method`, which refers to `@Method()` decorated methods
- `own-method`, which refers to undecorated methods
- `own-prop`, which refers to undecorated properties
- `prop`, which refers to `@Prop()` decorated properties
- `state`, which refers to `@State()` decorated properties
- `stencil-method`, which refers to Stencil methods (such as `hostData` or `render`)
- `watch`, which refers to `@Watch()` decorated methods
- `watched-prop`, which refers to `@Prop()` decorated properties that have a `@Watch()` method
- `watched-state`, which refers to `@State()` decorated properties that have a `@Watch()` method

        

### Config examples
```ts
{ 
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
}
```
```ts
{ 
    "component-member-order": [
        true, 
        { 
            "order": false,
            "watch-follows-prop": true
        }
    ]
}
```

## Schema
```ts
{
  "type": "object",
  "properties": {
    "order": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
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
      "minLength": 2,
      "maxLength": 12
    },
    "watch-follows-prop": {
      "type": "boolean"
    },
    "alphabetical": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```
