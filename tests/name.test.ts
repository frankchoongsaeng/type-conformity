import {
    asArray,
    asBigInt,
    asBoolean,
    asConst,
    asInt,
    asNull,
    asNumber,
    asObject,
    asString,
    asTuple2,
    asTupleN,
    asUndefined,
} from "../src";

describe("Decoders name test", () => {
    test("asUndefined.name", () => {
        expect(asUndefined.name).toBe("undefined");
    });

    test("asNull.name", () => {
        expect(asNull.name).toBe("null");
    });

    test("asString.name", () => {
        expect(asString.name).toBe("string");
    });

    test("asNumber.name", () => {
        expect(asNumber.name).toBe("number");
    });

    test("asBigInt.name", () => {
        expect(asBigInt.name).toBe("bigint");
    });

    test("asBoolean.name", () => {
        expect(asBoolean.name).toBe("boolean");
    });

    test("asConst.name", () => {
        expect(asConst(2).name).toBe("2");
        expect(asConst("2").name).toBe(`"2"`);
        expect(asConst("foo").name).toBe(`"foo"`);
        expect(asConst(true).name).toBe("true");
        expect(asConst(2.12).name).toBe("2.12");
        expect(asConst(BigInt(1234567)).name).toBe("1234567n");
        expect(asConst(Symbol("unique sym")).name).toBe("Symbol(unique sym)");
        expect(asConst([1, 2, 3]).name).toBe("UniqueInstance<Array>");
        expect(asConst({ foo: 1 }).name).toBe("UniqueInstance<Object>");

        class DB {}
        const db = new DB();
        expect(asConst(db).name).toBe("UniqueInstance<DB>");
    });

    test("asArray.name", () => {
        expect(asArray(asString).name).toBe("Array<string>");
    });

    test("asTuple2.name", () => {
        expect(asTuple2(asString, asNumber).name).toBe("Tuple<string, number>");
    });

    test("asTupleN.name", () => {
        expect(asTupleN(asString, asNumber, asBoolean).name).toBe(
            "Tuple<string, number, boolean>",
        );
    });

    test("asObject.name", () => {
        expect(asObject.name).toBe("{}");
        expect(asObject.withField("foo", asString).name).toBe("{foo: string}");
    });
});
