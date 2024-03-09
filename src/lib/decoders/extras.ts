import { DecodingResult } from "../types";
import { failure, success } from "../utils";
import { asNumber } from "./basic";
import { Decoder, DecoderConfig, InternDecoder } from "./decoder";

/**
 * For creation of custom decoders.
 *
 * @group Types
 * @category Decoders
 */
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
 *
 * @group Decoders
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
 * Decoder that only knows how to decode an Integer.
 *
 * @group Decoders
 */
export const asInt: Decoder<number> = asNumber.try(number => {
    if (Number.isInteger(number)) {
        return success(number);
    } else {
        return failure(`expected integer but got ${number}`);
    }
});

/**
 * A decoder that can decode anything.
 * It sets the type as `any`.
 *
 * @group Decoders
 */
export const asAny: Decoder<any> = new CustomDecoder({
    name: "any",
    decode: arg => success(arg),
    test: () => true,
});

/**
 * Similar to `asAny`, but sets the type to `unknown`.
 *
 * @group Decoders
 */
export const asUnknown: Decoder<unknown> = new CustomDecoder({
    name: "unknown",
    decode: arg => success(arg),
    test: () => true,
});
