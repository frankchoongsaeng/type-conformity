import {
    asArray,
    asBoolean,
    asCustom,
    asConst,
    asNull,
    asNumber,
    asObject,
    asString,
    asTuple,
    asUndefined,
    asBigInt,
    asOptional,
    asOptionalValue,
    DecodingException,
    asInt,
    fromObject,
} from "../src";
import { success, failure } from "../src/lib/utils";

describe("decoders", () => {
    // decoder ops test
    test("decoder.decodeOrDie", () => {
        expect(() => asString.parse("")).not.toThrow(DecodingException);
        expect(() => asString.parse(1)).toThrow(DecodingException);
    });

    test("decoder.map", () => {
        expect(
            asString.map(str => str.toUpperCase()).decode("foo"),
        ).toHaveProperty("value", "FOO");
    });

    test("decoder.transform", () => {
        expect(
            asString.transform(str => str.toUpperCase()).decode("foo"),
        ).toHaveProperty("value", "FOO");
        expect(
            asString.transform(str => str.toUpperCase()).decode(null),
        ).toHaveProperty("reason", "$root: expected string but got null");
    });

    test("decoder.try", () => {
        const asNumberString = asString.try(str => {
            if (Number.isNaN(Number(str))) {
                return failure("expected number string");
            } else {
                return success(Number(str));
            }
        });
        expect(asNumberString.decode(10)).toHaveProperty(
            "reason",
            "$root: expected string but got number",
        );
        expect(asNumberString.decode("10")).toHaveProperty("value", 10);
        expect(asNumberString.decode("something else")).toHaveProperty(
            "reason",
            "$root: expected number string",
        );
    });

    test("decoder.or", () => {
        const asStringOrNumber = asString.or(asNumber);
        expect(asStringOrNumber.decode("foo")).toHaveProperty("value", "foo");
        expect(asStringOrNumber.decode(1)).toHaveProperty("value", 1);
    });

    // decoders
    test("asUndefined.decode", () => {
        expect(asUndefined.decode(undefined)).toHaveProperty(
            "value",
            undefined,
        );
        expect(asUndefined.decode(null)).toHaveProperty(
            "reason",
            `$root: expected undefined but got null`,
        );
        expect(asUndefined.decode("string")).toHaveProperty(
            "reason",
            `$root: expected undefined but got string`,
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
            `$root: expected null but got undefined`,
        );
        expect(asNull.decode("string")).toHaveProperty(
            "reason",
            `$root: expected null but got string`,
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
            `$root: expected string but got null`,
        );
        expect(asString.decode(1)).toHaveProperty(
            "reason",
            `$root: expected string but got number`,
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
            `$root: expected number but got null`,
        );
        expect(asNumber.decode("1")).toHaveProperty(
            "reason",
            `$root: expected number but got string`,
        );
        expect(asNumber.decode(NaN)).toHaveProperty(
            "reason",
            "$root: expected number but got NaN",
        );
    });

    test("asNumber.test", () => {
        expect(asNumber.test(1)).toBe(true);
        expect(asNumber.test(1.2)).toBe(true);
        expect(asNumber.test(null)).toBe(false);
        expect(asNumber.test("1")).toBe(false);
    });

    test("asBigInt.decode", () => {
        expect(asBigInt.decode(BigInt(1))).toHaveProperty("value", BigInt(1));
        expect(asBigInt.decode(10)).toHaveProperty("value", BigInt(10));
        expect(asBigInt.decode(null)).toHaveProperty(
            "reason",
            `$root: expected bigint but got null`,
        );
        expect(asBigInt.decode(1.2)).toHaveProperty(
            "reason",
            "$root: expected bigint but got float",
        );
        expect(asBigInt.decode("1")).toHaveProperty(
            "reason",
            `$root: expected bigint but got string`,
        );
    });

    test("asBigInt.test", () => {
        expect(asBigInt.test(BigInt(1))).toBe(true);
        expect(asBigInt.test(10)).toBe(true);
        expect(asBigInt.test(null)).toBe(false);
        expect(asBigInt.test(1.2)).toBe(false);
        expect(asBigInt.test("1")).toBe(false);
    });

    test("asBoolean.decode", () => {
        expect(asBoolean.decode(true)).toHaveProperty("value", true);
        expect(asBoolean.decode(false)).toHaveProperty("value", false);
        expect(asBoolean.decode(1.2)).toHaveProperty(
            "reason",
            `$root: expected boolean but got number`,
        );
        expect(asBoolean.decode(null)).toHaveProperty(
            "reason",
            `$root: expected boolean but got null`,
        );
        expect(asBoolean.decode("1")).toHaveProperty(
            "reason",
            `$root: expected boolean but got string`,
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
                .withFieldAlias("field1", asString, "fieldAlias")
                .withField("field2", asNumber)
                .withoutField("fieldAlias")
                .withField("field4", asNull)
                .decode({
                    field1: "string value",
                    field2: 2,
                    field3: false,
                    field4: null,
                }),
        ).toHaveProperty("value", {
            field2: 2,
            field4: null,
        });
        expect(
            asObject
                .withFieldAlias("field1", asString, "fieldAlias")
                .withField("field2", asNumber)
                .withFieldAlias("field3", asBoolean, "boolAlias")
                .withField("field4", asNull)
                .withoutField("field2")
                .decode({
                    field1: "string value",
                    field2: 2,
                    field3: false,
                    field4: null,
                }),
        ).toHaveProperty("value", {
            fieldAlias: "string value",
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
            "$root.field2: expected number but got undefined",
        );
        expect(
            asObject
                .withField("field1", asString)
                .withField("field2", asNumber)
                .decode(null),
        ).toHaveProperty("reason", "$root: expected object but got null");
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

    test("fromObject.decode", () => {
        expect(fromObject({}).decode({})).toHaveProperty("value", {});
        expect(fromObject({}).decode({ field1: "hello" })).toHaveProperty(
            "value",
            {},
        );
        expect(
            fromObject({ field1: asString }).decode({ field1: "string value" }),
        ).toHaveProperty("value", { field1: "string value" });
        expect(
            fromObject({
                field1: asString,
                field2: asNumber,
                field3: asBoolean,
                field4: asNull,
            }).decode({
                field1: "string value",
                field2: 2,
                field3: false,
                field4: null,
            }),
        ).toHaveProperty("value", {
            field1: "string value",
            field2: 2,
            field3: false,
            field4: null,
        });
        expect(
            fromObject({ field1: asString, field2: asNumber }).decode({
                field1: "string value",
            }),
        ).toHaveProperty(
            "reason",
            "$root.field2: expected number but got undefined",
        );
    });

    test("fromObject.test", () => {
        expect(fromObject({}).test({})).toBe(true);
        expect(fromObject({}).test({ field1: "hello" })).toBe(true);
        expect(
            fromObject({ field1: asString }).test({ field1: "string value" }),
        ).toBe(true);
        expect(
            fromObject({
                field1: asString,
                field2: asNumber,
                field3: asBoolean,
                field4: asNull,
            }).test({
                field1: "string value",
                field2: 2,
                field3: false,
                field4: null,
            }),
        ).toBe(true);
        expect(
            fromObject({ field1: asString, field2: asNumber }).test({
                field1: "string value",
            }),
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
            `$root[1]: expected string but got null\n` +
                `$root[2]: expected string but got boolean`,
        );
        expect(asArray(asString).decode(null)).toHaveProperty(
            "reason",
            `$root: expected Array<string> but got null`,
        );
    });

    test("asArray.test", () => {
        expect(asArray(asString).test([])).toBe(true);
        expect(asArray(asString).test(["string1", "string2"])).toBe(true);
        expect(asArray(asString).test(["string1", null, true])).toBe(false);
        expect(asArray(asString).test(null)).toBe(false);
    });

    test("asTuple.decode", () => {
        expect(
            asTuple(asString, asBoolean, asNumber).decode([
                "string value",
                true,
                1,
            ]),
        ).toHaveProperty("value", ["string value", true, 1]);
        expect(
            asTuple(asString, asBoolean, asNumber).decode([
                "string1",
                "string2",
                true,
            ]),
        ).toHaveProperty("reason", "$root[1]: expected boolean but got string");
        expect(
            asTuple(asString, asBoolean, asNumber).decode([
                "string1",
                true,
                1,
                null,
            ]),
        ).toHaveProperty("value", ["string1", true, 1]);
        expect(
            asTuple(asString, asBoolean, asNumber).decode(null),
        ).toHaveProperty(
            "reason",
            `$root: expected Tuple<string, boolean, number> but got null`,
        );
    });

    test("asTuple.test", () => {
        expect(
            asTuple(asString, asBoolean, asNumber).test([
                "string value",
                true,
                1,
            ]),
        ).toBe(true);
        expect(
            asTuple(asString, asBoolean, asNumber).test([
                "string1",
                "string2",
                true,
            ]),
        ).toBe(false);
        expect(
            asTuple(asString, asBoolean, asNumber).test([
                "string1",
                true,
                1,
                null,
            ]),
        ).toBe(false);
        expect(asTuple(asString, asBoolean, asNumber).test(null)).toBe(false);
    });

    test("asConst.decode", () => {
        expect(asConst(2).decode(2)).toHaveProperty("value", 2);
        expect(asConst("some string").decode("some string")).toHaveProperty(
            "value",
            "some string",
        );
        expect(asConst(true).decode(true)).toHaveProperty("value", true);
        expect(asConst(10.2156).decode(10.2156)).toHaveProperty(
            "value",
            10.2156,
        );
        expect(asConst(null).decode(null)).toHaveProperty("value", null);
        expect(asConst(10.2156).decode(10.2155)).toHaveProperty(
            "reason",
            "$root: expected value 10.2156 but got 10.2155",
        );
        expect(asConst(10.2156).decode("10.2155")).toHaveProperty(
            "reason",
            "$root: expected value 10.2156 but got string",
        );

        expect(asConst(null).decode(2)).toHaveProperty(
            "reason",
            "$root: expected value null but got number",
        );

        const obj1 = { foo: 1, bar: "buzz" };
        const obj2 = { foo: 1, bar: "buzz" };

        expect(asConst(obj1).decode(obj1)).toHaveProperty("value", obj1);

        expect(asConst(obj1).decode(obj2)).toHaveProperty(
            "reason",
            "$root: expected instance did not match actual instance",
        );
    });

    test("asConst.test", () => {
        expect(asConst(2).test(2)).toBe(true);
        expect(asConst("some string").test("some string")).toBe(true);
        expect(asConst(true).test(true)).toBe(true);
        expect(asConst(10.2156).test(10.2156)).toBe(true);
        expect(asConst(10.2156).test(10.2155)).toBe(false);
        expect(asConst(null).test(null)).toBe(true);
        expect(asConst(null).test(2)).toBe(false);

        const obj1 = { foo: 1, bar: "buzz" };
        const obj2 = { foo: 1, bar: "buzz" };
        expect(asConst(obj1).test(obj1)).toBe(true);
        expect(asConst(obj1).test(obj2)).toBe(false);
    });

    test("asOptional.decode", () => {
        expect(asOptional(asString).decode(null)).toHaveProperty("value", {
            optValue: null,
        });
        expect(asOptional(asString).decode(undefined)).toHaveProperty("value", {
            optValue: undefined,
        });
        expect(asOptional(asString).decode("string")).toHaveProperty("value", {
            optValue: "string",
        });
        expect(asOptional(asString).decode(1)).toHaveProperty(
            "reason",
            "$root: expected undefined but got number\n" +
                "$root: expected null but got number\n" +
                "$root: expected string but got number",
        );
    });

    test("asOptional.test", () => {
        expect(asOptional(asString).test(null)).toBe(true);
        expect(asOptional(asString).test(undefined)).toBe(true);
        expect(asOptional(asString).test("string")).toBe(true);
        expect(asOptional(asString).test(1)).toBe(false);
    });

    test("asOptionalValue.decode", () => {
        expect(asOptionalValue(asString).decode(null)).toHaveProperty(
            "value",
            null,
        );
        expect(asOptionalValue(asString).decode(undefined)).toHaveProperty(
            "value",
            undefined,
        );
        expect(asOptionalValue(asString).decode("string")).toHaveProperty(
            "value",
            "string",
        );
        expect(asOptionalValue(asString).decode(1)).toHaveProperty(
            "reason",
            "$root: expected undefined but got number\n" +
                "$root: expected null but got number\n" +
                "$root: expected string but got number",
        );
    });

    test("asOptionalValue.test", () => {
        expect(asOptionalValue(asString).test(null)).toBe(true);
        expect(asOptionalValue(asString).test(undefined)).toBe(true);
        expect(asOptionalValue(asString).test("string")).toBe(true);
        expect(asOptionalValue(asString).test(1)).toBe(false);
    });
});

// ++++++++++++++++++++++ EXTRAS  ++++++++++++++++++++++ //

describe("decoders/extras", () => {
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
            `$root: expected one of 'accepted', 'rejected', 'in-review' but got random`,
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

    test("or.decode", () => {
        expect(asString.or(asBoolean).decode("string value")).toHaveProperty(
            "value",
            "string value",
        );
        expect(asString.or(asBoolean).decode(true)).toHaveProperty(
            "value",
            true,
        );
        expect(asString.or(asBoolean).decode(1)).toHaveProperty(
            "reason",
            "$root: expected string but got number\n" +
                "$root: expected boolean but got number",
        );
    });

    test("or.test", () => {
        expect(asString.or(asBoolean).test("string value")).toBe(true);
        expect(asString.or(asBoolean).test(true)).toBe(true);
        expect(asString.or(asBoolean).test(1)).toBe(false);
    });

    test("and.decode", () => {
        const asFoo = asObject.withField("foo", asString);
        const asBar = asObject.withField("bar", asNumber);
        expect(
            asFoo.and(asBar).decode({ foo: "some value", bar: 1 }),
        ).toHaveProperty("value", { foo: "some value", bar: 1 });
        expect(
            asFoo.and(asBar).decode({ foo: "some value", baz: 1 }),
        ).toHaveProperty(
            "reason",
            "$root.bar: expected number but got undefined",
        );
        expect(
            asFoo.and(asBar).decode({ foobar: "some value", bar: 1 }),
        ).toHaveProperty(
            "reason",
            "$root.foo: expected string but got undefined",
        );
        expect(asFoo.and(asBar).decode(1)).toHaveProperty(
            "reason",
            "$root: expected object but got number",
        );
    });

    test("and.test", () => {
        const asFoo = asObject.withField("foo", asString);
        const asBar = asObject.withField("bar", asNumber);
        expect(asFoo.and(asBar).test({ foo: "some value", bar: 1 })).toBe(true);
        expect(asFoo.and(asBar).test({ foo: "some value", baz: 1 })).toBe(
            false,
        );
        expect(asFoo.and(asBar).test({ foobar: "some value", bar: 1 })).toBe(
            false,
        );
        expect(asFoo.and(asBar).test(1)).toBe(false);
    });

    test("asInt.decode", () => {
        expect(asInt.decode(1)).toHaveProperty("value", 1);
        expect(asInt.decode(1.2)).toHaveProperty(
            "reason",
            "$root: expected integer but got 1.2",
        );
        expect(asInt.decode("1")).toHaveProperty(
            "reason",
            "$root: expected number but got string",
        );
    });
});
