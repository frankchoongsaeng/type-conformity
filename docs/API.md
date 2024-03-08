## :toolbox: Functions

-   [printPath](#gear-printpath)
-   [printPaths](#gear-printpaths)
-   [prettyPrintFailureError](#gear-prettyprintfailureerror)
-   [success](#gear-success)
-   [failure](#gear-failure)
-   [typeOf](#gear-typeof)
-   [isObject](#gear-isobject)
-   [isArray](#gear-isarray)

### :gear: printPath

Transform a Path to it's string representation.

| Function    | Type                     |
| ----------- | ------------------------ |
| `printPath` | `(path: Path) => string` |

Parameters:

-   `path`: Path

### :gear: printPaths

Transform an array of Path to it's string representation.

```ts
printPaths([
    { kind: "field", field: "field1" },
    { kind: "index", index: 1 },
]);
// => $root.field[1]
```

| Function     | Type                        |
| ------------ | --------------------------- |
| `printPaths` | `(paths: Path[]) => string` |

Parameters:

-   `path`: an array of Path

### :gear: prettyPrintFailureError

Pretty prints errors with the rational that multiple errors can occur in an array, or an object.

A top level decoding error always starts with "$root" (not to be confused with a field called "root")

```ts
asString.decode(1);
// $root: expected string but got number
```

An array can return multiple errors

```ts
asArray(asString).decode(["foo", 1, "bar", null]);
// $root[1]: expected string but got number
// $root[3]: expected string but got null
```

An object can return multiple errors

```ts
const decoder = asObject.withField(
    "foo",
    asArray(asObject.withField("bar", asString)),
);

decoder.decode({ foo: [{ bar: "buzz" }, { fizz: "foo" }, { bar: 2 }] });
// $root.foo[1].bar: expected string but got undefined
// $root.foo[2].bar: expected string but got number
```

| Function                  | Type                                   |
| ------------------------- | -------------------------------------- |
| `prettyPrintFailureError` | `(failure: DecodingFailure) => string` |

Parameters:

-   `errors`: all the decoding errors that occurred

### :gear: success

Constructs a DecodingSuccess of type T that wraps a value of type T.

| Function  | Type                              |
| --------- | --------------------------------- |
| `success` | `<T>(v: T) => DecodingSuccess<T>` |

Parameters:

-   `v`: value

### :gear: failure

Constructs a DecodingFailure object with a reason.

| Function  | Type                                                            |
| --------- | --------------------------------------------------------------- |
| `failure` | `(errors: DecodingError or DecodingError[]) => DecodingFailure` |

Parameters:

-   `errors`: reason for the decoding failure

### :gear: typeOf

An extension of the native javascript `typeof` test that differentiates
between null and arrays as thier own type.

| Function | Type                   |
| -------- | ---------------------- |
| `typeOf` | `(arg: any) => TypeOf` |

Parameters:

-   `arg`: value

### :gear: isObject

Checks if an argument is an object.
Applies type narrowing in typescript.

| Function   | Type                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| `isObject` | `(arg: unknown) => arg is { [k: string]: any; [k: number]: any; [k: symbol]: any; }` |

Parameters:

-   `arg`: argument to check

### :gear: isArray

Checks if an argument is an array.
Applies type narrowing in typescript.

| Function  | Type                             |
| --------- | -------------------------------- |
| `isArray` | `(arg: unknown) => arg is any[]` |

Parameters:

-   `arg`: argument to check
