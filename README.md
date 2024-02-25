# Introducing TypeConformity

TypeConformity is a TypeScript/JavaScript library designed to empower developers in building robust data validation mechanisms through a declarative approach. By providing a set of tools for defining decoders, the library aids developers in enforcing data integrity and preventing the ingress of erroneous or unexpected data into their systems.

It can be used to validate that data conforms to a predefined type rule; You can think of it as a runtime type checker for JavaScript.

## Why use TypeConformity

**Enhanced Data Quality**: TypeConformity facilitates the creation of decoders that enforce strict validation rules, ensuring that only valid data enters the system. This leads to improved data quality and reliability.

**Reduced Error Rates**: By defining decoders upfront, developers can catch data errors early in the process, reducing the likelihood of runtime errors and improving the overall stability of the application. Think of this as a runtime type checker.

**Declarative Approach**: TypeConformity promotes a declarative programming paradigm, allowing developers to succinctly express their validation logic using clear and intuitive syntax.

**Type Safety**: Leveraging TypeScript's type system, TypeConformity provides strong compile-time guarantees, enabling developers to catch type mismatches and other errors during development rather than at runtime.

**Scalability**: With TypeConformity, developers can easily compose complex decoders from simpler ones, enabling scalability and reusability across different parts of the codebase.

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

Define a simple decoder using TypeConformity's provided functions. For example, to define a decoder for a string:

```typescript
import { asString } from "type-conformity";

const stringDecoder = asString;

const result = stringDecoder.decode("Hello, world!");

if (result.kind === "success") {
    console.log("Decoding successful:", result.value);
} else {
    console.error("Decoding failed:", result.reason);
}
```

In this example, `asString` creates a decoder for strings. The decode method is then used to validate the input 'Hello, world!', producing either a success result containing the validated value or a failure result with an error message.

### Advanced Usage

Create more complex decoders by combining simpler ones using functions like `asOneOf`, `asBothOf`, `asArray`, etc. For instance, to define a decoder for an object with specific fields:

```typescript
import { asObject, asString, asNumber } from "type-conformity";

const asPerson = asObject
    .withField("name", asString)
    .withField("age", asNumber);

const result = asPerson.decode({ name: "Alice", age: 30 });

if (result.kind === "success") {
    console.log("Decoding successful:", result.value);
} else {
    console.error("Decoding failed:", result.reason);
}
```

Here, `asObject` creates a decoder for objects, and `withField` specifies the fields and their respective decoders. The resulting `asPerson` decoder can then be used to validate objects with a name-string-field and an age-number-field.

### Custom Decoders

You also have the option of defining custom decoders for specific validation requirements using `asCustom`. For example, to create a decoder for positive integers:

```typescript
import { asCustom, success, failure } from "type-conformity";

const asPositiveNumber = asCustom((value: number) => {
    if (value >= 0) {
        return success(value);
    }
    return failure("Value must be a positive integer.");
});

const result = asPositiveNumber.decode(42);

if (result.kind === "success") {
    console.log("Decoding successful:", result.value);
} else {
    console.error("Decoding failed:", result.reason);
}
```

In this case, `asCustom` allows defining a custom decoding function that checks if the input value is a positive integer.

TypeConformity empowers you to create robust data validation pipelines, that can ensure data quality and system reliability.
Its designed to have an intuitive syntax that makes defining data validation rules easy.
It's a valuable tool for any TypeScript or JavaScript project aiming to maintain clean and reliable data.

### Caveats

#### TypeScript Objects are compatible if one is a subset of the other

The `asObject` decoder figures out the typescript type of the decoder based on what fields and decoders have been composed so far.

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

Using these kind of superset decoders can lead to false negatives, where it tries to decode `additionalField` as a string and fails.

### API

Find TypeConformity API's full documentation [here](/docs/API.md)

### Tutorials

There are a few tutorials showing how TypeConformity can be used in different use cases.

-   [Data Validation for RESTful Service Endpoint using TypeConformity](/docs/tutorials/validating-data-from-restful-service.md)
-   [Using TypeConformity for Form Validation in a Web Application](/docs/tutorials/validating-form-data-in-a-web-application.md)

### Contributing

We'll be thrilled to welcome your contributions to TypeConformity. Before you get started, please take a moment to review the [Contributing Guide](/CONTRIBUTING.md).

### License

[MIT License](/LICENSE.md)

### Technical Info

This project is developed with [TypeScript](https://www.typescriptlang.org/) and currently has zero dependencies, although this might change in the future 🤷.
