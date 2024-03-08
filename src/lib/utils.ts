import {
    DecodingError,
    DecodingErrors,
    DecodingFailure,
    DecodingSuccess,
    Key,
    Message,
    Path,
} from "./types";

/**
 * Transform a Path to it's string representation.
 *
 * @param path Path
 * @returns string representation of the path
 */
export function printPath(path: Path): string {
    if (path.kind === "field") {
        return `.${String(path.field)}`;
    } else {
        return `[${path.index}]`;
    }
}

/**
 * Transform an array of Path to it's string representation.
 *
 * ```ts
 * printPaths([{kind: "field", field: 'field1'}, {kind: "index", index: 1}])
 * // => $root.field[1]
 * ```
 *
 * @param path an array of Path
 * @returns string representation of the path
 */
export function printPaths(paths: Array<Path>): string {
    return `$root${paths.map(printPath).join("")}`;
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
export function prettyPrintFailureError(failure: DecodingFailure): string {
    return failure
        .map((message, paths) => {
            const pathString = printPaths(paths);
            return `${pathString}: ${message}`;
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
            return prettyPrintFailureError(this);
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
        map(transformer) {
            return map(this.errors, transformer);
        },
        foreach(fun) {
            map<void>(this.errors, fun);
        },
    };
}

function map<T>(
    errors: DecodingErrors,
    transformer: (t: Message, path: Array<Path>) => T,
): Array<T> {
    function mapErr(err: DecodingError, pathSoFar: Array<Path>): Array<T> {
        if (typeof err === "string") {
            return [transformer(err, pathSoFar)];
        } else {
            return mapErrs(err.errors, [...pathSoFar, err.path]);
        }
    }

    function mapErrs(errs: DecodingErrors, pathSoFar: Array<Path>): Array<T> {
        if (isArray(errs)) {
            return errs.flatMap(err => mapErr(err, pathSoFar));
        } else {
            return mapErr(errs, pathSoFar);
        }
    }

    return mapErrs(errors, []);
}

type TypeOf =
    | "string"
    | "boolean"
    | "undefined"
    | "bigint"
    | "number"
    | "symbol"
    | "array"
    | "null"
    | "object"
    | "function";

/**
 * An extension of the native javascript `typeof` test that differentiates
 * between null and arrays as thier own type.
 *
 * @param arg value
 * @returns string representation of the type of value
 */
export function typeOf(arg: any): TypeOf {
    if (typeof arg == "string") return "string";
    if (arg === null) {
        return "null";
    } else if (Array.isArray(arg)) {
        return "array";
    } else {
        return typeof arg;
    }
}

/**
 * Checks if an argument is an object.
 * Applies type narrowing in typescript.
 *
 * @param arg argument to check
 * @returns true if argument is an object
 */
export function isObject(arg: unknown): arg is { [k: Key]: any } {
    return typeOf(arg) === "object";
}

/**
 * Checks if an argument is an array.
 * Applies type narrowing in typescript.
 *
 * @param arg argument to check
 * @returns true if argument is an array
 */
export function isArray(arg: unknown): arg is any[] {
    return typeOf(arg) === "array";
}
