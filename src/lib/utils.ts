import {
    Decoder,
    DecodingFailure,
    DecodingResult,
    DecodingSuccess,
    Key,
    Merge,
    ObjectDecoder,
} from "../types";

export function success<T>(v: T): DecodingSuccess<T> {
    return {
        kind: "success",
        value: v,
    };
}

export function failure(message: string): DecodingFailure {
    return {
        kind: "failure",
        reason: message,
    };
}

export function objectDecoderHelper<T>(
    arg: any,
    objDecoder: ObjectDecoder<T>,
): DecodingResult<T> {
    const obj: any = {};
    const errors: string[] = [];
    if (typeOf(arg) === "object") {
        objDecoder.fields.forEach(([fieldName, fieldCodec, alias]) => {
            const fieldValue = fieldCodec.decode(arg[fieldName]);
            if (fieldValue.kind === "failure") {
                errors.push(
                    `error while decoding field - ${fieldName}, ${fieldValue.reason}`,
                );
            } else {
                obj[alias ?? fieldName] = fieldValue.value;
            }
        });
        if (errors.length > 0) {
            return failure(errors.join("\n"));
        } else {
            return success(obj);
        }
    } else {
        return failure(`expected an object but got ${typeOf(arg)}`);
    }
}

export function withFieldHelper<
    A,
    K extends Key,
    V,
    B extends Merge<A, { [P in K]: V }>,
>(
    prevObjectCodec: ObjectDecoder<A>,
    name: K,
    fieldDecoder: Decoder<V>,
    alias?: Key,
): ObjectDecoder<B> {
    return {
        get name() {
            return `{ ${this.fields.map(([name, dec]) => name + ": " + dec.name).join(", ")} }`;
        },
        fields: [...prevObjectCodec.fields, [name, fieldDecoder, alias]],
        withField<K2 extends Key, V2>(
            name2: K2,
            fieldDecoder2: Decoder<V2>,
        ): ObjectDecoder<Merge<B, { [P2 in K2]: V2 }>> {
            return withFieldHelper<B, K2, V2, Merge<B, { [P2 in K2]: V2 }>>(
                this,
                name2,
                fieldDecoder2,
            );
        },
        withFieldAlias<K2 extends Key, V2>(
            name2: Key,
            fieldDecoder2: Decoder<V2>,
            alias2: K2,
        ): ObjectDecoder<Merge<B, { [P2 in K2]: V2 }>> {
            return withFieldHelper<B, K2, V2, Merge<B, { [P2 in K2]: V2 }>>(
                this,
                name2 as K2,
                fieldDecoder2,
                alias2,
            );
        },
        decode(arg: any): DecodingResult<B> {
            return objectDecoderHelper(arg, this);
        },
        test(arg: any): boolean {
            if (typeOf(arg) === "object") {
                for (let [fieldName, fieldCodec] of this.fields) {
                    if (!fieldCodec.test(arg[fieldName])) return false;
                }

                return true;
            } else {
                return false;
            }
        },
    };
}

type TypeOf =
    | "undefined"
    | "object"
    | "boolean"
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function"
    | "object"
    | "array"
    | "null";

export function typeOf(arg: any): TypeOf {
    if (arg === null) {
        return "null";
    } else if (Array.isArray(arg)) {
        return "array";
    } else {
        return typeof arg;
    }
}
