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
	forEach(func: (t: T) => void): void;

	/** transform a sequence by mapping each element through a function
	 * @param func transform function
	 */
	map<U>(func: (t: T) => U): Seq<U>;

	/** transform a sequence by mapping each element to its own sequence, then joins these sub-sequences into a single sequence
	 * @param func transform function to turns each element into a separate sequence
	  */
	flatMap<U>(func: (t: T) => Seq<U>): Seq<U>;

	/** filter a sequence by applying a predicate on each element
	 * @param predicate the predicate function to decide whether an element is to appear in the new sequence
	 */
	filter(predicate: (t: T) => boolean): Seq<T>;

	/** create a new sequence of distinct elements from current sequence */
	distinct(): Seq<T>;

	/** create a new sequence of elements each has a distinct key
	 * @param keySelector function to extract the key from each element
	 */
	distinctBy<U>(keySelector: (t: T) => U): Seq<T>;

	/** reducing a sequence into a single value, starting from an initial value.
	 * @param initialValue the initial value of reduction
	 * @param reducer reducer function
	 */
	reduce<U>(initialValue: U, reducer: (left: U, right: T) => U): U;

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
	takeWhile(predicate: (t: T) => boolean): Seq<T>;

	/** skip the first few elements from the sequence that satisfies a condition,
	 * and create a new sequence with the remaining elements
	 * @param predicate condition under which the element is skipped
	 */
	skipWhile(predicate: (t: T) => boolean): Seq<T>;

	/** group the sequence by a key
	 * @param keySelector key extraction function
	 */
	groupBy<U>(keySelector: (t: T) => U): Seq<Grouping<T, U>>;

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

	/** turns a sequence into an array */
	toArray(): T[];
}

class SeqImpl<T> implements Seq<T> {
	[Symbol.iterator]: () => Iterator<T>;

	constructor(iteratorFunc: () => Iterator<T>) {
		this[Symbol.iterator] = iteratorFunc;
	}

	forEach(func: (t: T) => void): void {
		for (let t of this) {
			func(t);
		}
	}

	map<U>(func: (t: T) => U): Seq<U> {
		const self = this;
		return new SeqImpl<U>(function* () {
			for (let t of self) {
				yield func(t);
			}
		});
	}

	flatMap<U>(func: (t: T) => Seq<U>): Seq<U> {
		const self = this;
		return new SeqImpl<U>(function* () {
			for (let seq of self) {
				for (let u of func(seq)) {
					yield u;
				}
			}
		});
	}

	filter(predicate: (t: T) => boolean): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function* () {
			for (let t of self) {
				if (predicate(t)) {
					yield t;
				}
			}
		});
	}

	distinct(): Seq<T> {
		const set = new Set<T>();
		const self = this;
		return new SeqImpl<T>(function* () {
			for (let t of self) {
				if (!set.has(t)) {
					set.add(t);
					yield t;
				}
			}
		});
	}

	distinctBy<U>(keySelector: (t: T) => U): Seq<T> {
		const set = new Set<U>();
		const self = this;
		return new SeqImpl<T>(function* () {
			for (let t of self) {
				const key = keySelector(t);
				if (!set.has(key)) {
					set.add(key);
					yield t;
				}
			}
		});
	}

	reduce<U>(initialValue: U, reducer: (left: U, right: T) => U): U {
		let left = initialValue;
		for (let right of this) {
			left = reducer(left, right);
		}

		return left;
	}

	first(): T {
		for (let t of this) {
			return t;
		}

		return undefined;
	}

	last(): T {
		let temp: T = undefined;
		for (let t of this) {
			temp = t;
		}

		return temp;
	}

	count(): number {
		let n = 0;
		for (let t of this) {
			++n;
		}

		return n;
	}

	take(n: number): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function* () {
			let taken = 0;
			for (let t of self) {
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
		return new SeqImpl<T>(function* () {
			let skipped = 0;
			for (let t of self) {
				if (skipped < n) {
					++skipped;
				}
				else {
					yield t;
				}
			}
		});
	}

	takeWhile(predicate: (t: T) => boolean): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function* () {
			for (let t of self) {
				if (predicate(t)) {
					yield t;
				}
			}
		});
	}

	skipWhile(predicate: (t: T) => boolean): Seq<T> {
		const self = this;
		let skip = true;
		return new SeqImpl<T>(function* () {
			for (let t of self) {
				if (skip && predicate(t)) {
					continue;
				}
				else {
					skip = false;
					yield t;
				}
			}
		});
	}

	groupBy<U>(keySelector: (t: T) => U): Seq<Grouping<U, T>> {
		const map = new Map<U, T[]>();
		for (let t of this) {
			const key = keySelector(t);
			let array = map.get(key);
			if (array === undefined) {
				array = [];
				map.set(key, array);
			}

			array.push(t);
		}

		return new SeqImpl<Grouping<U, T>>(function* () {
			for (const entry of map.entries()) {
				const key = entry[0];
				const values = entry[1];
				yield {
					key: entry[0],
					values: new SeqArrayImpl<T>(values)
				};
			}
		});
	}

	concat(other: Seq<T>): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function* () {
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
		return new SeqImpl<V>(function* () {
			let seqGen = other[Symbol.iterator]();
			for (let x of self) {
				let other = seqGen.next();
				if (other.done) {
					break;
				}
				else {
					yield zipper(x, other.value);
				}
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
		return new SeqImpl<T>(function* () {
			for (let i = 0; i < Math.min(n, self.array.length); ++i) {
				yield self.array[i];
			}
		});
	}

	skip(n: number): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function* () {
			for (let i = n; i < self.array.length; ++i) {
				yield self.array[i];
			}
		});
	}

	toArray(): T[] {
		return this.array.slice(0, this.array.length);
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
}

const seq: SeqStatic = <SeqStatic>function<T> (source: any): Seq<T> {
	const ti = typeInfo(source);
	if (ti.isUndefined) {
		return new SeqImpl<T>(function * () { /* empty */});
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
	return new SeqImpl<T>(function* () { /* empty */ });
};

seq.just = function <T>(value: T): Seq<T> {
	return new SeqImpl<T>(function* () {
		yield value;
	});
};

seq.repeat = function <T>(value: T, n: number): Seq<T> {
	return new SeqImpl<T>(function* () {
		for (let i = 0; i < n; ++i) {
			yield value;
		}
	});
};

seq.range =  function (nFrom: number, nTo: number) {
	return new SeqImpl<number>(function* () {
		for (let i = nFrom; i < nTo; ++i) {
			yield i;
		}
	});
};

seq.infinite =function (): Seq<number> {
	return new SeqImpl<number>(function* () {
		for (let i = 0; true; ++i) {
			yield i;
		}
	});
};

export default seq;