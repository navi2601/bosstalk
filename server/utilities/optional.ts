import typeInfo from "./typeinfo";

export interface Optional<T> {
    hasValue: boolean;
    value: T;
    map<U>(f: (t: T) => U): Optional<U>;
    flatMap<U>(f: (t: T) => Optional<U>): Optional<U>;
    defaultIfNone(t: T): Optional<T>;
}

interface OptionalFunc {
    <T>(value: Optional<T>): Optional<T>;
    <T>(value: T): Optional<T>;
    none<T>(): Optional<T>;
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
}

export { optional };
