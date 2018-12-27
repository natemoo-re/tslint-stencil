
# `lifecycle-order`

Ensures that Component lifecycle methods are ordered consistently

## Rationale

A consistent ordering for Component lifecycle methods can make Components easier to read, navigate, and edit.

Ordering lifecycle methods by their natural call order (`call-order`) makes the functionality of each self-documenting.
        

## Config

This rule optionally accepts a single argument, which is a string. It should be one of the following values:
- `call-order`
- `alphabetical`

If no argument is provided, this rule will enforce the default functionality (which matches that of `call-order`.)
        

### Config examples
```ts
{ "lifecycle-order": [true, "call-order"] }
```
```ts
{ "lifecycle-order": [true, "alphabetical"] }
```

## Schema
```ts
{
  "type": "array",
  "items": {
    "type": "string",
    "enum": [
      "alphabetical",
      "call-order"
    ]
  },
  "minLength": 0,
  "maxLength": 2
}
```

## Code Examples
- Order lifecycle methods by their natural call order (`call-order` or `default`)
    
    **⚙️ Config**
    ```ts
    "rules": { "lifecycle-order": [true, "call-order"] }
    ```
    
    **✅ Pass**
    ```ts
    componentWillLoad() { }
    componentDidLoad() { }
    componentWillUpdate() { }
    componentDidUpdate() { }
    componentDidUnload() { }
    ```

- Order lifecycle methods alphabetically (`alphabetical`)
    
    **⚙️ Config**
    ```ts
    "rules": { "lifecycle-order": [true, "alphabetical"] }
    ```
    
    **✅ Pass**
    ```ts
    componentDidLoad() { }
    componentDidUnload() { }
    componentDidUpdate() { }
    componentWillLoad() { }
    componentWillUpdate() { }
    ```
