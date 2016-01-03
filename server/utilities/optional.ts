"use strict";
import typeInfo from "./typeinfo";

export interface Optional<T> {
    /** Check if this optional has a value. */
    hasValue: boolean;
    
    /** Forcibly retrieve the value of this optional. If this is a None optional, an exception will be thrown */
    value: T;
    
    /** Transform the current optional by applying a transformation function
     * @param f the transformation function.
     */
    map<U>(f: (t: T) => U): Optional<U>;
    
    /** Transform and flattens the current optional by applying a transformation function
     * @param f the transformation function
     */
    flatMap<U>(f: (t: T) => Optional<U>): Optional<U>;
    
    /** Replace a None optional with an optional with a value by supplying that value 
     * @param defaultValue the default value as replacement if the current optional is None
     */
    defaultIfNone(defaultValue: T): Optional<T>;
    
    /** Combine two optionals into one
     * @param other the other optional
     * @param f value combiner
     */
    combine<U, V>(other: Optional<U>, f: (t: T, u: U) => V): Optional<V>;
    
    /** Combine and flatten two optionals into one
     * @param other the other optional
     * @param f value combiner
     */
    flatCombine<U, V>(other: Optional<U>, f: (t: T, u: U) => Optional<V>): Optional<V>;
}

export interface OptionalFunc {
    /** Normalise an optional.
     * @param value an existing optional. If null or undefined is passed in, a None<T> optional will be returned
     */
    <T>(value: Optional<T>): Optional<T>;
    
    /** Wrapping a value of type T into an Optional<T>.
     * @param value the content to wrap around. If null or undefined is passed in, a None<T> optional will be returned.
     */
    <T>(value: T): Optional<T>;
    
    /** Returning a None<T> optional
     */
    none<T>(): Optional<T>;
    
    /** Test if an existing value is an optional
     * @param test the value to test if it is an optional
     */
    isOptional(test: any): boolean;
}

const optional: OptionalFunc = <OptionalFunc>function<T>(input: any): Optional<T> {
    if (typeInfo(input).isNullOrUndefined) {
        return optional.none<T>();
    }
    else {
        if (optional.isOptional(input)) {
            return <Optional<T>>(input);
        }
        else {
            return new Some<T>(<T>input);
        }
    }
};

optional.none = function<T>(): Optional<T> {
    return <Optional<T>>None.instance;
};

optional.isOptional = function<T>(test: any): boolean {
    const type = typeInfo(test);
    return !type.isNullOrUndefined && (test instanceof Some || test instanceof None);
};

class Some<T> implements Optional<T> {
    private _value: T;
    constructor(value: T) {
        this._value = value;
    }
    
    get hasValue(): boolean { return true; }
    get value(): T { return this._value; }
    
    map<U>(f: (t: T) => U): Optional<U> {
        return optional(f(this._value));
    }
    
    flatMap<U>(f: (t: T) => Optional<U>): Optional<U> {
        return optional(f(this._value));
    }
    
    defaultIfNone(t: T): Optional<T> {
        return this;
    }
    
    combine<U, V>(other: Optional<U>, f: (t: T, u: U) => V): Optional<V> {
        return this.flatMap(t => other.map(u => f(t, u)));
    }
    
    flatCombine<U, V>(other: Optional<U>, f: (t: T, u: U) => Optional<V>): Optional<V> {
        return this.flatMap(t => other.flatMap(u => f(t, u)));
    }
}

class None<T> implements Optional<T> {
    static instance = new None();
    get hasValue(): boolean { return true; }
    get value(): T { 
        throw new Error("Optional value does not exist"); 
    }
    
    map<U>(f: (t: T) => U): Optional<U> {
        return optional.none<U>();
    }
    
    flatMap<U>(f: (t: T) => Optional<U>): Optional<U> {
        return optional.none<U>();
    }
    
    defaultIfNone(t: T): Optional<T> {
        return optional(t);
    }
    
    combine<U, V>(other: Optional<U>, f: (t: T, u: U) => V): Optional<V> {
        return optional.none<V>();
    }
    
    flatCombine<U, V>(other: Optional<U>, f: (t: T, u: U) => Optional<V>): Optional<V> {
        return optional.none<V>();
    }
}

export { optional };
