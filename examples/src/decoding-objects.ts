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
