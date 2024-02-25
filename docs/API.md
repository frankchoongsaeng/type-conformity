## :toolbox: Functions

-   [success](#gear-success)
-   [failure](#gear-failure)
-   [objectDecoderHelper](#gear-objectdecoderhelper)
-   [withFieldHelper](#gear-withfieldhelper)
-   [typeOf](#gear-typeof)
-   [asArray](#gear-asarray)
-   [asTuple2](#gear-astuple2)
-   [asTuple3](#gear-astuple3)
-   [asOneOf](#gear-asoneof)
-   [asBothOf](#gear-asbothof)
-   [asLiteral](#gear-asliteral)
-   [asOptional](#gear-asoptional)
-   [asCustom](#gear-ascustom)

### :gear: success

Constructs a DecodingSuccess of type T that wraps a value of type T.

| Function  | Type                              |
| --------- | --------------------------------- |
| `success` | `<T>(v: T) => DecodingSuccess<T>` |

Parameters:

-   `v`: value

### :gear: failure

Constructs a DecodingFailure object with a reason.

| Function  | Type                                  |
| --------- | ------------------------------------- |
| `failure` | `(reason: string) => DecodingFailure` |

Parameters:

-   `reason`: reason for the decoding failure

### :gear: objectDecoderHelper

| Function              | Type                                                               |
| --------------------- | ------------------------------------------------------------------ |
| `objectDecoderHelper` | `<T>(arg: any, objDecoder: ObjectDecoder<T>) => DecodingResult<T>` |

### :gear: withFieldHelper

| Function          | Type                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withFieldHelper` | `<A, K extends Key, V, B extends Merge<A, { [P in K]: V; }>>(prevObjectCodec: ObjectDecoder<A>, name: K, fieldDecoder: Decoder<V>, alias?: Key) => ObjectDecoder<...>` |

### :gear: typeOf

An extension of the native javascript `typeof` test that differentiates
between null and arrays as thier own type.

| Function | Type                   |
| -------- | ---------------------- |
| `typeOf` | `(arg: any) => TypeOf` |

Parameters:

-   `arg`: value

### :gear: asArray

Takes a decoder for T, and produces a decoder that knows how to decode an
array of T elements, using the provided decoder.

| Function  | Type                                           |
| --------- | ---------------------------------------------- |
| `asArray` | `<T>(itemDecoder: Decoder<T>) => Decoder<T[]>` |

Parameters:

-   `itemDecoder`: A decoder for the items of the array

### :gear: asTuple2

Takes two decoders for T1 and T2, and produces a decoder that can decode a
Tuple of [T1, T2] elements, using the provided decoders.

| Function   | Type                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| `asTuple2` | `<T1, T2>(t1Dec: Decoder<T1>, t2Dec: Decoder<T2>) => Decoder<[T1, T2]>` |

Parameters:

-   `t1Dec`: A decoder for the first tuple item
-   `t2Dec`: A decoder for the second tuple item

### :gear: asTuple3

Takes three decoders for T1, T2, T3, and produces a decoder that can decode a
Tuple of [T1, T2, T3] elements, using the provided decoders.

| Function   | Type                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `asTuple3` | `<T1, T2, T3>(t1Dec: Decoder<T1>, t2Dec: Decoder<T2>, t3Dec: Decoder<T3>) => Decoder<[T1, T2, T3]>` |

Parameters:

-   `t1Dec`: A decoder for the first tuple item
-   `t2Dec`: A decoder for the second tuple item
-   `t3Dec`: A decoder for the third tuple item

### :gear: asOneOf

A function that takes two decoders and produces a decoder of the union of both values.

Useful for composing decoders that can decode many types
example:

```ts
asOneOf(asString, asNumber); // produces a decoder for string | number
asOneOf(asString, asOneOf(asNumber, asBoolean)); // produces a decoder for string | number | boolean
```

| Function  | Type                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| `asOneOf` | `<T, U>(firstDecoder: Decoder<T>, nextDecoder: Decoder<U>) => Decoder<T or U>` |

Parameters:

-   `firstDecoder`: decoder for first type T
-   `nextDecoder`: decoder for next type U

### :gear: asBothOf

A function that takes two object decoders and produces a decoder of the intersection of both values.

Useful for composing decoders that decode a larger object.

example:

```ts
type Foo = { foo: String };
type Bar = { bar: boolean };
const asFoo = asObject.withField("foo", asString);
const asBar = asObject.withField("bar", asBoolean);
asBothOf<Foo, Bar>(asFoo, asBar); // produces an object decoder for Foo & Bar
```

| Function   | Type                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `asBothOf` | `<T, U>(firstDecoder: ObjectDecoder<T>, nextDecoder: ObjectDecoder<U>) => ObjectDecoder<T and U>` |

Parameters:

-   `firstDecoder`: decoder for first type T
-   `nextDecoder`: decoder for next type U

### :gear: asLiteral

Takes a literal value and produces a decoder that can only decode that value.

example:

```ts
const d1: Decoder<2> = asLiteral(2);
const d2: Decoder<"accepted"> = asLiteral("accepted");
const d3: Decoder<true> = asLiteral(true);
```

| Function    | Type                                                            |
| ----------- | --------------------------------------------------------------- |
| `asLiteral` | `<L extends string or number or boolean>(lit: L) => Decoder<L>` |

Parameters:

-   `lit`: literal value to decode for

### :gear: asOptional

Takes a decoder for an item of type T and returns a decoder for a
special Optional<T>

| Function     | Type                                         |
| ------------ | -------------------------------------------- |
| `asOptional` | `<T>(itemDecoder: Decoder<T>) => Decoder<T>` |

Parameters:

-   `itemDecoder`: decoder for item T

### :gear: asCustom

A way of creating custom decoders that can decoder a value into a specified type T.
Useful only when utility for decoding your desired value doesn't exist.

example:

```ts
// a decoder for decoding a string that should be one of 3 valid
// values: 'accepted', 'rejected', 'in-review'
const customDecoder = asCustom(value => {
    if (value === "accepted" || value === "rejected" || value === "in-review")
        return success(value);
    return failure(
        `failed to decode value, expected one of 'accepted', 'rejected', 'in-review' but got ${value}`,
    );
}, "status decoder");
```

| Function   | Type                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `asCustom` | `<T>(decodeFn: (arg: any) => DecodingResult<T>, testFn?: (arg: any) => boolean, name?: string) => Decoder<T>` |

Parameters:

-   `decodeFn`: a decode function use in decoding a value to type T
-   `name`: an optional name of your custom decoder

## :wrench: Constants

-   [asUndefined](#gear-asundefined)
-   [asNull](#gear-asnull)
-   [asString](#gear-asstring)
-   [asNumber](#gear-asnumber)
-   [asBoolean](#gear-asboolean)

### :gear: asUndefined

A decoder that can only decode value of undefined.

| Constant      | Type                 |
| ------------- | -------------------- |
| `asUndefined` | `Decoder<undefined>` |

### :gear: asNull

A decoder that can only decode value of null.

| Constant | Type            |
| -------- | --------------- |
| `asNull` | `Decoder<null>` |

### :gear: asString

A decoder that can only decode a string.

| Constant   | Type              |
| ---------- | ----------------- |
| `asString` | `Decoder<string>` |

### :gear: asNumber

A decoder that can only decode a number.

| Constant   | Type              |
| ---------- | ----------------- |
| `asNumber` | `Decoder<number>` |

### :gear: asBoolean

A decoder that can only decode a boolean.

| Constant    | Type               |
| ----------- | ------------------ |
| `asBoolean` | `Decoder<boolean>` |
