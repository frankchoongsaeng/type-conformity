import {
    DecodingError,
    DecodingFailure,
    DecodingSuccess,
    Key,
    Path,
} from "./types";

export function printPath(path: Path): string {
    if (path.kind === "field") {
        return `.${typeof path.field === "symbol" ? String(path.field) : path.field}`;
    } else {
        return `[${path.index}]`;
    }
}

export function printHelper(error: DecodingError): Array<string> {
    if (typeof error === "string") {
        return [`: ${error}`];
    } else {
        const { path, errors } = error;
        if (Array.isArray(errors)) {
            return errors.flatMap(err =>
                printHelper(err).map(
                    messageSoFar => `${printPath(path)}${messageSoFar}`,
                ),
            );
        } else {
            return printHelper(errors).map(
                messageSoFar => `${printPath(path)}${messageSoFar}`,
            );
        }
    }
}

/**
 * Pretty prints errors with the rational that multiple errors can occur in an array, or an object.
 *
 * A top level decoding error always starts with "$root" (not to be confused with a field called "root")
 * ```ts
 * asString.decode(1)
 * // $root: expected string but got number
 * ```
 *
 * An array can return multiple errors
 * ```ts
 * asArray(asString).decode(["foo", 1, "bar", null])
 * // $root[1]: expected string but got number
 * // $root[3]: expected string but got null
 * ```
 *
 * An object can return multiple errors
 * ```ts
 * const decoder = asObject.withField(
 *      "foo",
 *      asArray(
 *          asObject.withField("bar", asString)
 *      )
 * )
 *
 * decoder.decode({ foo: [ {bar: "buzz"}, {fizz: "foo"}, {bar: 2} ] })
 * // $root.foo[1].bar: expected string but got undefined
 * // $root.foo[2].bar: expected string but got number
 * ```
 *
 * @param errors all the decoding errors that occurred
 * @returns pretty printed error string
 */
export function prettyPrintError(errors: Array<DecodingError>): string {
    return errors
        .flatMap((err: DecodingError) => {
            return printHelper(err).map(message => `$root${message}`);
        })
        .join("\n");
}

/**
 * Constructs a DecodingSuccess of type T that wraps a value of type T.
 *
 * @param v value
 * @returns A DecodingSuccess object
 */
export function success<T>(v: T): DecodingSuccess<T> {
    return {
        success: true,
        failed: false,
        value: v,
    };
}

/**
 * Constructs a DecodingFailure object with a reason.
 *
 * @param errors reason for the decoding failure
 * @returns a DecodingFailure object
 */
export function failure(
    errors: Array<DecodingError> | DecodingError,
): DecodingFailure {
    return {
        success: false,
        failed: true,
        errors,
        get reason(): string {
            return prettyPrintError(
                Array.isArray(this.errors) ? this.errors : [this.errors],
            );
        },
        concat(that) {
            const asArray = (errs: Array<DecodingError> | DecodingError) => {
                if (Array.isArray(errs)) return errs;
                else return [errs];
            };
            const thisErrors = asArray(this.errors);
            const thoseErrors = asArray(that.errors);
            return thisErrors.concat(thoseErrors);
        },
    };
}

type TypeOf<T> = T extends string
    ? "string"
    : T extends boolean
      ? "boolean"
      : T extends undefined
        ? "undefined"
        : T extends bigint
          ? "bigint"
          : T extends number
            ? "number"
            : T extends symbol
              ? "symbol"
              : T extends []
                ? "array"
                : T extends null
                  ? "null"
                  : T extends object
                    ? "object"
                    : T extends Function
                      ? "function"
                      : "never";

/**
 * An extension of the native javascript `typeof` test that differentiates
 * between null and arrays as thier own type.
 *
 * @param arg value
 * @returns string representation of the type of value
 */
export function typeOf(arg: any): TypeOf<typeof arg> {
    if (typeof arg == "string") return "string";
    if (arg === null) {
        return "null";
    } else if (Array.isArray(arg)) {
        return "array";
    } else {
        return typeof arg;
    }
}

export function isObject(arg: unknown): arg is { [k: Key]: any } {
    return typeOf(arg) === "object";
}

export function isArray(arg: unknown): arg is any[] {
    return typeOf(arg) === "array";
}
