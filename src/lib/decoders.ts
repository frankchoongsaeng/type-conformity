import {
    DecodingFailure,
    DecodingResult,
    Decoder as Decoder,
    Key,
    Merge,
    ObjectDecoder,
    Optional,
} from "./types";
import {
    failure,
    objectDecoderHelper,
    success,
    typeOf,
    withFieldHelper,
} from "./utils";

/**
 * A decoder that can only decode value of undefined.
 */
export const asUndefined: Decoder<undefined> = {
    name: "undefined",
    decode(arg): DecodingResult<undefined> {
        if (arg === undefined) return success(undefined);
        else return failure(`expected undefined but got ${typeOf(arg)}`);
    },
    test(arg) {
        return arg === undefined;
    },
};

/**
 * A decoder that can only decode value of null.
 */
export const asNull: Decoder<null> = {
    name: "null",
    decode(arg): DecodingResult<null> {
        if (arg === null) return success(null);
        else return failure(`expected a null but got ${typeOf(arg)}`);
    },
    test(arg) {
        return arg === null;
    },
};

/**
 * A decoder that can only decode a string.
 */
export const asString: Decoder<string> = {
    name: "string",
    decode(str): DecodingResult<string> {
        return typeof str === "string"
            ? success(str)
            : failure(`expected a string but got ${typeOf(str)}`);
    },
    test(str) {
        return typeOf(str) === "string";
    },
};

/**
 * A decoder that can only decode a number.
 */
export const asNumber: Decoder<number> = {
    name: "number",
    decode(num): DecodingResult<number> {
        return typeof num === "number"
            ? success(num)
            : failure(`expected a number but got ${typeOf(num)}`);
    },
    test(num) {
        return typeOf(num) === "number";
    },
};

/**
 * A decoder that can only decode a boolean.
 */
export const asBoolean: Decoder<boolean> = {
    name: "boolean",
    decode(bool): DecodingResult<boolean> {
        return typeof bool === "boolean"
            ? success(bool)
            : failure(`expected a boolean but got ${typeOf(bool)}`);
    },
    test(bool) {
        return typeOf(bool) === "boolean";
    },
};

/**
 * A decoder for objects, with additional methods that are used to specify decoders for fields.
 *
 * An object decoder will and can decode from any object that is a superset of this object without failure.
 * This means that using a decoder that decodes two string fields on an object with 10 string fields will
 * succeed provided that the two fields it expects are among those 10 fields.
 *
 * The decoded value will always be exactly what was specified. No more, no less.
 *
 * example:
 * ```ts
 * asObject
 *  .withField("field1", asString) // decoder for { field1: string }
 *  .withField("field2", asBoolean) // decoder for { field1: string, field2: boolean }
 *  .withField("field3", asObject.withField("innerField", asArray(asNumber)))
 *
 * // produces a decoder
 * //   {
 * //       field1: string,
 * //       field2: boolean,
 * //       field3: {
 * //           innerField: number[]
 * //       }
 * //   }
 * ```
 */
export const asObject: ObjectDecoder<{}> = {
    get name() {
        return `{ ${this.fields
            .map(([name, dec]) => name + ": " + dec.name)
            .join(", ")} }`;
    },
    fields: [],
    withField<K extends Key, V>(
        name: K,
        fieldDecoder: Decoder<V>,
    ): ObjectDecoder<Merge<{}, { [P in K]: V }>> {
        return withFieldHelper(this, name, fieldDecoder);
    },
    withFieldAlias<K extends Key, V>(
        name: Key,
        fieldDecoder: Decoder<V>,
        alias: K,
    ): ObjectDecoder<Merge<{}, { [P in K]: V }>> {
        return withFieldHelper(this, name, fieldDecoder, alias);
    },
    decode(arg): DecodingResult<{}> {
        return objectDecoderHelper(arg, this);
    },
    test(arg) {
        return typeOf(arg) === "object";
    },
};

/**
 * Takes a decoder for T, and produces a decoder that knows how to decode an
 * array of T elements, using the provided decoder.
 *
 * @param itemDecoder A decoder for the items of the array
 * @returns A decoder for an Array of T items
 */
export function asArray<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
    return {
        name: `Array<${itemDecoder.name}>`,
        decode(arr): DecodingResult<Array<T>> {
            if (Array.isArray(arr)) {
                const errors: string[] = [];
                const values: any[] = [];

                arr.forEach((item: any, idx) => {
                    const result = itemDecoder.decode(item);

                    if (result.kind === "success") {
                        values.push(result.value);
                    } else {
                        errors.push(
                            `decoding failure at index ${idx}: ${result.reason}`,
                        );
                    }
                });

                if (errors.length > 0) {
                    return failure(errors.join("\n"));
                } else {
                    return success(values as T[]);
                }
            } else {
                return failure(`expected an array but got ${typeOf(arr)}`);
            }
        },
        test(arr) {
            return (
                Array.isArray(arr) && arr.every(item => itemDecoder.test(item))
            );
        },
    };
}

/**
 * Takes two decoders for T1 and T2, and produces a decoder that can decode a
 * Tuple of [T1, T2] elements, using the provided decoders.
 *
 * @param t1Dec A decoder for the first tuple item
 * @param t2Dec A decoder for the second tuple item
 * @returns A decoder for a Tuple of T1 and T2
 */
export function asTuple2<T1, T2>(
    t1Dec: Decoder<T1>,
    t2Dec: Decoder<T2>,
): Decoder<[T1, T2]> {
    return {
        name: `Tuple2<${t1Dec.name}, ${t2Dec.name}>`,
        decode(tup): DecodingResult<[T1, T2]> {
            if (typeOf(tup) !== "array") {
                return failure(`expected a tuple but got ${typeOf(tup)}`);
            }
            if ((tup as any[]).length !== 2) {
                return failure(
                    `expected a tuple of exactly 2 elements but got an array of length ${
                        (tup as any[]).length
                    }`,
                );
            } else {
                const first = t1Dec.decode(tup[0]);
                if (first.kind === "success") {
                    const next = t2Dec.decode(tup[1]);
                    if (next.kind === "success") {
                        return success([first.value, next.value]);
                    }

                    return failure(
                        `second tuple element decoding failure: ${next.reason}`,
                    );
                }

                return failure(
                    `first tuple element decoding failure: ${first.reason}`,
                );
            }
        },
        test(tup) {
            return (
                Array.isArray(tup) &&
                tup.length === 2 &&
                t1Dec.test(tup[0]) &&
                t2Dec.test(tup[1])
            );
        },
    };
}

/**
 * Takes three decoders for T1, T2, T3, and produces a decoder that can decode a
 * Tuple of [T1, T2, T3] elements, using the provided decoders.
 *
 * @param t1Dec A decoder for the first tuple item
 * @param t2Dec A decoder for the second tuple item
 * @param t3Dec A decoder for the third tuple item
 * @returns A decoder for a Tuple of [T1, T2, T3]
 */
export function asTuple3<T1, T2, T3>(
    t1Dec: Decoder<T1>,
    t2Dec: Decoder<T2>,
    t3Dec: Decoder<T3>,
): Decoder<[T1, T2, T3]> {
    return {
        name: `Tuple3<${t1Dec.name}, ${t2Dec.name}, ${t3Dec.name}>`,
        decode(tup: any): DecodingResult<[T1, T2, T3]> {
            if (typeOf(tup) !== "array") {
                return failure(`expected a tuple but got ${typeOf(tup)}`);
            } else if ((tup as any[]).length !== 3) {
                return failure(
                    `expected a tuple of exactly 3 elements but got an array of length ${
                        (tup as any[]).length
                    }`,
                );
            } else {
                const first = t1Dec.decode(tup[0]);
                if (first.kind === "success") {
                    const second = t2Dec.decode(tup[1]);
                    if (second.kind === "success") {
                        const third = t3Dec.decode(tup[2]);
                        if (third.kind === "success") {
                            return success([
                                first.value,
                                second.value,
                                third.value,
                            ]);
                        }

                        return failure(
                            `third tuple element decoding failure: ${third.reason}`,
                        );
                    }

                    return failure(
                        `second tuple element decoding failure: ${second.reason}`,
                    );
                }

                return failure(
                    `first tuple element decoding failure: ${first.reason}`,
                );
            }
        },
        test(tup) {
            return (
                Array.isArray(tup) &&
                tup.length === 3 &&
                t1Dec.test(tup[0]) &&
                t2Dec.test(tup[1]) &&
                t3Dec.test(tup[2])
            );
        },
    };
}

/**
 * A function that takes two decoders and produces a decoder of the union of both values.
 *
 * Useful for composing decoders that can decode many types
 * example:
 * ```ts
 * asOneOf(asString, asNumber) // produces a decoder for string | number
 * asOneOf(asString, asOneOf(asNumber, asBoolean)) // produces a decoder for string | number | boolean
 * ```
 *
 * @param firstDecoder decoder for first type T
 * @param nextDecoder decoder for next type U
 * @returns A decoder for decoding T | U
 */
export function asOneOf<T, U>(
    firstDecoder: Decoder<T>,
    nextDecoder: Decoder<U>,
): Decoder<T | U> {
    return {
        name: `${firstDecoder.name} | ${nextDecoder.name}`,
        decode(arg): DecodingResult<T | U> {
            const first = firstDecoder.decode(arg);
            if (first.kind === "success") {
                return first;
            }

            const next = nextDecoder.decode(arg);
            if (next.kind === "success") {
                return next;
            }

            return failure(
                `failed to decode as ${this.name}:\n - ${first.reason}\n - ${next.reason}`,
            );
        },
        test(arg) {
            return firstDecoder.test(arg) || nextDecoder.test(arg);
        },
    };
}

/**
 * A function that takes two object decoders and produces a decoder of the intersection of both values.
 *
 * Useful for composing decoders that decode a larger object.
 *
 * example:
 * ```ts
 * type Foo = { foo: String }
 * type Bar = { bar: boolean }
 * const asFoo = asObject.withField("foo", asString)
 * const asBar = asObject.withField("bar", asBoolean)
 * asBothOf<Foo, Bar>(asFoo, asBar) // produces an object decoder for Foo & Bar
 * ```
 *
 * @param firstDecoder decoder for first type T
 * @param nextDecoder decoder for next type U
 * @returns A decoder for decoding T | U
 */
export function asBothOf<T, U>(
    firstDecoder: ObjectDecoder<T>,
    nextDecoder: ObjectDecoder<U>,
): ObjectDecoder<T & U> {
    return {
        get name() {
            return `${firstDecoder.name} & ${nextDecoder.name}`;
        },
        get fields() {
            return [...firstDecoder.fields, ...nextDecoder.fields];
        },
        withField(name, fieldDecoder) {
            return withFieldHelper(this, name, fieldDecoder);
        },
        withFieldAlias<K extends Key, V>(
            name: Key,
            fieldDecoder: Decoder<V>,
            alias: K,
        ) {
            return withFieldHelper<T & U, K, V, Merge<T & U, { [P in K]: V }>>(
                this,
                name as K,
                fieldDecoder,
                alias,
            );
        },
        decode(arg): DecodingResult<T & U> {
            return objectDecoderHelper(arg, this);
        },
        test(arg) {
            return firstDecoder.test(arg) && nextDecoder.test(arg);
        },
    };
}

/**
 * Takes a literal value and produces a decoder that can only decode that value.
 *
 * example:
 * ```ts
 * const d1: Decoder<2> = asLiteral(2)
 * const d2: Decoder<"accepted"> = asLiteral("accepted")
 * const d3: Decoder<true> = asLiteral(true)
 * ```
 *
 * @param lit literal value to decode for
 * @returns decoder for literal value
 */
export function asLiteral<L extends string | number | boolean>(
    lit: L,
): Decoder<L> {
    return {
        name: String(lit),
        decode(arg: any) {
            if (
                typeOf(lit) === "string" ||
                typeOf(lit) === "boolean" ||
                typeOf(lit) === "number"
            ) {
                if (arg === lit) return success(lit);
                return failure(`expected literal value ${lit} but got ${arg}`);
            }
            return failure(
                `asLiteral should be used with string | boolean | number but was used with ${typeOf(
                    arg,
                )}`,
            );
        },
        test(arg) {
            if (
                typeOf(lit) === "string" ||
                typeOf(lit) === "boolean" ||
                typeOf(lit) === "number"
            ) {
                if (arg === lit) return lit === arg;
            }
            return false;
        },
    };
}

/**
 * Takes a decoder for an item of type T and returns a decoder for a
 * special Optional<T>
 *
 * @param itemDecoder decoder for item T
 * @returns decoder for optional T
 */
export function asOptional<T>(itemDecoder: Decoder<T>): Decoder<Optional<T>> {
    return asCustom(
        asOneOf(asUndefined, asOneOf(asNull, itemDecoder)).decode,
        arg => {
            return arg === null || arg === undefined || itemDecoder.test(arg);
        },
        `Optional<${itemDecoder.name}>`,
    );
}

/**
 * A way of creating custom decoders that can decoder a value into a specified type T.
 * Useful only when utility for decoding your desired value doesn't exist.
 *
 * example:
 * ```ts
 * // a decoder for decoding a string that should be one of 3 valid
 * // values: 'accepted', 'rejected', 'in-review'
 * const customDecoder = asCustom((value) => {
 *      if (value === 'accepted' || value === 'rejected' || value === 'in-review')
 *          return success(value)
 *      return failure(`failed to decode value, expected one of 'accepted', 'rejected', 'in-review' but got ${value}`)
 *}, 'status decoder')
 * ```
 * @param decodeFn a decode function use in decoding a value to type T
 * @param name an optional name of your custom decoder
 * @returns a new Decoder<T>
 */
export function asCustom<T>(
    decodeFn: (arg: any) => DecodingResult<T>,
    testFn?: (arg: any) => boolean,
    name?: string,
): Decoder<T> {
    return {
        decode: decodeFn,
        test: testFn ?? (arg => decodeFn(arg).kind === "success"),
        name: name ?? "custom decoder",
    };
}
