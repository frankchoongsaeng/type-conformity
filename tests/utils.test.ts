import { DecodingError, failure, prettyPrintFailureError } from "../src";

describe("utils specific test", () => {
    test("printHelper", () => {
        expect(prettyPrintFailureError(failure("message"))).toBe(
            "$root: message",
        );

        const f = failure("");
        f.errors = [
            {
                path: { kind: "field", field: "foo" },
                errors: [
                    {
                        path: { kind: "field", field: "bar" },
                        errors: "expected x but got y",
                    },
                    {
                        path: { kind: "index", index: 1 },
                        errors: "expected 0 but got 1",
                    },
                ],
            },
        ];

        expect(prettyPrintFailureError(f)).toBe(
            "$root.foo.bar: expected x but got y\n" +
                "$root.foo[1]: expected 0 but got 1",
        );
    });
});
