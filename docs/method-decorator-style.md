
# `method-decorator-style`

Ensures that component methods *(with a lowercase "m")* follow the specified style.

## Rationale
Enforces a consistent style across your components

## Config
Not configurable.

### Config examples
```ts
{ "method-decorator-style": true }
```
```ts
true,single-line
```
```ts
true,multi-line
```

## Schema
```ts
null
```

## Code Examples
**Require all decorated component methods to be multi-line.**

**✅ Pass**
```ts
@Listen('click')
handleClick() {}
```

**🚫 Fail**
```ts
@Listen('click') handleClick() {}
```
**Require all decorated component methods to be inlined.**

**✅ Pass**
```ts
@Listen('click') handleClick() {}
```

**🚫 Fail**
```ts
@Listen('click')
handleClick() {}
```