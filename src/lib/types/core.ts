/**
 * Represents a decoding success with a decoded value T
 */
export interface DecodingSuccess<T> {
    success: true;
    failed: false;
    value: T;
}

/** A simple decoding failure message */
export type Message = string;
/** A decoding failure path of an object or an array */
export type Path =
    | { kind: "field"; field: Key }
    | { kind: "index"; index: number };
export type DecodingErrors = Array<DecodingError> | DecodingError;
/**
 * A decoding error that is either a message or an
 * array of decoding errors that occurred at a path.
 * */
export type DecodingError = Message | { path: Path; errors: DecodingErrors };

export interface DecodingFailureUtils {
    /**
     * Combine this decoding failure with another decoding failure.
     *
     * @param errors Decoding failure to combine with this.
     */
    concat(errors: DecodingFailure): DecodingErrors;
    /**
     * Apply an operation on every decoding error and
     * an array of paths where that error occurred.
     *
     * @param fun operation
     */
    foreach(fun: (message: Message, paths: Path[]) => void): void;
    /**
     * Transform decoding errors by applying a transformer on every
     * error and an array of paths where that error occurred.
     *
     * @param fun transformer function
     */
    map<T>(fun: (message: Message, paths: Path[]) => T): T[];
}
/** Represents a decoding with a decoding error */
export interface DecodingFailure extends DecodingFailureUtils {
    success: false;
    failed: true;
    reason: string;
    errors: DecodingErrors;
}

/**
 * Represents a result of a decoding operation.
 */
export type DecodingResult<T> = DecodingSuccess<T> | DecodingFailure;

/** Thrown if decodeOrDie is called */
export class DecodingException extends Error {}

/** Types supported as key of objects */
export type Key = string | number | symbol;
/**
 * Utility for Merging keys of two objects into a union type.
 *
 * ```ts
 * // example
 * type T = JoinKeys<{foo: any, bar: any}, {fizz: any, buzz: any}>
 * // T = 'foo' | 'bar' | 'fizz' | 'buzz'
 * ```
 * */
export type JoinKeys<T, U> = keyof T | keyof U;

/**
 * Expands object types recursively
 * https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type
 */
type ExpandRecursively<T> = T extends object
    ? T extends infer O
        ? { [K in keyof O]: ExpandRecursively<O[K]> }
        : never
    : T;

/** Merge two object types into a single object type. */
export type Merge<T, U> = ExpandRecursively<T & U>;

/** Create an object type of key K and value V. */
export type Pair<K extends Key, V> = { [P in K]: V };

/** Excludes from K, fields that are assignable to T. */
export type ExcludeFromK<T, K extends keyof T> = {
    [F in keyof T as Exclude<F, K>]: T[F];
};

/** Excludes a field from object type */
export type ExcludeField<T, K extends keyof T> = ExpandRecursively<
    ExcludeFromK<T, K>
>;
