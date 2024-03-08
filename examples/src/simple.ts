import * as tc from "type-conformity";

// =======================================================================
// CORE API
// These examples demonstrate functions available on every decoder.
// Also showing their return types.

const validString: string = tc.asString.parse("hello world");
// const invalidString: string = asString.parse(1)
// ^^^ will throw a runtime error

const asValidUppercase: tc.StringDecoder = tc.asString.transform(str =>
    str.toUpperCase(),
);
const validUppercase: string = asValidUppercase.parse("foo"); // = 'FOO'

// same as `.transform`
const asValidUppercase2: tc.StringDecoder = tc.asString.map(str =>
    str.toUpperCase(),
);
const validUppercase2: string = asValidUppercase.parse("foo"); // = 'FOO'

const asNumberString: tc.Decoder<number> = tc.asString.try(str => {
    const num = Number(str);
    if (Number.isNaN(num)) {
        return tc.failure("expected string of numbers");
    }
    return tc.success(num);
});
const validNumberString: number = asNumberString.parse("123"); // = 123

const asNumberOrString: tc.Decoder<number | string> = tc.asNumber.or(
    tc.asString,
);
const asBooleanOrNull: tc.Decoder<boolean | null> = tc.asBoolean.or(tc.asNull);

const isValidString: boolean = tc.asString.test("123"); // = true
const isNotValidString: boolean = tc.asString.test(123); // = false

const decodeResult: tc.DecodingResult<string> = tc.asString.decode("123");
if (decodeResult.success) {
    console.log(decodeResult.value); // decodeResult.value = '123'
} else {
    // decoding failed
    console.log(decodeResult.reason);
}

// =======================================================================
// Simple Decoders
// These examples introduce some decoders provided by type-conformity.

// undefined decoder
tc.asUndefined.parse(undefined);

// null decoder
tc.asNull.parse(null);

// string decoder
tc.asString.parse("");

// number decoder
tc.asNumber.parse(1);

// bigint decoder
tc.asBigInt.parse(1);

// boolean decoder
tc.asBoolean.parse(true);

// constant decoders
const as2: tc.ConstDecoder<2> = tc.asConst(2);
const asFoo: tc.ConstDecoder<"foo"> = tc.asConst("foo");
const asTrue: tc.ConstDecoder<true> = tc.asConst(true);
// This can also be used for singleton objects, i.e. to check that you have the
// same instance of an object.
const obj = { foo: 1 };
const asObj: tc.ConstDecoder<{ foo: number }> = tc.asConst(obj);

// using a class
class DB {}
const singletonInstance = new DB();
const asSingletonInstance: tc.ConstDecoder<DB> = tc.asConst(singletonInstance);

asSingletonInstance.parse(new DB()); // fails with message: $root: expected instance did not match actual instance
asSingletonInstance.parse(singletonInstance); // = singletonInstance

// int decoder
tc.asInt.parse(1);
// tc.asInt.parse(2.3) // fails with an error

// decode anything as `any`
const anyNum: any = tc.asAny.parse(2); // 2
const anyString: any = tc.asAny.parse("hello"); // 'hello'

// decode anything as `unknown`
const unknownNum: undefined = tc.asUndefined.parse(2); // 2
const unknownString: undefined = tc.asUndefined.parse("hello"); // 'hello'

// =======================================================================
// DECODING ARRAYS
// These examples demonstrate how to decode arrays and tuples

// array of string decoder
const asArrayOfStrings: tc.Decoder<string[]> = tc.asArray(tc.asString);

// tuple decoder
tc.asTuple(tc.asInt);
tc.asTuple(tc.asInt, tc.asString);
tc.asTuple(tc.asInt, tc.asString, tc.asConst("field").or(tc.asConst("index")));
