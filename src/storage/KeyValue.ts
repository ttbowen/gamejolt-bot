import { IKeyValue } from './interface/IKeyValue';

/**
 *
 * Abstract class for key/value stores
 * @export
 * @abstract
 * @class KeyValue
 * @implements {IKeyValue}
 */
export abstract class KeyValue implements IKeyValue {
  public abstract init(): Promise<void>;
  public abstract keys(): Promise<string[]>;
  public abstract get(key: string): Promise<string>;
  public abstract set(key: string, value: string): Promise<void>;
  public abstract remove(key: string): Promise<void>;
}
