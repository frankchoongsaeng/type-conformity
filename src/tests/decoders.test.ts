import {
    asArray,
    asBoolean,
    asBothOf,
    asCustom,
    asLiteral,
    asNull,
    asNumber,
    asObject,
    asOneOf,
    asOptional,
    asString,
    asTuple2,
    asTuple3,
    asUndefined,
} from "../lib/decoders";
import { success, failure } from "../lib/utils";

describe("decoders", () => {
    test("asUndefined.decode", () => {
        expect(asUndefined.decode(undefined)).toHaveProperty(
            "value",
            undefined,
        );
        expect(asUndefined.decode(null)).toHaveProperty(
            "reason",
            `expected undefined but got null`,
        );
        expect(asUndefined.decode("string")).toHaveProperty(
            "reason",
            `expected undefined but got string`,
        );
    });

    test("asUndefined.test", () => {
        expect(asUndefined.test(undefined)).toBe(true);
        expect(asUndefined.test(null)).toBe(false);
        expect(asUndefined.test("string")).toBe(false);
    });

    test("asNull.decode", () => {
        expect(asNull.decode(null)).toHaveProperty("value", null);
        expect(asNull.decode(undefined)).toHaveProperty(
            "reason",
            `expected a null but got undefined`,
        );
        expect(asNull.decode("string")).toHaveProperty(
            "reason",
            `expected a null but got string`,
        );
    });

    test("asNull.test", () => {
        expect(asNull.test(null)).toBe(true);
        expect(asNull.test(undefined)).toBe(false);
        expect(asNull.test("string")).toBe(false);
    });

    test("asString.decode", () => {
        expect(asString.decode("some string")).toHaveProperty(
            "value",
            "some string",
        );
        expect(asString.decode(null)).toHaveProperty(
            "reason",
            `expected a string but got null`,
        );
        expect(asString.decode(1)).toHaveProperty(
            "reason",
            `expected a string but got number`,
        );
    });

    test("asString.test", () => {
        expect(asString.test("some string")).toBe(true);
        expect(asString.test(null)).toBe(false);
        expect(asString.test(1)).toBe(false);
    });

    test("asNumber.decode", () => {
        expect(asNumber.decode(1)).toHaveProperty("value", 1);
        expect(asNumber.decode(1.2)).toHaveProperty("value", 1.2);
        expect(asNumber.decode(null)).toHaveProperty(
            "reason",
            `expected a number but got null`,
        );
        expect(asNumber.decode("1")).toHaveProperty(
            "reason",
            `expected a number but got string`,
        );
    });

    test("asNumber.test", () => {
        expect(asNumber.test(1)).toBe(true);
        expect(asNumber.test(1.2)).toBe(true);
        expect(asNumber.test(null)).toBe(false);
        expect(asNumber.test("1")).toBe(false);
    });

    test("asBoolean.decode", () => {
        expect(asBoolean.decode(true)).toHaveProperty("value", true);
        expect(asBoolean.decode(false)).toHaveProperty("value", false);
        expect(asBoolean.decode(1.2)).toHaveProperty(
            "reason",
            `expected a boolean but got number`,
        );
        expect(asBoolean.decode(null)).toHaveProperty(
            "reason",
            `expected a boolean but got null`,
        );
        expect(asBoolean.decode("1")).toHaveProperty(
            "reason",
            `expected a boolean but got string`,
        );
    });

    test("asBoolean.test", () => {
        expect(asBoolean.test(true)).toBe(true);
        expect(asBoolean.test(false)).toBe(true);
        expect(asBoolean.test(1.2)).toBe(false);
        expect(asBoolean.test(null)).toBe(false);
        expect(asBoolean.test("1")).toBe(false);
    });

    test("asObject.decode", () => {
        expect(asObject.decode({})).toHaveProperty("value", {});
        expect(asObject.decode({ field1: "hello" })).toHaveProperty(
            "value",
            {},
        );
        expect(
            asObject
                .withField("field1", asString)
                .decode({ field1: "string value" }),
        ).toHaveProperty("value", { field1: "string value" });
        expect(
            asObject
                .withFieldAlias("field1", asString, "fieldAlias")
                .decode({ field1: "string value" }),
        ).toHaveProperty("value", { fieldAlias: "string value" });
        expect(
            asObject
                .withFieldAlias("field1", asString, "fieldAlias")
                .withField("field2", asNumber)
                .withFieldAlias("field3", asBoolean, "boolAlias")
                .withField("field4", asNull)
                .decode({
                    field1: "string value",
                    field2: 2,
                    field3: false,
                    field4: null,
                }),
        ).toHaveProperty("value", {
            fieldAlias: "string value",
            field2: 2,
            boolAlias: false,
            field4: null,
        });
        expect(
            asObject
                .withField("field1", asString)
                .withField("field2", asNumber)
                .decode({ field1: "string value" }),
        ).toHaveProperty(
            "reason",
            "error while decoding field - field2, expected a number but got undefined",
        );
        expect(
            asObject
                .withField("field1", asString)
                .withField("field2", asNumber)
                .decode(null),
        ).toHaveProperty("reason", "expected an object but got null");
    });

    test("asObject.test", () => {
        expect(asObject.test({})).toBe(true);
        expect(asObject.test({ field1: "hello" })).toBe(true);
        expect(
            asObject
                .withField("field1", asString)
                .test({ field1: "string value" }),
        ).toBe(true);
        expect(
            asObject
                .withFieldAlias("field1", asString, "fieldAlias")
                .test({ field1: "string value" }),
        ).toBe(true);
        expect(
            asObject
                .withFieldAlias("field1", asString, "fieldAlias")
                .withField("field2", asNumber)
                .withFieldAlias("field3", asBoolean, "boolAlias")
                .withField("field4", asNull)
                .test({
                    field1: "string value",
                    field2: 2,
                    field3: false,
                    field4: null,
                }),
        ).toBe(true);
        expect(
            asObject
                .withField("field1", asString)
                .withField("field2", asNumber)
                .test({ field1: "string value" }),
        ).toBe(false);
        expect(
            asObject
                .withField("field1", asString)
                .withField("field2", asNumber)
                .test(null),
        ).toBe(false);
    });

    test("asArray.decode", () => {
        expect(asArray(asString).decode([])).toHaveProperty("value", []);
        expect(asArray(asString).decode(["string1", "string2"])).toHaveProperty(
            "value",
            ["string1", "string2"],
        );
        expect(
            asArray(asString).decode(["string1", null, true]),
        ).toHaveProperty(
            "reason",
            `decoding failure at index 1: expected a string but got null\n` +
                `decoding failure at index 2: expected a string but got boolean`,
        );
        expect(asArray(asString).decode(null)).toHaveProperty(
            "reason",
            `expected an array but got null`,
        );
    });

    test("asArray.test", () => {
        expect(asArray(asString).test([])).toBe(true);
        expect(asArray(asString).test(["string1", "string2"])).toBe(true);
        expect(asArray(asString).test(["string1", null, true])).toBe(false);
        expect(asArray(asString).test(null)).toBe(false);
    });

    test("asTuple2.decode", () => {
        expect(
            asTuple2(asString, asBoolean).decode(["string value", true]),
        ).toHaveProperty("value", ["string value", true]);
        expect(
            asTuple2(asString, asBoolean).decode(["string1", "string2"]),
        ).toHaveProperty(
            "reason",
            "second tuple element decoding failure: expected a boolean but got string",
        );
        expect(
            asTuple2(asString, asBoolean).decode(["string1", true, 1]),
        ).toHaveProperty(
            "reason",
            "expected a tuple of exactly 2 elements but got an array of length 3",
        );
        expect(asTuple2(asString, asBoolean).decode(null)).toHaveProperty(
            "reason",
            `expected a tuple but got null`,
        );
    });

    test("asTuple2.test", () => {
        expect(asTuple2(asString, asBoolean).test(["string value", true])).toBe(
            true,
        );
        expect(asTuple2(asString, asBoolean).test(["string1", "string2"])).toBe(
            false,
        );
        expect(asTuple2(asString, asBoolean).test(["string1", true, 1])).toBe(
            false,
        );
        expect(asTuple2(asString, asBoolean).test(null)).toBe(false);
    });

    test("asTuple3.decode", () => {
        expect(
            asTuple3(asString, asBoolean, asNumber).decode([
                "string value",
                true,
                1,
            ]),
        ).toHaveProperty("value", ["string value", true, 1]);
        expect(
            asTuple3(asString, asBoolean, asNumber).decode([
                "string1",
                "string2",
                true,
            ]),
        ).toHaveProperty(
            "reason",
            "second tuple element decoding failure: expected a boolean but got string",
        );
        expect(
            asTuple3(asString, asBoolean, asNumber).decode([
                "string1",
                true,
                1,
                null,
            ]),
        ).toHaveProperty(
            "reason",
            "expected a tuple of exactly 3 elements but got an array of length 4",
        );
        expect(
            asTuple3(asString, asBoolean, asNumber).decode(null),
        ).toHaveProperty("reason", `expected a tuple but got null`);
    });

    test("asTuple3.test", () => {
        expect(
            asTuple3(asString, asBoolean, asNumber).test([
                "string value",
                true,
                1,
            ]),
        ).toBe(true);
        expect(
            asTuple3(asString, asBoolean, asNumber).test([
                "string1",
                "string2",
                true,
            ]),
        ).toBe(false);
        expect(
            asTuple3(asString, asBoolean, asNumber).test([
                "string1",
                true,
                1,
                null,
            ]),
        ).toBe(false);
        expect(asTuple3(asString, asBoolean, asNumber).test(null)).toBe(false);
    });

    test("asOneOf.decode", () => {
        expect(
            asOneOf(asString, asBoolean).decode("string value"),
        ).toHaveProperty("value", "string value");
        expect(asOneOf(asString, asBoolean).decode(true)).toHaveProperty(
            "value",
            true,
        );
        expect(asOneOf(asString, asBoolean).decode(1)).toHaveProperty(
            "reason",
            "failed to decode as string | boolean:\n" +
                " - expected a string but got number\n" +
                " - expected a boolean but got number",
        );
    });

    test("asOneOf.test", () => {
        expect(asOneOf(asString, asBoolean).test("string value")).toBe(true);
        expect(asOneOf(asString, asBoolean).test(true)).toBe(true);
        expect(asOneOf(asString, asBoolean).test(1)).toBe(false);
    });

    test("asBothOf.decode", () => {
        const asFoo = asObject.withField("foo", asString);
        const asBar = asObject.withField("bar", asNumber);
        expect(
            asBothOf(asFoo, asBar).decode({ foo: "some value", bar: 1 }),
        ).toHaveProperty("value", { foo: "some value", bar: 1 });
        expect(
            asBothOf(asFoo, asBar).decode({ foo: "some value", baz: 1 }),
        ).toHaveProperty(
            "reason",
            "error while decoding field - bar, " +
                "expected a number but got undefined",
        );
        expect(
            asBothOf(asFoo, asBar).decode({ foobar: "some value", bar: 1 }),
        ).toHaveProperty(
            "reason",
            "error while decoding field - foo, " +
                "expected a string but got undefined",
        );
        expect(asBothOf(asFoo, asBar).decode(1)).toHaveProperty(
            "reason",
            "expected an object but got number",
        );
    });

    test("asBothOf.test", () => {
        const asFoo = asObject.withField("foo", asString);
        const asBar = asObject.withField("bar", asNumber);
        expect(asBothOf(asFoo, asBar).test({ foo: "some value", bar: 1 })).toBe(
            true,
        );
        expect(asBothOf(asFoo, asBar).test({ foo: "some value", baz: 1 })).toBe(
            false,
        );
        expect(
            asBothOf(asFoo, asBar).test({ foobar: "some value", bar: 1 }),
        ).toBe(false);
        expect(asBothOf(asFoo, asBar).test(1)).toBe(false);
    });

    test("asLiteral.decode", () => {
        expect(asLiteral(2).decode(2)).toHaveProperty("value", 2);
        expect(asLiteral("some string").decode("some string")).toHaveProperty(
            "value",
            "some string",
        );
        expect(asLiteral(true).decode(true)).toHaveProperty("value", true);
        expect(asLiteral(10.2156).decode(10.2156)).toHaveProperty(
            "value",
            10.2156,
        );
        expect(asLiteral(10.2156).decode(10.2155)).toHaveProperty(
            "reason",
            "expected literal value 10.2156 but got 10.2155",
        );
        expect(
            asLiteral(null as unknown as string).decode(null),
        ).toHaveProperty(
            "reason",
            "asLiteral should be used with string | boolean | number but was used with null",
        );
    });

    test("asLiteral.test", () => {
        expect(asLiteral(2).test(2)).toBe(true);
        expect(asLiteral("some string").test("some string")).toBe(true);
        expect(asLiteral(true).test(true)).toBe(true);
        expect(asLiteral(10.2156).test(10.2156)).toBe(true);
        expect(asLiteral(10.2156).test(10.2155)).toBe(false);
        expect(asLiteral(null as unknown as string).test(null)).toBe(false);
    });

    test("asOptional", () => {
        expect(asOptional(asString).decode(null)).toHaveProperty("value", null);
        expect(asOptional(asString).decode(undefined)).toHaveProperty(
            "value",
            undefined,
        );
        expect(asOptional(asString).decode("string")).toHaveProperty(
            "value",
            "string",
        );
        expect(asOptional(asString).decode(1)).toHaveProperty(
            "reason",
            "failed to decode as Optional<string>:\n" +
                " - expected undefined but got number\n" +
                " - failed to decode as null | string:\n" +
                " - expected a null but got number\n" +
                " - expected a string but got number",
        );
    });

    test("asCustom.decode", () => {
        const asUnamed = asCustom(() => failure("failed"));
        expect(asUnamed.name).toBe("custom decoder");

        type Status = "accepted" | "rejected" | "in-review";
        const asStatus = asCustom<Status>(
            value => {
                if (
                    value === "accepted" ||
                    value === "rejected" ||
                    value === "in-review"
                )
                    return success(value);
                return failure(
                    `expected one of 'accepted', 'rejected', 'in-review' but got ${value}`,
                );
            },
            undefined,
            "status decoder",
        );
        expect(asStatus.name).toBe("status decoder");
        expect(asStatus.decode("accepted")).toHaveProperty("value", "accepted");
        expect(asStatus.decode("rejected")).toHaveProperty("value", "rejected");
        expect(asStatus.decode("in-review")).toHaveProperty(
            "value",
            "in-review",
        );
        expect(asStatus.decode("random")).toHaveProperty(
            "reason",
            `expected one of 'accepted', 'rejected', 'in-review' but got random`,
        );
    });

    test("asCustom.test", () => {
        const asUnamed = asCustom(() => failure("failed"));
        expect(asUnamed.name).toBe("custom decoder");

        type Status = "accepted" | "rejected" | "in-review";
        const asStatus = asCustom<Status>(
            value => {
                if (
                    value === "accepted" ||
                    value === "rejected" ||
                    value === "in-review"
                )
                    return success(value);
                return failure(
                    `expected one of 'accepted', 'rejected', 'in-review' but got ${value}`,
                );
            },
            undefined,
            "status decoder",
        );
        expect(asStatus.name).toBe("status decoder");
        expect(asStatus.test("accepted")).toBe(true);
        expect(asStatus.test("rejected")).toBe(true);
        expect(asStatus.test("in-review")).toBe(true);
        expect(asStatus.test("random")).toBe(false);
    });
});
