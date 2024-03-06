import { Optional, OptionalValue } from "../types";
import { asUndefined, asNull } from "./basic";
import { Decoder } from "./decoder";
import { asCustom } from "./extras";

/**
 * Takes a decoder for an item of type T and returns a decoder for
 * an OptionalValue<T> (which is an alias for undefined | null | T)
 *
 * @param itemDecoder decoder for item T
 * @returns decoder for optional T
 */
export function asOptionalValue<T>(
    itemDecoder: Decoder<T>,
): Decoder<OptionalValue<T>> {
    function testFunction(arg: unknown): boolean {
        return arg === null || arg === undefined || itemDecoder.test(arg);
    }

    return asCustom(
        asUndefined.or(asNull).or(itemDecoder).decode,
        testFunction,
        `OptionalValue<${itemDecoder.name}>`,
    );
}

/**
 * Takes a decoder for an item of type T and returns a decoder for
 * an Optional<T> (which is an alias for undefined | null | T)
 *
 * @param itemDecoder decoder for item T
 * @returns decoder for optional T
 */
export function asOptional<T>(itemDecoder: Decoder<T>): Decoder<Optional<T>> {
    return asOptionalValue(itemDecoder).map(Optional.of);
}
