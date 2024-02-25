/**
 * Represents a decoding success with a decoded value T
 */
export interface DecodingSuccess<T> {
    kind: "success";
    value: T;
}

/**
 * Represents a decoding failure with a failure message
 */
export interface DecodingFailure {
    kind: "failure";
    reason: string;
}

/**
 * Represents a result of a decoding operation.
 */
export type DecodingResult<T> = DecodingSuccess<T> | DecodingFailure;

export type JoinKeys<T, U> = keyof T | keyof U;
export type Key = string | number;
export type Merge<T, U> = {
    [P in JoinKeys<T, U>]: P extends keyof T
        ? T[P]
        : P extends keyof U
          ? U[P]
          : never;
};

/**
 * A decoder for T - has just one function `decode`; that decodes a value
 * into a type T or a fails with a reason.
 */
export interface Decoder<T> {
    name: string; // useful for debugging, best to use the name of the type here
    decode(obj: any): DecodingResult<T>;
    test(obj: any): boolean;
}

/**
 * A specif decoder for objects having the shape of T.
 * Has additional methods for specifying the decoding rules of it's fields.
 */
export interface ObjectDecoder<T> extends Decoder<T> {
    readonly name: "object" | string;
    readonly fields: Array<[Key, Decoder<any>, Key?]>;
    withField<K extends Key, V>(
        name: K,
        fieldDecoder: Decoder<V>,
    ): ObjectDecoder<Merge<T, { [P in K]: V }>>;
    withFieldAlias<K extends Key, V>(
        name: Key,
        fieldDecoder: Decoder<V>,
        alias: K,
    ): ObjectDecoder<Merge<T, { [P in K]: V }>>;
    decode(obj: any): DecodingResult<T>;
}

/**
 * A special Optional type that encourages the move away from null and undefined.
 * This type is a wrapper type of T | null | undefined but I provide some useful
 * utilities for working with Optionals in a functional and type safe manner.
 */
export type Optional<T> = T | null | undefined;
