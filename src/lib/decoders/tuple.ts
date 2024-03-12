import { DecodingError, DecodingFailure, DecodingResult } from "../types";
import { failure, success, isArray } from "../utils";
import { Decoder } from "./decoder";

/**
 * A tuple type.
 *
 * @group Types
 * @category Utils
 */
export type Tuple = [...any[]];
/**
 * Creates a tuple of decoders from a tuple type.
 *
 * @group Types
 * @category Utils
 */
export type TupleItemDecoders<T extends Tuple> = {
    [K in keyof T]: Decoder<T[K]>;
};

/**
 * A decoder for tuples.
 *
 * @group Types
 * @category Decoders
 */
export class TupleDecoder<T extends Tuple> extends Decoder<T> {
    constructor(private decs: TupleItemDecoders<T>) {
        super();
    }

    get name() {
        return `Tuple<${this.decs.map(d => d.name).join(", ")}>`;
    }

    protected constructIndexError(
        failure: DecodingFailure,
        index: number,
    ): DecodingError {
        return {
            path: { kind: "index", index },
            errors: failure.errors,
        };
    }

    decode(tup: unknown): DecodingResult<T> {
        if (!isArray(tup)) {
            return this.constructError(tup);
        } else {
            const decoded = [];
            for (let index = 0; index < this.decs.length; ++index) {
                const dec = this.decs[index];
                const result = dec.decode(tup[index]);
                if (result.success) {
                    decoded[index] = result.value;
                } else {
                    return failure(this.constructIndexError(result, index));
                }
            }

            return success(decoded as T);
        }
    }

    test(tup: unknown): boolean {
        return (
            isArray(tup) &&
            tup.length === this.decs.length &&
            this.decs.every((dec, idx) => dec.test(tup[idx]))
        );
    }
}

/**
 * Takes one or more decoders and produces a decoder for a Tuple of
 * elements decoder provided.
 *
 * Example
 * ```ts
 * asTuple(asConst("archived")) // Decoder<["archived"]>
 * asTuple(asString, asInt) // Decoder<[string, int]>
 * asTuple(asString, asInt, asBoolean) // Decoder<[string, int, boolean]>
 * ```
 *
 * @group Decoders
 * @param firstItemDecoder A decoder for the first tuple item
 * @param decs A variable number of decoders for the other tuple items
 * @returns A decoder for a Tuple of [T1, ...TN]
 */
export function asTuple<T1, TN extends Tuple>(
    firstItemDecoder: Decoder<T1>,
    ...decs: TupleItemDecoders<TN>
): TupleDecoder<[T1, ...TN]> {
    return new TupleDecoder<[T1, ...TN]>([firstItemDecoder, ...decs]);
}
