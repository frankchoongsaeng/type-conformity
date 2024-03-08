# Introducing TypeConformity

TypeConformity is a simple TypeScript/JavaScript library designed to help us developers in building data validation pipelines using an elegant declarative API. It aids in enforcing data integrity and preventing unexpected data from entering into our systems.

Simply put, it can be used to _assert_ that data is what we _expect_. You can think of it as a runtime type checker for JavaScript.

## Getting Started

TypeConformity is developed with TypeScript but is fully compatible with JavaScript as well.

### Installation

Install TypeConformity via npm or yarn:

```bash
npm install type-conformity
```

or

```bash
yarn add type-conformity
```

### Basic Usage

2 simple steps is all you need:

-   Create your decoder _(or use from type conformity's prebuilt decoders)_
-   Use your decoder to decode some data

Example:

```typescript
// import asString decoder, useful for decoding strings.
import { asString } from "type-conformity";

// use asString to decode some data
const hello = asString.parse("Hello, world!");
console.log(hello); // prints Hello, world!
```

The `parse` method is used here to validate the input 'Hello, world!' and returns the validated string without any problems.

Note that `parse` throws a `DecodingException` error when it fails to decode input. To manage this, you can use the `decode`
function that returns a `DecodingResult<T>`, allowing you to deal with the errors as you see fit.

```ts
import { asString, DecodingResult } from "type-conformity";

// use asString to decode some data
const hello = asString; //.parse(1);
//         calling this ^^^^^^^^^ with a number throws a runtime error
//         with message '$root: expected string but got number'

/* +++++++++++++++ USING DECODE ++++++++++++++ */

// we can use decode to avoid throwing runtime errors
const helloResult: DecodingResult<T> = asString.decode(1);

if (helloResult.failed) {
    console.log(hello.reason); // prints, '$root: expected string but got number'
} else {
    // decoding was a success, we can safely access the value
    console.log(helloResult.value);
}
```

So far so good, but these were pretty basic usage examples just to show the different parts in using type conformity.

Let's look at more advanced and realistic usages of type conformity.

### Advanced Usage

Type conformity ships with some very useful decoders out of the box.

```ts
// aliasing all the imports as 'tc' so we don't have a mess of imports.
import * as tc from "type-conformity";

// asString for decoding strings
tc.asString.parse("hello world");
// asNumber for decoding numbers
tc.asNumber.parse(2);
// asBoolean for decoding booleans
tc.asBoolean.parse(true);
// asConst for decoding constant values
tc.asConst(2).parse(2);
```

We can create even more complex decoders by combining simpler ones. Using functions like `or`, `asArray`, `asTuple`, etc.

```ts
// aliasing all the imports as 'tc' so we don't have a mess of imports.
import * as tc from "type-conformity";

const asArrayOfStrings = tc.asArray(tc.asString);
asArrayOfStrings.parse(["foo", "bar"]);

const asStringOrNumber = tc.asString.or(tc.asNumber);
asStringOrNumber.parse("hello");
asStringOrNumber.parse(2);

const asKeyValue = tc.asTuple(
    tc.asString,
    tc.asAny /* yes! we have this too */,
);
asKeyValue.parse(["field", 2]);
asKeyValue.parse(["field", true]);
```

We can also create object decoders in one of two ways:

```typescript
// aliasing all the imports as 'tc' so we don't have a mess of imports.
import * as tc from "type-conformity";

// we can create object decoders using asObject.
const asPerson = tc.asObject
    .withField("name", tc.asString)
    .withField("age", tc.asNumber);

asPerson.parse({ name: "Alice", age: 30 });

// or we can create the same Person decoder using an object literal
const asPerson2 = tc.fromObject({
    name: tc.asString,
    age: tc.asNumber,
});
// works exactly the same as `asPerson`
asPerson2.parse({ name: "Alice", age: 30 });
```

### Custom Decoders

> Type conformity provides a ton of ways of combining decoders, extending decoders, and also manipulating decoded values as part of the decode process.
> You should check out these options first before creating yours, or not; the choice is yours.

Of course! Type conformity also supports creating your own decoders.

This is particularly useful when it isn't possible to combine other decoders to get what you want _(which is quite rare)_, or you want to take charge
of the decoding process for a particular value for reasons best known to you.

You can create custom decoders by using `asCustom`

```typescript
import { asCustom, success, failure } from "type-conformity";

const asPositiveNumber: Decoder<number> = asCustom({
    decode(value) {
        if (typeof value === "number" && value >= 0) {
            return success(value);
        }
        return failure("Value must be a positive number.");
    },
});
```

`asCustom` allows you to create a decoder with custom decoding logic. You can optionally supply a `test` function, and a name for your decoder.

The other way of create custom decoders is by extending the `Decoder` class and providing implementations for your decoder instances:

```typescript
import { Decoder, success, failure } from "type-conformity";

class PositiveNumberDecoder extends Decoder<number> {
    name = "positive number";

    decode(arg: unknown): DecodingResult<number> {
        if (typeof arg === "number" && arg >= 0) {
            return success(arg);
        }
        return failure("Value must be a positive number.");
    }

    test(arg: unknown): boolean {
        return typeof arg === "number" && arg >= 0;
    }
}

const asPositiveNumber: PositiveNumberDecoder = new PositiveNumberDecoder();
```

In this case implementations must be provided for `name`, `decode`, and `test`.
This approach allows you to define additional methods and fields that can be called on your custom decoder.

### API

There's many more ways of working with decoders that just can fit into this document, but you can find TypeConformity's full API documentatio
[here.](/docs/API.md)

### Caveats

#### TypeScript Objects are compatible if one is a subset of the other

The `asObject` decoder infers the typescript type of the decoder based on what fields and decoders have been composed so far.

When you call `withField`, it knows to update the typescript type of the decoder with the new field and it's corresponding type.

```ts
interface User {
    name: string;
    age: number;
}

const asUser: Decoder<User> = asObject
    .withField("name", asString)
    .withField("age", asString);
// ts-error because age in User is number type,
// but has been specified as string type here.
```

This is a really cool feature but doesn't work so well when you create a decoder with additonal fields.

```ts
interface User {
    name: string
    age: number
}

const asUser: Decoder<User> = asObject
    .withField('name', asString)
    .withField('age', asNumber)
    .withField('additionalField': asString)
    // no typescript error because the created decoder
    // is a superset of User.
```

**Using these kind of superset decoders can lead to false negatives, where it tries to decode `additionalField` as a string and fails!**

### Examples and Tutorials

There are a few examples and tutorials showing how TypeConformity can be used in different use cases.

-   [Data Validation for RESTful Service Endpoint using TypeConformity](/docs/tutorials/validating-data-from-restful-service.md)
-   [Using TypeConformity for Form Validation in a Web Application](/docs/tutorials/validating-form-data-in-a-web-application.md)
-   [Examples](/examples/src/)

### Contributing

We'll be thrilled to welcome your contributions to TypeConformity. Before you get started, please take a moment to review the [Contributing Guide](/CONTRIBUTING.md).

### License

[MIT License](/LICENSE.md)

### Technical Info

This project is developed with [TypeScript](https://www.typescriptlang.org/) and currently has zero dependencies, although this might change in the future 🤷.
