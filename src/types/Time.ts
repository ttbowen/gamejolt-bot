/**
 * Represents a timestamp in days
 * in days, hours, minutes, seconds and miliseconds
 *
 * @type {Time}
 */
export class Time {
  /**
   *
   * Days time part
   *
   * @type {number}
   */
  public days: number;

  /**
   *
   * Hours time part
   *
   * @type {number}
   */
  public hours: number;

  /**
   *
   * Minutes time part
   *
   * @type {number}
   */
  public minutes: number;

  /**
   *
   * Seconds time part
   *
   * @type {number}
   */
  public seconds: number;

  /**
   *
   * Miliseconds time part
   *
   * @type {number}
   */
  public miliseconds: number;

  public toString(): string {
    let timeStr: string = '';

    if (this.days > 0) {
      timeStr += this.days;
      this.days > 1 ? (timeStr += ' days ') : (timeStr += ' day ');
    }
    if (this.hours > 0) {
      timeStr += this.hours;
      this.hours > 1 ? (timeStr += ' hours ') : (timeStr += ' hour ');
    }
    if (this.minutes > 0) {
      timeStr += this.minutes;
      this.minutes > 1 ? (timeStr += ' minutes ') : (timeStr += ' minute ');
    }
    if (this.seconds > 0) {
      timeStr += this.seconds;
      this.seconds > 1 ? (timeStr += ' seconds ') : (timeStr += ' second ');
    }

    return timeStr;
  }
}
