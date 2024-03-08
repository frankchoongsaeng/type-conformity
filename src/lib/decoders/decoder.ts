import { DecodingException, DecodingFailure, DecodingResult } from "../types";
import { failure, success, typeOf } from "../utils";

/**
 * A decoder for T - has just one function `decode`; that decodes a value
 * into a type T or a fails with a reason.
 */
export interface DecoderConfig<T> {
    name: string; // useful for debugging, best to use the name of the type here
    decode(arg: unknown): DecodingResult<T>;
    test?(arg: unknown): boolean;
}

/**
 * A decoder for T - has just one function `decode`; that decodes a value
 * into a type T or a fails with a reason.
 */
export abstract class Decoder<T> implements DecoderConfig<T> {
    abstract name: string;

    /**
     * Decodes a value and either succeeds with the decoded value or fails with a reason.
     *
     * @param arg value to decode
     */
    abstract decode(arg: unknown): DecodingResult<T>;

    /**
     * Similar to `decode`, but throws an error if decoding fails.
     *
     * @param arg value to decode
     * @returns decoded value
     */
    parse(arg: unknown): T {
        const result = this.decode(arg);
        if (result.failed) throw new DecodingException(result.reason);
        return result.value;
    }

    /**
     * Tests if a value can be decoded by this decoder.
     *
     * @param arg value to test
     */
    abstract test(arg: unknown): boolean;

    protected decodeAsTest(arg: unknown): boolean {
        return this.decode(arg).success;
    }

    /**
     * Makes it possible to apply some transformation on a decoded value.
     *
     * ```ts
     * const asInt = asNumber.transform(num => parseInt(num))
     * asInt.decodeOrDie(117.565) // produces 117
     * ```
     *
     * @param transformer transformer function
     * @returns a decoder of the transformed value
     */
    transform<U>(transformer: (decoded: T) => U): Decoder<U> {
        const config: Partial<DecoderConfig<U>> = {};
        config.name = this.name;
        config.decode = (obj: unknown) => {
            const result = this.decode(obj);
            if (result.success) {
                return success(transformer(result.value));
            }

            return result;
        };
        return new InternDecoder<U>(config as DecoderConfig<U>);
    }

    /**
     * An alias for `transform`.
     *
     * @param tranformer transformer function
     * @returns a decoder of the transformed value
     */
    map<U>(tranformer: (decoded: T) => U): Decoder<U> {
        return this.transform(tranformer);
    }

    /**
     * Applies an operation that can also fail to this decoder.
     *
     * ```ts
     * const asInt = asNumber.try(num => {
     *      if (Number.isInteger(number))  return success(num)
     *      else return failure("expected integer but got " + num)
     * })
     * asInt.decodeOrDie(117.565) // throws error - $root: expected integer but got 117.565
     * ```
     *
     * @param operation operation to apply post decoding
     * @returns a decoder
     */
    try<U>(operation: (decoded: T) => DecodingResult<U>): Decoder<U> {
        const config: Partial<DecoderConfig<U>> = {};
        config.name = this.name;
        config.decode = (obj: unknown) => {
            const result = this.decode(obj);
            if (result.success) {
                return operation(result.value);
            }

            return result;
        };

        return new InternDecoder<U>(config as DecoderConfig<U>);
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
    or<U>(other: Decoder<U>): Decoder<T | U> {
        const config: Partial<DecoderConfig<T | U>> = {};
        config.name = `${this.name} | ${other.name}`;
        config.decode = (arg: unknown) => {
            const first = this.decode(arg);
            if (first.success) {
                return first;
            }

            const next = other.decode(arg);
            if (next.success) {
                return next;
            }

            return failure(first.concat(next));
        };
        config.test = (arg: unknown) => {
            return this.test(arg) || other.test(arg);
        };
        return new InternDecoder(config as DecoderConfig<T | U>);
    }

    protected constructError(arg: unknown): DecodingFailure {
        return failure(`expected ${this.name} but got ${typeOf(arg)}`);
    }
}

export class InternDecoder<T> extends Decoder<T> {
    name: string;

    decode: (_: unknown) => DecodingResult<T>;

    test: (_: unknown) => boolean;

    constructor(config: DecoderConfig<T>) {
        super();
        this.name = config.name;
        this.decode = config.decode;
        this.test = config.test ?? this.decodeAsTest;
    }
}

/** Unwrap a Decoder<T> to T */
export type Unwrap<T> = T extends Decoder<infer U> ? U : T;
