# Introducing Type Conformity

Type Conformity is a TypeScript/JavaScript library designed to empower developers in building robust data validation mechanisms through a declarative approach. By providing a set of tools for defining decoders, the library aids developers in enforcing data integrity and preventing the ingress of erroneous or unexpected data into their systems.

It can be used to validate that data conforms to a predefined type rule; It can be thought of as a runtime type checker for JavaScript.

## Why use Type Conformity

**Enhanced Data Quality**: Type Conformity facilitates the creation of decoders that enforce strict validation rules, ensuring that only valid data enters the system. This leads to improved data quality and reliability.

**Reduced Error Rates**: By defining decoders upfront, developers can catch data errors early in the process, reducing the likelihood of runtime errors and improving the overall stability of the application. Think of this as a runtime type checker.

**Declarative Approach**: Type Conformity promotes a declarative programming paradigm, allowing developers to succinctly express their validation logic using clear and intuitive syntax.

**Type Safety**: Leveraging TypeScript's type system, Type Conformity provides strong compile-time guarantees, enabling developers to catch type mismatches and other errors during development rather than at runtime.

**Scalability**: With Type Conformity, developers can easily compose complex decoders from simpler ones, enabling scalability and reusability across different parts of the codebase.

## Getting Started

Type Conformity is developed with TypeScript but is fully compatible with JavaScript as well.

### Installation

Install Type Conformity via npm or yarn:

```bash
npm install decoder-builder
```

or

```bash
yarn add decoder-builder
```

### Tutorials

There are a few tutorials showing how Type Conformity can be used in different use cases.

-   [Data Validation for RESTful Service Endpoint using DecoderBuilder](/docs/tutorials/validating-data-from-restful-service.md)

### Basic Usage

Define a simple decoder using Type Conformity's provided functions. For example, to define a decoder for a string:

```typescript
import { asString, success, failure } from "decoder-builder";

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

Create more complex decoders by combining simpler ones using functions like asOneOf, asBothOf, asArray, etc. For instance, to define a decoder for an object with specific fields:

```typescript
import { asObject, asString, asNumber } from "decoder-builder";

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

Here, `asObject` creates a decoder for objects, and withField specifies the fields and their respective decoders. The resulting asPerson can then be used to validate objects with a name string field and an age number field.

### Custom Decoders

You also have the option of defining custom decoders for specific validation requirements using `asCustom`. For example, to create a decoder for positive integers:

```typescript
import { asCustom, success, failure } from "decoder-builder";

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

In this case, asCustom allows defining a custom decoding function that checks if the input value is a positive integer.

Type Conformity empowers developers to create robust data validation pipelines, ensuring data quality and system reliability. With its intuitive syntax and powerful features, it's a valuable tool for any TypeScript project aiming to maintain clean and reliable data.
