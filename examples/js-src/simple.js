const { asString, asNumber, asOneOf } = require("type-conformity");

console.log("decoding - hello world", asString.decode("hello world"));

console.log("decoding - 1", asNumber.decode(1));

const numberOrString = asOneOf(asString, asNumber);
console.log("decoding - 1 or hello world", numberOrString.decode(1));
console.log(
    "decoding - 1 or hello world",
    numberOrString.decode("hello world"),
);
