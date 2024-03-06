import { DecodingError, DecodingFailure, DecodingResult } from "../types";
import { failure, success } from "../utils";
import { Decoder } from "./decoder";

export class ArrayDecoder<T> extends Decoder<Array<T>> {
    constructor(private itemDecoder: Decoder<T>) {
        super();
    }

    get name() {
        return `Array<${this.itemDecoder.name}>`;
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

    decode(arr: unknown): DecodingResult<T[]> {
        if (Array.isArray(arr)) {
            const errors: DecodingError[] = [];
            const values: T[] = [];

            arr.forEach((item: unknown, idx) => {
                const result = this.itemDecoder.decode(item);

                if (result.success) {
                    values.push(result.value);
                } else {
                    errors.push(this.constructIndexError(result, idx));
                }
            });

            if (errors.length > 0) {
                return failure(errors);
            } else {
                return success(values);
            }
        } else {
            return this.constructError(arr);
        }
    }

    test(arr: unknown): boolean {
        return (
            Array.isArray(arr) && arr.every(item => this.itemDecoder.test(item))
        );
    }
}

/**
 * Takes a decoder for T, and produces a decoder that knows how to decode an
 * array of T elements, using the provided decoder.
 *
 * @param itemDecoder A decoder for the items of the array
 * @returns A decoder for an Array of T items
 */
export function asArray<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
    return new ArrayDecoder(itemDecoder);
}
