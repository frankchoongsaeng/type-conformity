# Tutorial: Data Validation for RESTful Service Endpoint using DecoderBuilder

In this tutorial, we'll demonstrate how to utilize DecoderBuilder to validate data coming from a RESTful service endpoint in a TypeScript project. Data validation is crucial for ensuring that the data consumed by your application meets the expected format and criteria, thus improving data integrity and overall system reliability.

Scenario:
Suppose you're developing a web application that consumes user data from a RESTful service endpoint. Before using this data in your application, you want to validate it to ensure it matches the expected structure and meets specific criteria.

Step 1: Setup

Let's start by setting up a new TypeScript project and installing the necessary dependencies, including DecoderBuilder:

bash
Copy code
mkdir rest-validation-tutorial
cd rest-validation-tutorial
npm init -y
npm install decoder-builder node-fetch
Step 2: Define Decoders

Next, define decoders for the data received from the RESTful service endpoint. These decoders will ensure that the data meets the expected format and criteria.

typescript
Copy code
// decoders.ts
import { asObject, asString, asNumber } from 'decoder-builder';

export const userDataDecoder = asObject
.withField('id', asNumber)
.withField('name', asString)
.withField('email', asString);
Step 3: Fetch Data from Endpoint

Now, fetch data from the RESTful service endpoint using a library like node-fetch and validate it using the defined decoder.

typescript
Copy code
// fetchData.ts
import fetch from 'node-fetch';
import { DecodingResult } from 'decoder-builder';
import { userDataDecoder } from './decoders';

export async function fetchDataFromEndpoint(url: string): Promise<string[]> {
try {
const response = await fetch(url);
const data = await response.json();

    const result: DecodingResult<any> = userDataDecoder.decode(data);

    if (result.kind === 'success') {
      return ['Data validation successful!'];
    } else {
      return result.reason.split('\n');
    }

} catch (error) {
return [error.message];
}
}
Step 4: Integrate with Application Logic

Finally, integrate the data validation logic with your application logic. For demonstration purposes, we'll create a simple script to fetch data from the endpoint and log the validation result.

typescript
Copy code
// index.ts
import { fetchDataFromEndpoint } from './fetchData';

const apiUrl = '<https://api.example.com/users>';

async function main() {
const validationMessages = await fetchDataFromEndpoint(apiUrl);
console.log('Validation Result:');
console.log(validationMessages.join('\n'));
}

main();
Step 5: Run the Application

Run the application to fetch data from the RESTful service endpoint and validate it using DecoderBuilder.

bash
Copy code
node index.js
Conclusion:
In this tutorial, we've demonstrated how to use DecoderBuilder to validate data coming from a RESTful service endpoint in a TypeScript project. By defining decoders for the expected data structure and criteria, we ensure that the data consumed by our application is valid and meets specific requirements. DecoderBuilder's declarative approach and type safety make it a powerful tool for implementing robust data validation logic in TypeScript applications.
