export type NoValue = null | undefined;
export type OptionalValue<T> = T | NoValue;
export type NonOptionalType<T> = T extends null | undefined ? never : T;

/**
 * A special type that encourages the move away from null and undefined.
 *
 * An Optional is immutable and is a wrapper type of T | null | undefined
 * that provides useful functions for transformation and safe retrieval of
 * an optional value.
 */
export class Optional<T> {
    private constructor(private optValue: OptionalValue<T>) {}

    /**
     *
     * @param value checks if a value is an Optional
     * @returns
     */
    static isOptional(value: unknown): value is Optional<unknown> {
        return value instanceof Optional;
    }

    /**
     * Checks that a value is neither null nor undefined.
     *
     * Has the added benefit of type narrowing in typescript.
     *
     * @param opt value that can be undefined or null
     * @returns true if the value is neither undefined or null
     */
    static isDefined<U>(opt: OptionalValue<U>): opt is U {
        return opt !== null && opt !== undefined;
    }

    /**
     * The preffered way to create an optional. This also automatically
     * unwraps optionals if you try to create an optional of an optional.
     *
     * @param value to be treated as an optional
     * @returns a new Optional
     */
    static of<U>(value: OptionalValue<U>): Optional<NonOptionalType<U>> {
        if (Optional.isOptional(value)) {
            // returns a new instance just so that `this === that is false`
            return new Optional(value.optValue as NonOptionalType<U>);
        }
        return new Optional(value as NonOptionalType<U>);
    }

    /**
     * Returns true if this optional is not empty, false otherwise.
     */
    get hasValue(): boolean {
        return this.optValue !== null && this.optValue !== undefined;
    }

    /**
     * Returns true if this optional is empty, false otherwise
     */
    get isEmpty(): boolean {
        return !this.hasValue;
    }

    /**
     * Utility for checking equality against the value contained within this optional
     *
     * @param other value to check against
     * @returns true if this optional is this value
     */
    equals(other: T): boolean {
        return other === this.optValue;
    }

    /**
     * If there's a value, returns the result of applying a predicate on the value contained
     * within this optional, or false when no value exists.
     *
     * @param predicate function that test the value
     * @returns false if this optional is empty or the result of applying the predicate
     */
    exists(predicate: (value: T) => boolean): boolean {
        return !this.isEmpty && predicate(this.optValue as T);
    }

    /**
     * Get the value contained within the optional.
     * The value is returned without any checks, so it might be null or undefined.
     */
    get get(): OptionalValue<T> {
        return this.optValue;
    }

    /**
     * Returns the value contained within this optional if it exists or
     * returns a default value supplied.
     *
     * @param defaultValue value returned if this optional is empty
     * @returns the value contained or default supplied.
     */
    getOrElse(defaultValue: T): T {
        if (this.hasValue) {
            return this.optValue as T;
        } else {
            return defaultValue;
        }
    }

    /**
     * Apply a transformation on the value contained within this optional.
     * Does nothing if this optional is empty.
     *
     *
     * @param transformer a transformation function
     * @returns an optional with the transformation potentially applied
     */
    map<U>(transformer: (value: T) => U): Optional<U> {
        if (this.hasValue) {
            return new Optional(transformer(this.optValue as T));
        } else {
            return new Optional<U>(this.optValue as U);
        }
    }

    /**
     * Same as map, but the transformation must return an optional.
     * Does nothing if this optional is empty.
     *
     *
     * @param transformer a transformation function
     * @returns an optional with the transformation potentially applied
     */
    flatMap<U>(transformer: (value: T) => Optional<U>): Optional<U> {
        if (this.hasValue) {
            return transformer(this.optValue as T);
        } else {
            return new Optional(this.optValue as U);
        }
    }

    /**
     * Returns this optional if it has a value or an alternative
     * provided optional
     *
     * @param alternative
     * @returns this or alternative
     */
    orElse(alternative: Optional<T>): Optional<T> {
        if (this.hasValue) {
            return this;
        } else {
            return alternative;
        }
    }
}
