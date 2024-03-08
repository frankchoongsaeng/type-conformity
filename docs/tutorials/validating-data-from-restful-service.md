# Tutorial: Data Validation for RESTful Service Endpoint using TypeConformity

In this tutorial, we'll demonstrate how to utilize TypeConformity to validate data coming from a RESTful service endpoint in a TypeScript project. Data validation is crucial for ensuring that the data consumed by your application meets the expected format and criteria, thus improving data integrity and overall system reliability.

## Scenario

Suppose you're developing a web application that consumes user data from a RESTful service endpoint. Before using this data in your application, you want to validate it to ensure it matches the expected structure and meets specific criteria.

### Step 1: Setup

Let's start by setting up a new TypeScript project and installing the necessary dependencies, including TypeConformity:

```bash
mkdir rest-validation-tutorial
cd rest-validation-tutorial
npm init -y
npm install type-conformity node-fetch
```

### Step 2: Create our Models

Just to keep things tidy and get all the compiler help we can, we'll create a _models.ts_ file where we define the types of data we're working with.

_This is generally a good practice too if this pattern is new to you._

```ts
// models.ts
export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}
```

### Step 3: Fetch Data from Endpoint

Now, let's set up fetching data from the RESTful service endpoint using a library like node-fetch. We'll later add validation using TypeConformity.

Let's create a new `fetchData.ts` file with this content:

```ts
// fetchData.ts
import fetch from "node-fetch";
import { Post } from "./models";

export async function fetchPost(id: number): Promise<Post | null> {
    try {
        const url = `https://jsonplaceholder.typicode.com/posts/${id}`;
        const response = await fetch(url);
        const data = await response.json();

        // data here may or may not conform to the shape of post
        return data;
    } catch (error) {
        // something went wrong
        console.log(error);
        return null;
    }
}
```

We've setup the request here and something worth noting is that `return data` may or may not conform to the type of `Post`.
It maybe missing some fields or have a different type as defined in your model and this can cause issues deep within your application logic that is difficult to debug.

### Step 4: Define Decoders

Next, we'll define a decoder for Post received from the RESTful service endpoint.
This decoders will ensure that the data meets the expected format and criteria.

We'll create a new `decoders.ts` file with this content:

```ts
// decoders.ts
import { asObject, asString, asNumber } from "type-conformity";

export const asPost = asObject
    .withField("userId", asNumber)
    .withField("id", asNumber)
    .withField("title", asString)
    .withField("body", asString);
```

### Step 3: Using our `asPost` decoder

Let's apply our `asPost` decoder to ensure that the data returned from the service conforms to our `Post` model.

We'll apply these changes in `fetchData.ts`:

```ts
// fetchData.ts
import fetch from "node-fetch";
import { Post } from "./models";
import { DecodingResult } from "type-conformity";
// importing our decoder
import { asPost } from "./decoders";

export async function fetchPost(id: number): Promise<Post | null> {
    try {
        const url = `https://jsonplaceholder.typicode.com/posts/${id}`;
        const response = await fetch(url);
        const data = await response.json();

        // applying the decoder
        const result: DecodingResult<Post> = asPost.decode(data);

        if (result.success) {
            // validation was successful, we can safely return validation result
            return result.value;
        } else {
            // validation failed with a reason
            console.log(result.reason);
            return null;
        }
    } catch (error) {
        // something went wrong
        console.log(error);
        return null;
    }
}
```

With this approach, we can now collect the failure reason and maybe log that using a logger of our choice.
This makes it easy to identify when bad data is coming into your system, and how that data is different from our expectation.

### Step 4: Integrate with Application Logic

Finally, integrate the data validation logic with your application logic. For demonstration purposes, we'll create a simple script to fetch data from the endpoint and log the validation result.

```ts
// index.ts
import { fetchPost } from "./fetchData";

async function main() {
    const userOrNull = await fetchPost(1);
    console.log("user or null", userOrNull);

    const definitelyNull = await fetchPost(-1); // id doesn't exist on jsonplaceholder
    console.log("should be null", definitelyNull);
}

main();
```

### Step 5: Run the Application

Run the application to fetch data from the RESTful service endpoint and validate it using TypeConformity.

```bash
node index.js
```

### Conclusion

In this tutorial, we've demonstrated how to use TypeConformity to validate data coming from a RESTful service endpoint in a TypeScript project. By defining decoders for the expected data structure and criteria, we ensure that the data consumed by our application is valid and meets specific requirements. TypeConformity's declarative approach and type safety make it a powerful tool for implementing robust data validation logic in TypeScript applications.
