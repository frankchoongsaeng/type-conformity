/**
 * Represents a decoding success with a decoded value T
 */
export interface DecodingSuccess<T> {
    success: true;
    failed: false;
    value: T;
}

export class DecodingException extends Error {}

type Message = string;
export type Path =
    | { kind: "field"; field: Key }
    | { kind: "index"; index: number };
export type DecodingError =
    | Message
    | { path: Path; errors: Array<DecodingError> | DecodingError };
/**
 * Represents a decoding failure with a failure message
 */
export interface DecodingFailure {
    success: false;
    failed: true;
    get reason(): string;
    errors: Array<DecodingError> | DecodingError;
    concat(errors: DecodingFailure): Array<DecodingError> | DecodingError;
}

/**
 * Represents a result of a decoding operation.
 */
export type DecodingResult<T> = DecodingSuccess<T> | DecodingFailure;

export type Key = string | number | symbol;
export type JoinKeys<T, U> = keyof T | keyof U;

// expands object types recursively
// https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type
type ExpandRecursively<T> = T extends object
    ? T extends infer O
        ? { [K in keyof O]: ExpandRecursively<O[K]> }
        : never
    : T;

export type Merge<T, U> = ExpandRecursively<T & U>;

export type Pair<K extends Key, V> = { [P in K]: V };

export type ObjectWithoutKey<T, K extends keyof T> = {
    [F in keyof T as Exclude<F, K>]: T[F];
};

export type WithoutKey<T, K extends keyof T> = ExpandRecursively<
    ObjectWithoutKey<T, K>
>;
