/**
 * Interface for key/value stores.
 */
export interface IKeyValue {
  init(): Promise<void>;
  keys(): Promise<string[]>;
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
