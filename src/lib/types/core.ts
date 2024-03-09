/**
 * Represents a decoding success with a decoded value T
 *
 * @group Types
 * @param T type of decoded value
 */
export interface DecodingSuccess<T> {
    success: true;
    failed: false;
    value: T;
}

/**
 * A simple decoding failure message
 *
 * @group Types
 */
export type Message = string;
/**
 * A path of an object or an array
 *
 * @group Types
 */
export type Path =
    | { kind: "field"; field: Key }
    | { kind: "index"; index: number };

/**
 * A collection of decoding errors.
 *
 * @group Types
 */
export type DecodingErrors = Array<DecodingError> | DecodingError;
/**
 * A single decoding error
 *
 * @group Types
 */
export type DecodingError = Message | { path: Path; errors: DecodingErrors };

/**
 * Additional methods available on a decoding failure.
 *
 * @group Types
 */
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
     * @param T type of transformation result
     * @param fun transformer function
     */
    map<T>(fun: (message: Message, paths: Path[]) => T): T[];
}

/**
 * Represents a decoding with a decoding error.
 *
 * @group Types
 */
export interface DecodingFailure extends DecodingFailureUtils {
    success: false;
    failed: true;
    reason: string;
    errors: DecodingErrors;
}

/**
 * Represents a result of a decoding operation.
 *
 * @group Types
 * @param T type of decoding result value
 */
export type DecodingResult<T> = DecodingSuccess<T> | DecodingFailure;

/**
 * Thrown if `.parse` is called on a decoder and fails.
 *
 * @group Types
 */
export class DecodingException extends Error {}

/**
 * Types supported as key of objects
 *
 * @group Types
 */
export type Key = string | number | symbol;
/**
 * Utility for Merging keys of two objects into a union type.
 *
 * ```ts
 * // example
 * type T = JoinKeys<{foo: any, bar: any}, {fizz: any, buzz: any}>
 * // T = 'foo' | 'bar' | 'fizz' | 'buzz'
 * ```
 *
 * @group Types
 * @param T object type
 * @param U object type
 * */
export type JoinKeys<T, U> = keyof T | keyof U;

/**
 * Expands object types recursively
 *
 * @group Types
 * @param T object type to expand
 *
 * @link [Expanding object types](https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type)
 */
export type ExpandRecursively<T> = T extends object
    ? T extends infer O
        ? { [K in keyof O]: ExpandRecursively<O[K]> }
        : never
    : T;

/** M
 * Merge two object types into a single object type.
 *
 * @group Types
 * @param T object type
 * @param U object type
 */
export type Merge<T, U> = ExpandRecursively<T & U>;

/**
 * Create an object type of key K and value V.
 *
 * @group Types
 * @param K key type
 * @param V value type
 */
export type Pair<K extends Key, V> = { [P in K]: V };

/**
 * Excludes from K, fields that are assignable to T.
 *
 * @group Types
 * @param T object type to exclude key from
 * @param K key type to be excluded.
 */
export type ExcludeFromK<T, K extends keyof T> = {
    [F in keyof T as Exclude<F, K>]: T[F];
};

/**
 * Excludes a field from object type, and expand the object type.
 *
 * @group Types
 * @param T object type to exclude key from
 * @param K key type to be excluded.
 */
export type ExcludeField<T, K extends keyof T> = ExpandRecursively<
    ExcludeFromK<T, K>
>;
