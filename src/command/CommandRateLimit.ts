/**
 * Command Rate limiter.
 */
export class CommandRateLimit {
  private readonly _limit: number;
  private readonly _duration: number;
  private _count: number;
  private _notified: boolean;

  /**
   * The time the ratelimit expires.s
   */
  public expires: number;

  /**
   * Creates an instance of CommandRateLimit.
   * @param limit Tuple containing the limit and duration of ratelimit.
   */
  public constructor(limit: [number, number]) {
    [this._limit, this._duration] = limit;
    this._reset();
  }

  private _reset(): void {
    this._count = 0;
    this.expires = 0;
    this._notified = false;
  }

  /**
   * Call the ratelimiter.
   */
  public call(): boolean {
    if (this.expires < Date.now()) this._reset();
    if (this._count >= this._limit) return false;
    this._count++;
    if (this._count === 1) this.expires = Date.now() + this._duration;
    return true;
  }

  /**
   * Get whether the command is rate limited currently.
   */
  public get isRateLimited(): boolean {
    return this._count >= this._limit && Date.now() < this.expires;
  }

  /**
   * Set notified status.
   */
  public setNotified(): void {
    this._notified = true;
  }

  /**
   * Get notified status.
   */
  public get wasNotified(): boolean {
    return this._notified;
  }
}
