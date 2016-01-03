"use strict";

import typeInfo from "./typeinfo";

export interface Grouping<TKey, TVal> {
    key: TKey;
    values: Seq<TVal>;
}

export interface Seq<T> extends Iterable<T> {
    /** apply a function on every element of the sequence
     * @param func function to be applied for each element
     */
    forEach(func: (t: T, index?: number) => void): void;

    /** transform a sequence by mapping each element through a function
     * @param func transform function
     */
    map<U>(func: (t: T, index?: number) => U): Seq<U>;

    /** transform a sequence by mapping each element to its own sequence, then joins these sub-sequences into a single sequence
     * @param func transform function to turns each element into a separate sequence
     */
    flatMap<U>(func: (t: T, index?: number) => Seq<U>): Seq<U>;

    /** filter a sequence by applying a predicate on each element
     * @param predicate the predicate function to decide whether an element is to appear in the new sequence
     */
    filter(predicate: (t: T, index?: number) => boolean): Seq<T>;

    /** create a new sequence of distinct elements from current sequence */
    distinct(): Seq<T>;

    /** create a new sequence of elements each has a distinct key
     * @param keySelector function to extract the key from each element
     */
    distinctBy<U>(keySelector: (t: T, index?: number) => U): Seq<T>;

    /** reducing a sequence into a single value, starting from an initial value.
     * @param initialValue the initial value of reduction
     * @param reducer reducer function
     */
    reduce<U>(reducer: (left: U, right: T, rightIndex?: number, source?: Seq<T>) => U, initialValue: U): U;
    reduce(reducer: (left: T, right: T, rightIndex?: number, source?: Seq<T>) => T): T;

    /** returns the first element of the sequence, or undefined if sequence is empty */
    first(): T;

    /** returns the last element of the sequence, or undefined if sequence is empty */
    last(): T;

    /** count the number of elements in the sequence */
    count(): number;

    /** take the first n elements of the sequence
     * @param n number of elements to take
     */
    take(n: number): Seq<T>;

    /** skip the first n elements of the sequence, and return the remaining elements 
     * @param n number of elements to skip
     */
    skip(n: number): Seq<T>;

    /** creates a new sequence by taking elements from the current sequence while the element satisfies a condition
     * @param predicate condition under which the element is taken for the new sequence
     */
    takeWhile(predicate: (t: T, index?: number) => boolean): Seq<T>;

    /** skip the first few elements from the sequence that satisfies a condition,
     * and create a new sequence with the remaining elements
     * @param predicate condition under which the element is skipped
     */
    skipWhile(predicate: (t: T, index?: number) => boolean): Seq<T>;

    /** group the sequence by a key
     * @param keySelector key extraction function
     */
    groupBy<U>(keySelector: (t: T, index?: number) => U): Seq<Grouping<U, T>>;

    /** sorting a sequence
     * @param compareFunc the compare function with the same semantics as Array.prototype.sort
     */
    sort(compareFunc?: (left: T, right: T) => number): Seq<T>;

    /** reverse a sequence */
    reverse(): Seq<T>;

    /** concatenate the sequence with another sequence
     * @param other the other sequence
     */
    concat(other: Seq<T>): Seq<T>;

    /** creats a new sequence by transforming each element from the sequence and its corresponding element from 
     * the other sequence into a new element
     * @param other the other sequence
     * @param zipper transform function
     */
    zip<U, V>(other: Seq<U>, zipper: (t: T, u: U) => V): Seq<V>;

    /** yield a single element if the sequence is empty 
     * @param defaultValue the value of the single element if the current sequence is empty
     */
    defaultWith(defaultValue: T): Seq<T>;

    /** turns a sequence into an array */
    toArray(): T[];
}

class SeqImpl<T> implements Seq<T> {
    [Symbol.iterator]: () => Iterator<T>;

    constructor(iteratorFunc: () => Iterator<T>) {
        this[Symbol.iterator] = iteratorFunc;
    }

    forEach(func: (t: T, index?: number) => void): void {
        let index = 0;
        for (const t of this) {
            func(t, index);
            ++index;
        }
    }

    map<U>(func: (t: T, index?: number) => U): Seq<U> {
        const self = this;
        return new SeqImpl<U>(function* (): any {
            let index = 0;
            for (const t of self) {
                yield func(t, index);
                ++index;
            }
        });
    }

    flatMap<U>(func: (t: T, index?: number) => Seq<U>): Seq<U> {
        const self = this;
        return new SeqImpl<U>(function* (): any {
            let index = 0;
            for (const seq of self) {
                for (const u of func(seq, index)) {
                    yield u;
                }

                ++index;
            }
        });
    }

    filter(predicate: (t: T, index?: number) => boolean): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            let index = 0;
            for (const t of self) {
                if (predicate(t, index)) {
                    yield t;
                }

                ++index;
            }
        });
    }

    distinct(): Seq<T> {
        const set = new Set<T>();
        const self = this;
        return new SeqImpl<T>(function* (): any {
            for (const t of self) {
                if (!set.has(t)) {
                    set.add(t);
                    yield t;
                }
            }
        });
    }

    distinctBy<U>(keySelector: (t: T, index?: number) => U): Seq<T> {
        const set = new Set<U>();
        const self = this;
        return new SeqImpl<T>(function* (): any {
            let index = 0;
            for (const t of self) {
                const key = keySelector(t, index);
                if (!set.has(key)) {
                    set.add(key);
                    yield t;
                }

                ++index;
            }
        });
    }

    reduce(...args): any {
        if (args.length === 1) {
            return this.__reduceWithoutInitialValue(args[0]);
        }
        else {
            return this.__reduceWithInitialValue(args[0], args[1]);
        }
    }

    first(): T {
        for (const t of this) {
            return t;
        }

        return undefined;
    }

    last(): T {
        let temp: T = undefined;
        for (const t of this) {
            temp = t;
        }

        return temp;
    }

    count(): number {
        let n = 0;
        for (const ignore of this) {
            ++n;
        }

        return n;
    }

    take(n: number): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            let taken = 0;
            for (const t of self) {
                if (taken < n) {
                    ++taken;
                    yield t;
                }
                else {
                    break;
                }
            }
        });
    }

    skip(n: number): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            let skipped = 0;
            for (const t of self) {
                if (skipped < n) {
                    ++skipped;
                }
                else {
                    yield t;
                }
            }
        });
    }

    takeWhile(predicate: (t: T, index?: number) => boolean): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            let index = 0;
            for (const t of self) {
                if (predicate(t, index)) {
                    yield t;
                }

                ++index;
            }
        });
    }

    skipWhile(predicate: (t: T, index?: number) => boolean): Seq<T> {
        const self = this;
        let skip = true;
        return new SeqImpl<T>(function* (): any {
            let index = 0;
            for (const t of self) {
                if (skip && predicate(t, index)) {
                    continue;
                }
                else {
                    skip = false;
                    yield t;
                }

                ++index;
            }
        });
    }

    groupBy<U>(keySelector: (t: T, index?: number) => U): Seq<Grouping<U, T>> {
        const map = new Map<U, T[]>();
        let index = 0;
        for (let t of this) {
            const key = keySelector(t, index);
            let array = map.get(key);
            if (array === undefined) {
                array = [];
                map.set(key, array);
            }

            array.push(t);
            ++index;
        }

        return new SeqImpl<Grouping<U, T>>(function* (): any {
            for (const entry of map.entries()) {
                const key = entry[0];
                const values = entry[1];
                yield {
                    key: key,
                    values: new SeqArrayImpl<T>(values)
                };
            }
        });
    }

    sort(compareFunc?: (left: T, right: T) => number): Seq<T> {
        return new SeqArrayImpl<T>(this.toArray().sort(compareFunc));
    }

    reverse(): Seq<T> {
        return new SeqArrayImpl<T>(this.toArray().reverse());
    }

    concat(other: Seq<T>): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            for (let t of self) {
                yield t;
            }

            for (let t of other) {
                yield t;
            }
        });
    }

    zip<U, V>(other: Seq<U>, zipper: (t: T, u: U) => V): Seq<V> {
        const self = this;
        return new SeqImpl<V>(function* (): any {
            let seqGen = other[Symbol.iterator]();
            for (let x of self) {
                let otherGen = seqGen.next();
                if (otherGen.done) {
                    break;
                }
                else {
                    yield zipper(x, otherGen.value);
                }
            }
        });
    }

    defaultWith(defaultValue: T): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function * (): any {
            let isEmpty = true;
            for (const x of self) {
                isEmpty = false;
                yield x;
            }

            if (!isEmpty) {
                yield defaultValue;
            }
        });
    }

    toArray(): T[] {
        const array: T[] = [];
        for (let t of this) {
            array.push(t);
        }

        return array;
    }
    
    private __reduceWithInitialValue<U>(reducer: (left: U, right: T, rightIndex?: number, source?: Seq<T>) => U, initialValue: U): U {
        let left = initialValue;
        this.forEach((right, index) => {
            left = reducer(left, right, index, this);
        });

        return left;
    }
    
    private __reduceWithoutInitialValue(reducer: (left: T, right: T, leftIndex?: number, source?: Seq<T>) => T): T {
        let count = 0;
        let left: T = undefined;
        this.forEach((right, i) => {
            ++count;
            if (i === 0) {
                left = right;
            }
            else {
                left = reducer(left, right, i, this);
            }
        });
        
        if (count <= 0) {
            throw new Error("Error attempt to reduce an empty sequence without an initial value.");
        }
        else {
            return left;
        }
    }
}

class SeqArrayImpl<T> extends SeqImpl<T> {
    private array: T[];

    constructor(array: T[]) {
        super(array[Symbol.iterator]);
        this.array = array;
    }

    count(): number {
        return this.array.length;
    }

    take(n: number): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            for (let i = 0; i < Math.min(n, self.array.length); ++i) {
                yield self.array[i];
            }
        });
    }

    skip(n: number): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function* (): any {
            for (let i = n; i < self.array.length; ++i) {
                yield self.array[i];
            }
        });
    }

    reverse(): Seq<T> {
        const self = this;
        return new SeqImpl<T>(function * (): any {
            for (let i = self.array.length - 1; i >= 0; --i) {
                yield self.array[i];
            }
        });
    }

    toArray(): T[] {
        return this.array;
    }
}

export interface SeqStatic {
    /** creates a sequence from an array 
     * @param array the source array
     */
    <T>(array: T[]): Seq<T>;

    /** creates a sequence from an generator function 
     * @param gen the generator function 
     */
    <T>(gen: () => Iterator<T>): Seq<T>;

    /** creates a sequence from an iterable
     * @param iterable the iterable
     */
    <T>(iterable: Iterable<T>): Seq<T>;

    /** creates an empty sequence */
    empty<T>(): Seq<T>;

    /** creates a sequence of a single element
     * @param value the single value
     */
    just<T>(value: T): Seq<T>;

    /** creates a sequence by repeating a value 
     * @param value the value to be repeated
     * @param n number of repetitions
     */
    repeat<T>(value: T, n: number): Seq<T>;

    /** creates a number sequence [nFrom, nTo[
     * @param nFrom first value of range
     * @param nTo one past last value of range
     */
    range(nFrom: number, nTo: number): Seq<number>;

    /** creates an infinite sequence of numbers, starting with 0 and increment by 1 */
    infinite(): Seq<number>;

    /** sum sequence 
     * @param seq sequence of numbers to sum
     */
    sum(seq: Seq<number>): number;

    /** average sequence 
     * @param seq sequence of numbers to average, must not be empty
     */
    average(seq: Seq<number>): number;

    /** maximum of sequence
     * @param seq sequence of numbers from which the maximum is queried
     */
    max(seq: Seq<number>): number;

    /** minimum of sequence 
     * @param seq sequence of numbers from which the minimum is queried
     */
    min(seq: Seq<number>): number;

    /** join sequence of string 
     * @param seq sequence of strings to join
     */
    join(seq: Seq<string>, separator?: string): string;
}

const seq: SeqStatic = <SeqStatic>function<T> (source: any): Seq<T> {
    const ti = typeInfo(source);
    if (ti.isUndefined) {
        return new SeqImpl<T>(function * (): any { /* empty */});
    }

    if (ti.isFunction) {
        const gen = <() => Iterator<T>>source;
        return new SeqImpl<T>(gen);
    }

    if (ti.isIterable) {
        const gen = <() => Iterator<T>>(source[Symbol.iterator]);
        return new SeqImpl<T>(gen);
    }

    if (ti.isArray) {
        const array = <T[]>source;
        return new SeqArrayImpl<T>(array);
    }

    return undefined;
};

seq.empty = function<T>(): Seq<T> {
    return new SeqImpl<T>(function* (): any { /* empty */ });
};

seq.just = function <T>(value: T): Seq<T> {
    return new SeqImpl<T>(function* (): any {
        yield value;
    });
};

seq.repeat = function <T>(value: T, n: number): Seq<T> {
    return new SeqImpl<T>(function* (): any {
        for (let i = 0; i < n; ++i) {
            yield value;
        }
    });
};

seq.range =  function (nFrom: number, nTo: number): Seq<number> {
    return new SeqImpl<number>(function* (): any {
        for (let i = nFrom; i < nTo; ++i) {
            yield i;
        }
    });
};

seq.infinite = function (): Seq<number> {
    return new SeqImpl<number>(function* (): any {
        for (let i = 0; true; ++i) {
            yield i;
        }
    });
};

seq.sum = function (subject: Seq<number>): number {
    return subject.reduce((x, y) => x + y, 0);
};

seq.max = function (subject: Seq<number>): number {
    return subject.reduce((x, y) => Math.max(x, y));
};

seq.min = function (subject: Seq<number>): number {
    return subject.reduce((x, y) => Math.min(x, y));
};

seq.average = function (subject: Seq<number>): number {
    return subject.reduce((left, right, index) => left * (index / (index + 1)) + right / (index + 1));
};

seq.join = function (subject: Seq<string>, separator?: string): string {
    return subject.toArray().join(separator);
};

export default seq;
