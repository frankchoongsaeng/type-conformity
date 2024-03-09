import {
    DecodingError,
    DecodingFailure,
    DecodingResult,
    Key,
    Merge,
    Pair,
    ExcludeField,
    ExpandRecursively,
} from "../types";
import { failure, isObject, success, typeOf } from "../utils";
import { Decoder, Unwrap } from "./decoder";

/**
 * A specific decoder for objects having the shape of T.
 * Has additional methods for specifying the decoding rules of it's fields.
 *
 * @group Types
 * @category Decoders
 * @param T the type of the object this decoder can decode
 */
export class ObjectDecoder<T> extends Decoder<T> {
    // the collection of fields and thier decoders
    private fields: { [key: Key]: [Decoder<any>, Key] } = {};

    /** The name of this decoder _(useful for error reporting)_. */
    get name() {
        return `{${Object.entries(this.fields)
            .map(([name, [dec]]) => String(name) + ": " + dec.name)
            .join(", ")}}`;
    }

    private constructFieldError(
        failure: DecodingFailure,
        field: Key,
    ): DecodingError {
        return {
            path: { kind: "field", field },
            errors: failure.errors,
        };
    }

    /**
     * Decodes a value and either succeeds with the decoded object or fails with a reason.
     *
     * @param arg value to decode
     */
    decode(arg: unknown): DecodingResult<T> {
        const obj: any = {};
        const errors: DecodingError[] = [];
        if (isObject(arg)) {
            Object.entries(this.fields).forEach(
                ([fieldName, [fieldCodec, alias]]) => {
                    const fieldResult = fieldCodec.decode(arg[fieldName]);
                    if (fieldResult.failed) {
                        errors.push(
                            this.constructFieldError(fieldResult, fieldName),
                        );
                    } else {
                        obj[alias] = fieldResult.value;
                    }
                },
            );
            if (errors.length > 0) {
                return failure(errors);
            } else {
                return success(obj);
            }
        } else {
            return failure(`expected object but got ${typeOf(arg)}`);
        }
    }

    test(arg: unknown): boolean {
        if (isObject(arg)) {
            for (let fieldName in this.fields) {
                const [fieldCodec] = this.fields[fieldName];
                if (!fieldCodec.test(arg[fieldName])) return false;
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Specify fields to be decoded on this object decoder.
     *
     * @param fieldName field name
     * @param fieldDecoder decoder for field
     * @returns a new object decoder with the added field
     */
    withField<K extends Key, V>(
        fieldName: K,
        fieldDecoder: Decoder<V>,
    ): ObjectDecoder<Merge<T, Pair<K, V>>> {
        return this.withFieldAlias(fieldName, fieldDecoder, fieldName);
    }

    /**
     * Same as withField but allows changing the name of the field in the decoded value.
     *
     * @param fieldName field name
     * @param fieldDecoder decoder for field
     * @param fieldAlias alias for the field name
     * @returns a new object decoder with the added field
     */
    withFieldAlias<K extends Key, V>(
        fieldName: Key,
        fieldDecoder: Decoder<V>,
        fieldAlias: K,
    ): ObjectDecoder<Merge<T, Pair<K, V>>> {
        const newObjectDecoder = new ObjectDecoder<Merge<T, Pair<K, V>>>();
        const decodingPair: [Decoder<V>, K] = [fieldDecoder, fieldAlias];
        newObjectDecoder.fields = { ...this.fields, [fieldName]: decodingPair };
        return newObjectDecoder;
    }

    /**
     * Removes a key from the object decoder.
     *
     * @param fieldName field to remove
     * @returns object decoder with field removed
     */
    withoutField<K extends keyof T>(
        fieldName: K,
    ): ObjectDecoder<ExcludeField<T, K>> {
        const newObjectDecoder = new ObjectDecoder<ExcludeField<T, K>>();
        newObjectDecoder.fields = { ...this.fields };
        // find the fieldName in aliases
        const entries = Object.entries(this.fields);
        const entry = entries.find(([_, [__, alias]]) => alias === fieldName);
        if (entry !== undefined) {
            const [mainField, _] = entry;
            delete newObjectDecoder.fields[mainField];
        }
        return newObjectDecoder;
    }

    /**
     * Takes a decoder of U and produces a decoder of T & U.
     * Returns a decoder that can decode all fields of T and U into a single object.
     *
     * @param other object decoder
     * @returns an object decoder of T & U
     */
    and<U>(other: ObjectDecoder<U>): ObjectDecoder<T & U> {
        const andDecoder = new ObjectDecoder<T & U>();
        andDecoder.fields = { ...this.fields, ...other.fields };
        return andDecoder;
    }
}

/**
 * A decoder for objects, with additional methods that are used to specify decoders for fields.
 *
 * An object decoder will and can decode from any object that is a superset of this object without failure.
 * This means that using a decoder that decodes two string fields on an object with 10 string fields will
 * succeed provided that the two fields it expects are among those 10 fields.
 *
 * The decoded value will always be exactly what was specified. No more, no less.
 *
 * example:
 * ```ts
 * asObject
 *  .withField("field1", asString) // decoder for { field1: string }
 *  .withField("field2", asBoolean) // decoder for { field1: string, field2: boolean }
 *  .withField("field3", asObject.withField("innerField", asArray(asNumber)))
 * ```
 *
 * the above produces a decoder for
 * ```ts
 *   {
 *       field1: string,
 *       field2: boolean,
 *       field3: {
 *           innerField: number[]
 *       }
 *   }
 * ```
 *
 * @group Decoders
 */
export const asObject: ObjectDecoder<{}> = new ObjectDecoder<{}>();

/**
 * An object whose values can only be Decoders.
 *
 * @group Types
 * @category Utils
 */
export type ObjectWithFieldDecoders = { [key: Key]: Decoder<any> };
/**
 * Extracts types of values from an objects with decoder values.
 *
 * @group Types
 * @category Utils
 */
export type UnwrapObjectValues<T> = ExpandRecursively<{
    [K in keyof T]: Unwrap<T[K]>;
}>;

/**
 * Utility for building object decoders using an object literal notation.
 *
 * @group Decoders
 * @param obj object literal specifying fields and their decoders
 * @returns object decoder of an infered object type.
 */
export function fromObject<T extends ObjectWithFieldDecoders>(
    obj: T,
): ObjectDecoder<UnwrapObjectValues<T>> {
    return Object.entries(obj).reduce((objDec, [fieldName, fieldDecoder]) => {
        return objDec.withField(fieldName, fieldDecoder);
    }, asObject) as ObjectDecoder<UnwrapObjectValues<T>>;
}
