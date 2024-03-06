import { Optional } from "../../src";

describe("Optional tests", () => {
    test("Optional.of", () => {
        expect(Optional.of(1)).toBeInstanceOf(Optional);

        const optional = Optional.of(null);
        const notNestedOptional = Optional.of(optional);
        expect(notNestedOptional).toBeInstanceOf(Optional);
        expect(notNestedOptional.get).toBe(null);
        expect(notNestedOptional).not.toBe(optional);
    });

    test("Optional.isOptional", () => {
        expect(Optional.isOptional({})).toBe(false);
        expect(Optional.isOptional(Optional.of({}))).toBe(true);
    });

    test("Optional.isDefined", () => {
        expect(Optional.isDefined("foo")).toBe(true);
        expect(Optional.isDefined(0)).toBe(true);
        expect(Optional.isDefined(false)).toBe(true);
        expect(Optional.isDefined(true)).toBe(true);
        expect(Optional.isDefined(null)).toBe(false);
        expect(Optional.isDefined(undefined)).toBe(false);
    });

    test("Optional.hasValue", () => {
        expect(Optional.of("foo").hasValue).toBe(true);
        expect(Optional.of(null).hasValue).toBe(false);
        expect(Optional.of(undefined).hasValue).toBe(false);
    });

    test("Optional.isEmpty", () => {
        expect(Optional.of("foo").isEmpty).toBe(false);
        expect(Optional.of(null).isEmpty).toBe(true);
        expect(Optional.of(undefined).isEmpty).toBe(true);
    });

    test("Optional.equals", () => {
        const empty: Optional<string> = Optional.of(null);
        expect(empty.equals("null")).toBe(false);

        const nonEmpty: Optional<string> = Optional.of("foo");
        expect(nonEmpty.equals("foo")).toBe(true);
        expect(nonEmpty.equals("bar")).toBe(false);
    });

    test("Optional.exists", () => {
        const empty: Optional<string> = Optional.of(null);
        expect(empty.exists(_ => true)).toBe(false);

        const nonEmpty: Optional<string> = Optional.of("foo");
        expect(nonEmpty.exists(str => str === "foo")).toBe(true);
        expect(nonEmpty.exists(str => str === "bar")).toBe(false);
    });

    test("Optional.get", () => {
        expect(Optional.of("foo").get).toBe("foo");
        expect(Optional.of(0).get).toBe(0);
        expect(Optional.of(false).get).toBe(false);
        expect(Optional.of(true).get).toBe(true);
        expect(Optional.of(null).get).toBe(null);
        expect(Optional.of(undefined).get).toBe(undefined);
    });

    test("Optional.getOrElse", () => {
        expect(Optional.of("foo").getOrElse("bar")).toBe("foo");
        expect(Optional.of(0).getOrElse(1)).toBe(0);
        expect(Optional.of(false).getOrElse(true)).toBe(false);
        expect(Optional.of(true).getOrElse(false)).toBe(true);
        expect(Optional.of<string>(null).getOrElse("this")).toBe("this");
        expect(Optional.of<string>(undefined).getOrElse("that")).toBe("that");
    });

    test("Optional.map", () => {
        expect(Optional.of("foo").map(val => val + " modified")).toHaveProperty(
            "get",
            "foo modified",
        );
        expect(Optional.of(null).map(val => val + " modified")).toHaveProperty(
            "get",
            null,
        );
    });

    test("Optional.flatMap", () => {
        expect(
            Optional.of("foo").flatMap(val => Optional.of(val + " modified")),
        ).toHaveProperty("get", "foo modified");
        expect(
            Optional.of(null).flatMap(val => Optional.of(val + " modified")),
        ).toHaveProperty("get", null);
    });

    test("Optional.flatMap", () => {
        expect(
            Optional.of("foo").orElse(Optional.of("default")),
        ).toHaveProperty("get", "foo");
        expect(
            Optional.of<string>(null).orElse(Optional.of("default")),
        ).toHaveProperty("get", "default");
    });
});
