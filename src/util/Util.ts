/**
 * Contains miscellaneous helper methods.
 */
export class Util {
  /**
   * Truncate strings after max lengths.
   * @param n Maximum string length before truncating with ...
   * @param text The string to truncate.
   */

  public static truncate(n: number, text: string): string {
    return text.length > n ? text.substr(0, n - 1) + '...' : text;
  }

  /**
   * Format number with metric prefix.
   * @param n The number to format.
   */
  public static formatNumber(n: number): string {
    const ranges = [
      { divider: 1e9, suffix: 'b' },
      { divider: 1e6, suffix: 'm' },
      { divider: 1e3, suffix: 'k' }
    ];

    for (let i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        return Math.round(n / ranges[i].divider).toString() + ranges[i].suffix;
      }
    }
    return n ? n.toString() : '';
  }
}
