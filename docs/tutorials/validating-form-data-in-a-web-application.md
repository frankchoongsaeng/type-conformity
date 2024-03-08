# Tutorial: Using TypeConformity for Form Validation in a Web Application

In this tutorial, we'll explore how to leverage TypeConformity to implement form validation in a web application. Form validation is a critical aspect of web development, ensuring that user input adheres to specified criteria before it's submitted to the server.

## Scenario

Imagine you're developing a registration form for a web application. The form collects various details from the user, including their name, email address, password, and date of birth. Your task is to validate the input data before submitting it to the server to ensure data integrity and prevent potential security vulnerabilities.

### Step 1: Setup

First, let's set up a new TypeScript project and install the TypeConformity library:

```bash
mkdir form-validation-tutorial
cd form-validation-tutorial
npm init -y
npm install type-conformity
```

### Step 2: Define Decoders

Next, we'll define decoders for the various fields in our registration form using TypeConformity. We'll create decoders for strings and dates of birth.

```ts
// decoders.ts
import {
    asObject,
    asString,
    asCustom,
    failure,
    success,
    Unwrap,
} from "type-conformity";

const asDate = asCustom({
    name: "date",
    decode(arg) {
        const result = asString.decode(arg);
        if (result.success) {
            const date = new Date(result.value);
            if (!isNaN(date)) return success(date);
            return failure("invalid date string - " + result.value);
        }
        return result;
    },
});

export const asRegistrationForm = asObject
    .withField("name", asString)
    .withField("email", asEmail)
    .withField("dateOfBirth", asDate);

// we can also reuse the type inferred from the decoder
export type RegistrationForm = Unwrap<typeof asRegistrationForm>;
```

### Step 3: Implement Form Validation

Now, let's implement the form validation logic using the decoders we defined. We'll create a function that takes the form data as input, validates it using the asRegistrationForm, and returns either a success message or a list of validation errors.

```ts
// validator.ts
import { DecodingResult } from "type-conformity";
import { asRegistrationForm, RegistrationForm } from "./decoders";

export function validateRegistrationForm(formData: unknown): string[] {
    const result: DecodingResult<RegistrationForm> =
        asRegistrationForm.decode(formData);

    if (result.success) {
        return [];
    } else {
        // we can map over the errors to transform them as we want
        return result.map((message, paths) => {
            // we can provide meaningful errors here
            const pathstring = paths.map(path => {
                if (path.kind === "field") return "Form field " + path.field;
                else return ""; // because our form doesn't have arrays
            });
            return `${message} @ ${pathstring}`;
        });
    }
}
```

### Step 4: Integrate with Web Application

Finally, let's integrate the form validation logic with your web application. Here's a basic example using HTML and JavaScript:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Registration Form</title>
    </head>
    <body>
        <h1>Registration Form</h1>
        <form id="registrationForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required /><br />

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required /><br />

            <label for="dateOfBirth">Date of Birth:</label>
            <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                required
            /><br />

            <button type="submit">Register</button>
        </form>

        <div id="validationErrors"></div>

        <script src="validator.js"></script>
    </body>
</html>
```

```js
Copy code
// validator.js
import { validateRegistrationForm } from './validator';

const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(registrationForm);
  const data = Object.fromEntries(formData);

  const errors = validateRegistrationForm(data);
  const errorsContainer = document.getElementById('validationErrors');

  if (errors.length === 0) {
    errorsContainer.textContent = '';
    alert('Registration successful!');
    // Submit form to server
  } else {
    errorsContainer.innerHTML = '<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>';
  }
});
```

### Conclusion

In this tutorial, we've seen how to use TypeConformity to implement form validation in a web application. By defining decoders for form fields and validating user input, we ensure data integrity and prevent potential security vulnerabilities. TypeConformity's declarative approach and type safety make it a valuable tool for building robust validation logic in TypeScript projects.
