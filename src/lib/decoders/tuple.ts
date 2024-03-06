import { DecodingResult } from "../types";
import { typeOf, failure, success, isArray } from "../utils";
import { ArrayDecoder } from "./array";
import { asBoolean, asNull, asString } from "./basic";
import { Decoder } from "./decoder";

type Tuple = [...any[]];
type TupleItemDecoders<T extends Tuple> = {
    [K in keyof T]: Decoder<T[K]>;
};

export class TupleDecoder<T extends Tuple> extends ArrayDecoder<T> {
    constructor(private decs: TupleItemDecoders<T>) {
        super(decs[0]);
    }

    get name() {
        return `Tuple<${this.decs.map(d => d.name).join(", ")}>`;
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
): TupleDecoder<[T1, T2]> {
    return new TupleDecoder<[T1, T2]>([t1Dec, t2Dec]);
}

/**
 * Takes one or more decoders and produces a decoder for a Tuple of
 * elements decoder provided.
 *
 * @param firstItemDecoder A decoder for the first tuple item
 * @param decs A variable number of decoders for the other tuple items
 * @returns A decoder for a Tuple of [T1, ...TN]
 */
export function asTupleN<T1, TN extends Tuple>(
    firstItemDecoder: Decoder<T1>,
    ...decs: TupleItemDecoders<TN>
): TupleDecoder<[T1, ...TN]> {
    return new TupleDecoder<[T1, ...TN]>([firstItemDecoder, ...decs]);
}

const t = asTupleN(asString, asBoolean, asNull);
