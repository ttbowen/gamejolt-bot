/**
 * Utility class for Map Collection Type.
 */
export class Collection<K, V> extends Map<K, V> {
  private _array: any[];
  private _keyArray: any[];

  /**
   * Creates an instance of Collection.
   * @param iterable The iterable.
   */
  public constructor(iterable?: Iterable<[K, V]>) {
    super(iterable);
  }

  /**
   * Set a value in the collection.
   * @param key The key name.
   * @param value The value to set.
   */
  public set(key: K, value: V): this {
    this._array = null;
    this._keyArray = null;
    return super.set(key, value);
  }

  /**
   * Deletes a key from collection.
   * @param key The key to delete.
   */
  public delete(key: K): boolean {
    this._array = null;
    this._keyArray = null;
    return super.delete(key);
  }

  public array(): any[] {
    if (!this._array || this._array.length !== this.size) this._array = Array.from(this.values());
    return this._array;
  }

  public keyArray(): any[] {
    if (!this._keyArray || this._keyArray.length !== this.size)
      this._keyArray = Array.from(this.keys());
    return this._keyArray;
  }

  /**
   * Obtains the first value in this collection.
   * @param count
   */
  public first(count?: number): any | any[] {
    if (count === undefined) return this.values().next().value;

    count = Math.min(this.size, count);
    const arr = new Array(count);
    const iter = this.values();

    for (let i = 0; i < count; i++) arr[i] = iter.next().value;
    return arr;
  }

  /**
   * Searches for a single item where it's specified property's value
   * is identical to the passed value.
   * @param propOrFn
   * @param value
   *
   * @memberof Collection
   */
  public find(propOrFn: string | Function, value?: any): V {
    if (typeof propOrFn === 'string') {
      if (typeof value === 'undefined') throw new Error('Value must be specified');
      let item: any;
      for (item of this.values()) {
        if (item[propOrFn] === value) return item;
      }
      return null;
    } else if (typeof propOrFn === 'function') {
      for (const [key, val] of this) {
        if (propOrFn(val, key, this)) return val;
      }
      return null;
    }
  }

  /**
   * Search for all items where their specified property value is
   * identical to the passed value.
   * @param prop The property to search.
   * @param value The value to search.
   */
  public findAll(prop: string, value: any): any[] {
    const results: any[] = [];

    let item: any;

    for (item of this.values()) {
      if (item[prop] === value) results.push(item);
    }
    return results;
  }

  /**
   * Searches for the key of a single item where it's specified property's value
   * is identical to the passed value.
   * @param propOrFn
   * @param value
   */
  public findKey(propOrFn: string | Function, value: any) {
    if (typeof propOrFn === 'string') {
      if (typeof value === 'undefined') throw new Error('Value must be specified');

      const obj: any = this;
      for (const [key, val] of obj) {
        if (val[propOrFn] === value) return key;
      }
      return null;
    } else if (typeof propOrFn === 'function') {
      for (const [key, val] of this) {
        if (propOrFn(val, key, this)) return key;
      }
      return null;
    }
  }

  /**
   * Obtains the last value in this collection.
   * @param count
   */
  public last(count: number): any[] {
    const arr = this.array();
    if (count === undefined) return arr[arr.length - 1];
    return arr.slice(-count);
  }

  /**
   * Obtains the last key in this collection.
   * @param count
   */
  public lastKey(count: number): any[] {
    const arr = this.keyArray();
    if (count === undefined) return arr[arr.length - 1];
    return arr.slice(-count);
  }

  /**
   * Conbines collections into a new collection.
   * @param collections Collections to concat.
   */
  public concat(...collections: Collection<K, V>[]): Collection<K, V> {
    const collection: Collection<K, V> = this.clone();

    for (const coll of collections) {
      for (const [key, val] of coll) collection.set(key, val);
    }
    return collection;
  }

  /**
   * Creates an identical shallow copy of this collection
   * @returns {Collection<K, V>}
   *
   * @memberof Collection
   */
  public clone(): Collection<K, V> {
    return new Collection<K, V>(this);
  }

  /**
   * Checks if specified item exists in the collection.
   * @param prop The property to check.
   * @param value The value to check.
   */
  public exists(prop: string, value: any): boolean {
    return Boolean(this.find(prop, value));
  }

  /**
   * Filter collection items.
   * @param fn Predicate function.
   * @param thisArg
   */
  public filter(fn: Function, thisArg?: object): Collection<K, V> {
    if (thisArg) fn = fn.bind(thisArg);
    const results = new Collection<K, V>();
    for (const [key, value] of this) {
      if (fn(value, key, this)) results.set(key, value);
    }
    return results;
  }

  public filterArray(fn: Function, thisArg?: object): any[] {
    if (thisArg) fn = fn.bind(thisArg);
    const results: any[] = [];

    for (const [key, value] of this) {
      if (fn(value, key, this)) results.push(value);
    }
    return results;
  }

  public map(fn: Function, thisArg?: object): any[] {
    if (thisArg) fn = fn.bind(thisArg);
    const arr = new Array(this.size);
    let i = 0;
    for (const [key, value] of this) {
      arr[i++] = fn(value, key, this);
    }
    return arr;
  }

  public some(fn: Function, thisArg?: object): boolean {
    if (thisArg) fn = fn.bind(thisArg);
    for (const [key, value] of this) {
      if (fn(value, key, this)) return true;
    }
    return false;
  }

  public every(fn: Function, thisArg?: object): boolean {
    if (thisArg) fn = fn.bind(thisArg);
    for (const [key, value] of this) {
      if (!fn(value, key, this)) return false;
    }
    return true;
  }

  /**
   * Delete all items in the collection.
   */
  public deleteAll(): Promise<any>[] {
    const returns: any = [];
    let item: any;
    for (item of this.values()) {
      if (item.delete) returns.push(item.delete());
    }
    return returns;
  }

  /**
   * Checks if this collection shares identical key-value pairings with
   * another collection.
   * @param collection The collection to compare to.
   */
  public equals(collection: Collection<K, V>): boolean {
    if (!collection) return false;
    if (this === collection) return true;
    if (this.size !== collection.size) return false;

    return !this.find((key: any, value: any) => {
      const testVal = collection.get(key);
      return testVal !== value || (testVal === undefined && !collection.has(key));
    });
  }
}
