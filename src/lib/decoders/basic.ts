import { DecodingFailure, DecodingResult } from "../types";
import { success, failure, typeOf, isObject, isArray } from "../utils";
import { Decoder } from "./decoder";

// +++++++++++++++++ UNDEFINED DECODER ++++++++++++++++++++
/**
 * Decoder for undefined
 *
 * @group Types
 * @category Decoders
 */
export class UndefinedDecoder extends Decoder<undefined> {
    name = "undefined";

    decode(arg: unknown): DecodingResult<undefined> {
        if (arg === undefined) return success(undefined);
        else return this.constructError(arg);
    }

    test(arg: unknown): boolean {
        return arg === undefined;
    }
}

/**
 * A decoder that can only decode value of undefined.
 *
 * @group Decoders
 */
export const asUndefined: UndefinedDecoder = new UndefinedDecoder();

// +++++++++++++++++ NULL DECODER ++++++++++++++++++++
/**
 * Decoder for null
 *
 * @group Types
 * @category Decoders
 */
export class NullDecoder extends Decoder<null> {
    name = "null";

    decode(arg: unknown): DecodingResult<null> {
        if (arg === null) return success(null);
        else return this.constructError(arg);
    }

    test(arg: unknown): boolean {
        return arg === null;
    }
}

/**
 * A decoder that can only decode value of null.
 *
 * @group Decoders
 */
export const asNull: NullDecoder = new NullDecoder();

// +++++++++++++++++ STRING DECODER ++++++++++++++++++++
/**
 * Decoder for string
 *
 * @group Types
 * @category Decoders
 */
export class StringDecoder extends Decoder<string> {
    name = "string";

    decode(str: unknown): DecodingResult<string> {
        return typeof str === "string"
            ? success(str)
            : this.constructError(str);
    }

    test(str: unknown): boolean {
        return typeOf(str) === "string";
    }
}

/**
 * A decoder that can only decode a string.
 *
 * @group Decoders
 */
export const asString: StringDecoder = new StringDecoder();

// +++++++++++++++++ NUMBER DECODER ++++++++++++++++++++
/**
 * Abstract decoder for numbers.
 *
 * @group Types
 * @category Decoders
 */
abstract class AbstractNumberDecoder<
    T extends number | bigint,
> extends Decoder<T> {
    protected constructError(arg: unknown): DecodingFailure {
        if (Number.isNaN(arg)) {
            return failure(`expected ${this.name} but got NaN`);
        } else {
            return super.constructError(arg);
        }
    }

    protected isNumber(num: unknown): num is number {
        return typeof num === "number" && !Number.isNaN(num);
    }
}

/**
 * Decoder for all numbers
 *
 * @group Types
 * @category Decoders
 */
export class NumberDecoder extends AbstractNumberDecoder<number> {
    name = "number";

    decode(num: unknown): DecodingResult<number> {
        if (this.isNumber(num)) {
            return success(num);
        } else {
            return this.constructError(num);
        }
    }

    test(num: unknown): boolean {
        return this.isNumber(num);
    }
}

/**
 * Decoder for bigint.
 *
 * @group Types
 * @category Decoders
 */
export class BigIntDecoder extends AbstractNumberDecoder<bigint> {
    name = "bigint";

    protected constructError(arg: unknown): DecodingFailure {
        if (this.isNumber(arg)) {
            return failure(`expected ${this.name} but got float`);
        } else {
            return super.constructError(arg);
        }
    }

    decode(num: unknown): DecodingResult<bigint> {
        if (typeof num === "number" && Number.isInteger(num)) {
            return success(BigInt(num));
        } else if (typeof num === "bigint") {
            return success(num);
        } else {
            return this.constructError(num);
        }
    }

    test(num: unknown): boolean {
        return typeOf(num) === "bigint" || Number.isInteger(num);
    }
}

/**
 * A decoder that can only decode a number.
 *
 * @group Decoders
 */
export const asNumber: NumberDecoder = new NumberDecoder();

/**
 * A decoder that can only decode a bigint.
 * If a regular integer is supplied, it gets decoded as a bigint.
 *
 * @group Decoders
 */
export const asBigInt: BigIntDecoder = new BigIntDecoder();

// +++++++++++++++++ BOOLEAN DECODER ++++++++++++++++++++
/**
 * Decoder for booelan
 *
 * @group Types
 * @category Decoders
 */
export class BooleanDecoder extends Decoder<boolean> {
    name = "boolean";

    decode(bool: unknown): DecodingResult<boolean> {
        return typeof bool === "boolean"
            ? success(bool)
            : this.constructError(bool);
    }

    test(bool: unknown): boolean {
        return typeOf(bool) === "boolean";
    }
}

/**
 * A decoder that can only decode a boolean.
 *
 * @group Decoders
 */
export const asBoolean: BooleanDecoder = new BooleanDecoder();

// +++++++++++++++++ CONSTANT DECODER ++++++++++++++++++++
/**
 * All Javascript primitive types.
 *
 * @group Types
 * @category Utils
 */
export type Primitive =
    | number
    | string
    | boolean
    | bigint
    | null
    | undefined
    | symbol;

/**
 * Narrows a type it's specific value.
 *
 * @group Types
 * @category Utils
 */
export type DeriveConstType<T> = T extends Primitive
    ? { [K in keyof T]: K }
    : T extends []
      ? T
      : T extends object
        ? {
              [K in keyof T]: T[K] extends Primitive
                  ? DeriveConstType<T[K]>
                  : DeriveConstType<T[K]>;
          }
        : never;

/**
 * A constant type.
 *
 * @group Types
 * @category Utils
 */
type Const<T> = DeriveConstType<T>;

/**
 * Decoder for constants.
 *
 * @group Types
 * @category Decoders
 */
export class ConstDecoder<T> extends Decoder<Const<T>> {
    constructor(private value: Const<T>) {
        super();
    }

    get name() {
        if (typeof this.value === "string") return `"${this.value}"`;
        else if (typeof this.value === "bigint") return `${this.value}n`;
        else if (["array", "object"].includes(typeOf(this.value))) {
            const proto = Object.getPrototypeOf(this.value);
            if (proto && proto.constructor && proto.constructor.name) {
                return `UniqueInstance<${proto.constructor.name}>`;
            } else {
                return "UniqueInstance<Object>";
            }
        } else return String(this.value);
    }

    protected constructError(arg: unknown): DecodingFailure {
        if (isObject(arg) || isArray(arg)) {
            return failure(`expected instance did not match actual instance`);
        } else {
            // this must be a literal or some simple value
            if (typeOf(this.value) === typeOf(arg)) {
                return failure(`expected value ${this.value} but got ${arg}`);
            } else {
                return failure(
                    `expected value ${this.value} but got ${typeOf(arg)}`,
                );
            }
        }
    }

    decode(arg: unknown): DecodingResult<Const<T>> {
        if (arg === this.value) return success(this.value);
        return this.constructError(arg);
    }

    test(arg: unknown): boolean {
        return this.value === arg;
    }
}

/**
 * Takes a constant value and produces a decoder that can only decode that value.
 *
 * example:
 * ```ts
 * const d1: ConstDecoder<2> = asConst(2)
 * const d2: ConstDecoder<"accepted"> = asConst("accepted")
 * const d3: ConstDecoder<true> = asConst(true)
 * ```
 *
 * This can also be used for singleton objects, i.e. to check that you have the
 * same instance of an object.
 *
 * here's an example of using this to ensure you recieve the same instance of a
 * database configuration.
 * ```ts
 * // the instance you want to recieve
 * const dbInstance = new DB({ url: configURL, pass: password })
 * const asDBInstance = asConst(dbInstance)
 *
 * const anotherInstance = new DB({ url: configURL, pass: password })
 * asDBInstance.decode(anotherInstance)
 *      //> fails because anotherInstance is not dbInstance
 * ```
 *
 * @group Decoders
 * @param value constant value to decode for
 * @returns decoder for constant value
 */
export function asConst<L>(value: Const<L>): ConstDecoder<L> {
    return new ConstDecoder<L>(value);
}
