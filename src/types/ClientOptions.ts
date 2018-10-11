/**
 * Options that are provided to the gamejolt.js client constructor
 *
 * @typedef {object} ClientOptions
 * @property {number} [countInterval] Interval to get friend and notification count
 * @property {number} [friendRequestInterval] Interval to fetch friend requests
 * @property {number} [rateLimitRequests]
 * @property {number} [rateLimitDuration]
 */
export type ClientOptions = {
  countInterval?: number;
  friendRequestInterval?: number;
  rateLimitRequests?: number;
  rateLimitDuration?: number;
};
