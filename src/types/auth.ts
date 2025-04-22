/**
 * @fileoverview Defines types related to authentication.
 * @version 1.0.0
 * @since 2025-04-22
 */

/**
 * @interface LoginCredentials
 * @description Represents the structure for user login credentials.
 * @property {string} username - The username provided by the user.
 * @property {string} password - The password provided by the user.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * @interface AuthResponse
 * @description Represents the structure of the response from the authentication API.
 * @property {boolean} success - Indicates if the authentication was successful.
 * @property {string} [message] - An optional message, typically used for errors.
 */
export interface AuthResponse {
  success: boolean;
  message?: string;
}
