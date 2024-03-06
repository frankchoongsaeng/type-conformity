import { DecodingError, prettyPrintError, printHelper } from "../src";

describe("utils specific test", () => {
    test("printHelper", () => {
        expect(printHelper("message")).toMatchObject([": message"]);

        const errors: DecodingError = {
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
        };
        expect(printHelper(errors)).toMatchObject([
            ".foo.bar: expected x but got y",
            ".foo[1]: expected 0 but got 1",
        ]);
    });
});
