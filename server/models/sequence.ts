"use strict";

export interface Grouping<TKey, TVal> {
	key: TKey;
	values: Seq<TVal>;
}

export interface Seq<T> extends Iterable<T> {
	forEach(func: (t: T)=>void): void;
	map<U>(func: (t: T) => U): Seq<U>;
	flatMap<U>(func: (t: T) => Seq<U>): Seq<U>;
	filter(predicate: (t: T) => boolean): Seq<T>;
	distinct(): Seq<T>;
	distinctBy<U>(keySelector: (t: T) => U): Seq<T>;
	reduce<U>(initialValue: U, reducer: (left: U, right: T) => U): U;
	first(): T;
	last(): T;
	count(): number;
	take(n: number): Seq<T>;
	skip(n: number): Seq<T>;
	takeWhile(predicate: (t: T) => boolean): Seq<T>;
	skipWhile(predicate: (t: T) => boolean): Seq<T>;
	groupBy<U>(keySelector: (t: T) => U): Seq<Grouping<T, U>>;
	concat(other: Seq<T>): Seq<T>;
	zip<U, V>(other: Seq<U>, zipper: (t: T, u: U) => V): Seq<V>;
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
		return new SeqImpl<U>(function * () {
			for (let t of self) {
				yield func(t);
			}
		});
	}
	
	flatMap<U>(func: (t: T) => Seq<U>): Seq<U> {
		const self = this;
		return new SeqImpl<U>(function * () {
			for (let seq of self) {
				for (let u of func(seq)) {
					yield u;
				}
			}
		});
	}
	
	filter(predicate: (t: T) => boolean): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function * () {
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
		return new SeqImpl<T>(function * (){
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
		return new SeqImpl<T>(function*(){
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
		return new SeqImpl<T>(function * (){
			let taken = 0;
			for (let t of self){
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
		return new SeqImpl<T>(function * (){
			let skipped = 0;
			for (let t of self){
				if (skipped < n) {
					++skipped;
				}
				else {
					yield t;
				}
			}	
		});
	}
	
	takeWhile(predicate: (t: T) => boolean): Seq<T>{
		const self = this;
		return new SeqImpl<T>(function * (){
			for (let t of self){
				if (predicate(t)) {
					yield t;
				}
			}	
		});
	}
	
	skipWhile(predicate: (t: T) => boolean): Seq<T>{
		const self = this;
		let skip = true;
		return new SeqImpl<T>(function * (){
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
	
	groupBy<U>(keySelector: (t: T) => U): Seq<Grouping<U, T>>{
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
		
		return new SeqImpl<Grouping<U, T>>(function *(){
			for (const entry of map.entries()) {
				const key = entry[0];
				const values = entry[1];
				yield {
					key: entry[0],
					values: Sequence.fromArray(values)
				};
			}
		});
	}
	
	concat(other: Seq<T>): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function * (){
			for (let t of self) {
				yield t;
			}
			
			for (let t of other) {
				yield t;
			}
		});
	}
	
	zip<U, V>(other: Seq<U>, zipper: (t: T, u: U) => V): Seq<V>{
		const self = this;
		return new SeqImpl<V>(function*(){
			let seqGen = other[Symbol.iterator]();
			for (let x of self) {
				let other = seqGen.next();
				if (other.done)
					break;
				else
					yield zipper(x, other.value);
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
		return new SeqImpl<T>(function * (){
			for (let i = 0; i < Math.min(n, self.array.length); ++i)
				yield self.array[i];
		});
	}
	
	skip(n: number): Seq<T> {
		const self = this;
		return new SeqImpl<T>(function * (){
			for (let i = n; i < self.array.length; ++i)
				yield self.array[i];
		});
	}
	
	toArray(): T[] {
		return this.array.slice(0, this.array.length);
	}
}

export default class Sequence {
	static fromArray<T>(array: T[]): Seq<T> {
		return new SeqArrayImpl<T>(array);
	}
	
	static fromGenerator<T>(gen: () => Iterator<T>): Seq<T> {
		return new SeqImpl<T>(gen);
	}
	
	static empty<T>() : Seq<T> {
		return new SeqImpl<T>(function * () {});
	}
	
	static just<T>(value: T): Seq<T>{
		return new SeqImpl<T>(function * (){
			yield value;
		});
	}
	
	static repeat<T>(value: T, n: number): Seq<T> {
		return new SeqImpl<T>(function * (){
			for (let i = 0; i < n; ++i) {
				yield value;
			}
		})
	}
	
	static range(nFrom: number, nTo: number) {
		return new SeqImpl<number>(function * (){
			for (let i = nFrom; i < nTo; ++i) {
				yield i;
			}
		});
	}
	
	static inifinit(): Seq<number> {
		return new SeqImpl<number>(function * (){
			for (let i = 0; true; ++i) {
				yield i;
			}
		});
	}
}