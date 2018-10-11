import { Time } from '../types/Time';

/**
 *
 * Contains Time Utility methods
 * @export
 * @class TimeUtil
 */
export class TimeUtil {
  /**
   *
   * Convert timestamp in miliseconds to days, hours, minutes and seconds
   * @static
   * @param {number} ms
   * @returns {Time}
   *
   * @memberof TimeUtil
   */
  public static convertMs(ms: number): Time {
    let timestamp: Time;

    timestamp = new Time();

    let d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;

    timestamp.days = d;
    timestamp.hours = h;
    timestamp.minutes = m;
    timestamp.seconds = s;

    return timestamp;
  }

  /**
   *
   * Get a time difference between two timestamps
   * @static
   * @param {number} a
   * @param {number} b
   * @returns {Time}
   *
   * @memberof TimeUtil
   */
  public static difference(a: number, b: number): Time {
    let difference: Time;
    let ms: number = a - b;

    difference = TimeUtil.convertMs(ms);

    return difference;
  }
}
