import {
    Decoder,
    asObject,
    asNumber,
    asBoolean,
    asString,
    asArray,
    asOneOf,
    asNull,
} from "type-conformity";

const exampleObjectValue = {
    greeting: "Hello, World!",
    answer_to_everything: 42,
    isTrue: true,
    numbersArray: [1, 2, 3],
    nestedObject: {
        key: "value",
    },
    nullValue: "null",
};

const exampleCodec = asObject
    .withFieldAlias("answer_to_everything", asNumber, "answerToEverything")
    .withField("isTrue", asBoolean)
    .withField("greeting", asString)
    .withField("numbersArray", asArray(asNumber))
    .withField("nestedObject", asObject.withField("key", asString))
    .withField("nullValue", asOneOf(asString, asNull));

const exampleResult = exampleCodec.decode(exampleObjectValue);

if (exampleResult.kind === "success") {
    const myObject = exampleResult.value;
    console.log("myObject", myObject);
} else {
    console.log(exampleResult.reason);
}
