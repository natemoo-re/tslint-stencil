
# `stencil-method-order`

Ensures that Stencil methods (`hostData`, `render`) are ordered consistently

If you wish to define where Stencil methods exist within a Component class, see `component-member-order` instead.
        

## Config

One argument, which is an object, must be provided. It should contain an `"order"` property. The `"order"` property should be an array consisting of the following strings:
    - `hostData`
    - `render`
        

### Config examples
```ts
{ "stencil-method-order": [true, { "order": ["hostData", "render"] }] }
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
          "hostData",
          "render"
        ]
      },
      "minLength": 2,
      "maxLength": 2
    }
  },
  "additionalProperties": false
}
```