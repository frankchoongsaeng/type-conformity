import { DecodingResult } from "../types";
import { failure, success } from "../utils";
import { asNumber } from "./basic";
import { Decoder, DecoderConfig, InternDecoder } from "./decoder";
import { ObjectDecoder } from "./object";

class CustomDecoder<T> extends InternDecoder<T> {
    constructor(config: DecoderConfig<T>) {
        super(config);
    }
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
 * @param decodeFn a decode function used in decoding a value to type T
 * @param testFn an optional test function used in testing a value for conformity to type T
 * @param name an optional name of your custom decoder
 * @returns a new Decoder<T>
 */
export function asCustom<T>(
    decodeFn: (arg: unknown) => DecodingResult<T>,
    testFn?: (arg: unknown) => boolean,
    name?: string,
): Decoder<T> {
    return new CustomDecoder({
        decode: decodeFn,
        test: testFn,
        name: name ?? "custom decoder",
    });
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
    return firstDecoder.or(nextDecoder);
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
    return firstDecoder.and(nextDecoder);
}

/**
 * Decoder that only knows how to decode an Integer.
 */
export const asInt: Decoder<number> = asNumber.try(number => {
    if (Number.isInteger(number)) {
        return success(number);
    } else {
        return failure(`expected integer but got ${number}`);
    }
});
