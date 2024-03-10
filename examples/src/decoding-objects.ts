import {
    asObject,
    asNumber,
    asBoolean,
    asString,
    asArray,
    asOneOf,
    asNull,
    ObjectDecoder,
    asUndefined,
    asInt,
    Unwrap,
    fromObject,
} from "type-conformity";

type ExampleObjectType = {
    greeting: string;
    answerToEverything: number;
    isTrue: boolean;
    numbersArray: number[];
    nestedObject: {
        key: string;
    };
    nullValue: null | string;
};

// creating an decoder for ExampleObjectType
const asExampleObject: ObjectDecoder<ExampleObjectType> = asObject
    .withFieldAlias("answer_to_everything", asNumber, "answerToEverything")
    .withField("isTrue", asBoolean)
    .withField("greeting", asString)
    .withField("numbersArray", asArray(asNumber))
    .withField("nestedObject", asObject.withField("key", asString))
    .withField("nullValue", asOneOf(asString, asNull));

/**
 * We can also create decoder for an object like ExampleObjectType
 * but without the nestedObject and nullValue fields
 */
type SimplerObjectType = {
    greeting: string;
    answerToEverything: number;
    isTrue: boolean;
    numbersArray: number[];
};

const asSimplerObject: ObjectDecoder<SimplerObjectType> = asExampleObject
    .withoutField("nestedObject")
    .withoutField("nullValue");

/**  =======================================================================
 * We can also use the type of the decoder as a type declaration
 * for the rest of our application
 */
const asUser = asObject
    .withField("firstname", asString)
    .withField("lastname", asString)
    .withField("middlename", asString.or(asUndefined))
    .withField("age", asInt);

// extract the User type from asUser decoder
type User = Unwrap<typeof asUser>;

/** =======================================================================
 * Creating object decoders with object literals
 */
const asUser2 = fromObject({
    firstname: asString,
    lastname: asString,
    middlename: asString.or(asUndefined),
});

// We can also compose further on asUser2
const asUserWithHobbies = asUser2.withField("hobbies", asArray(asString));

/** =======================================================================
 * Combining decoders with `and`
 */
const asCombined = asExampleObject.and(asUserWithHobbies);

/** =======================================================================
 * Decoding object with a discriminator field
 */
import * as tc from "type-conformity";

interface CommonFields {
    field1: string; // discriminator field
    field2: string;
    field3?: boolean; // field3 is optional
}

interface SpecialFields extends CommonFields {
    field1: "special"; // discriminates SpecialFields as 'special'
    field3: boolean; // field3 is required
}

const asCommonFields = tc.fromObject({
    field1: tc.asString,
    field2: tc.asString,
    field3: tc.asBoolean.or(tc.asUndefined),
});

const asSpecialFields = asCommonFields
    .withField("field1", tc.asConst("special"))
    .withField("field3", tc.asBoolean);

const finalDecoder = asSpecialFields.or(asCommonFields);
//                  1^^^^^^^^^^^^^^^   2^^^^^^^^^^^^^^
// the order here is important, because you want to first
// try to decode as Special fields before trying as Common fields

// You can also use `.parse` to throw an error when the data doesn't conform
const data: SpecialFields | CommonFields = finalDecoder.parse({});
