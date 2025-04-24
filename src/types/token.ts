/**
 * @fileoverview Defines TypeScript types related to JWE token generation.
 * @version 1.0.0
 * @since 2025-04-23
 */

import { SessionPayload, UserPayload } from "./payload";

/**
 * @interface GenerateTokenRequest
 * @description Defines the structure of the request body for the token generation API endpoint.
 * @property {string} clientName - The name of the selected client configuration.
 * @property {string} environment - The name of the selected environment within the client configuration.
 * @property {SessionPayload} sessionPayload - The parsed session payload object.
 * @property {UserPayload} userPayload - The parsed user information payload object.
 */
export interface GenerateTokenRequest {
  clientName: string;
  environment: string;
  sessionPayload: SessionPayload; // Expecting parsed objects, not strings
  userPayload: UserPayload;
}

/**
 * @interface GenerateTokenSuccessResponse
 * @description Defines the structure of a successful response from the token generation API.
 * @property {"success"} status - Indicates a successful operation.
 * @property {string} token - The generated JWE token string.
 * @property {string} url - The constructed launch URL containing the token.
 */
export interface GenerateTokenSuccessResponse {
  status: "success";
  token: string;
  url: string;
}

/**
 * @interface GenerateTokenErrorResponse
 * @description Defines the structure of an error response from the token generation API.
 * @property {"error"} status - Indicates a failed operation.
 * @property {string} code - A machine-readable error code (e.g., "INVALID_CONFIGURATION", "PAYLOAD_VALIDATION_ERROR", "TOKEN_GENERATION_ERROR").
 * @property {string} message - A user-friendly error message.
 * @property {string} [details] - Optional additional technical details (intended for development environments).
 * @property {string} [requestId] - Optional request ID for log correlation.
 * @property {string} timestamp - ISO 8601 timestamp of when the error occurred.
 */
export interface GenerateTokenErrorResponse {
  status: "error";
  code: string;
  message: string;
  details?: string;
  requestId?: string; // Optional: For log correlation
  timestamp: string;
}

/**
 * @type GenerateTokenResponse
 * @description A union type representing either a successful or error response from the token generation API.
 */
export type GenerateTokenResponse =
  | GenerateTokenSuccessResponse
  | GenerateTokenErrorResponse;
