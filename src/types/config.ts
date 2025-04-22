/**
 * @fileoverview Defines TypeScript types and interfaces for the application's configuration structure.
 * @description These types correspond to the JSON structure expected in the CLIENT_CONFIGURATIONS environment variable,
 *              as specified in the project's PRD (section 3.2).
 * @version 1.0.0
 * @since 2025-04-22
 */

/**
 * @interface UrlConfig
 * @description Defines the structure for URL construction parameters within an environment configuration.
 * @property {string} [pathPrefix="/sso/launch"] - The path prefix for the child application's SSO endpoint.
 * @property {string} [tokenParam="token"] - The query parameter name for the JWE token.
 * @property {Record<string, string>} [additionalParams] - A map of additional static query parameters to include in the URL.
 */
export interface UrlConfig {
  pathPrefix?: string;
  tokenParam?: string;
  additionalParams?: Record<string, string>;
}

/**
 * @interface EnvironmentConfig
 * @description Defines the configuration specific to a single environment within a client.
 * @property {string} name - The unique name of the environment (e.g., "dev", "qa", "prod").
 * @property {string} childDomain - The base domain name of the child application for this environment.
 * @property {string} apiKey - The API key (or key identifier) used for this environment, potentially for JWE 'kid'.
 * @property {string} apiSecret - A secret associated with the API key (usage depends on implementation, handle securely).
 * @property {string} publicKey - The public key (in SPKI format) used for JWE encryption for this environment.
 * @property {string} [keyEncryptionAlgorithm="RSA-OAEP-256"] - The JWE algorithm for key encryption (e.g., "RSA-OAEP-256").
 * @property {string} [contentEncryptionAlgorithm="A256GCM"] - The JWE algorithm for content encryption (e.g., "A256GCM").
 * @property {number} [tokenExpiration=300] - The default expiration time for generated tokens in seconds (default: 5 minutes).
 * @property {UrlConfig} [urlConfig] - Optional specific URL construction parameters for this environment.
 */
export interface EnvironmentConfig {
  name: string;
  childDomain: string;
  apiKey: string;
  apiSecret: string; // Note: Ensure this is handled securely and never exposed client-side if sensitive.
  publicKey: string;
  keyEncryptionAlgorithm?: string;
  contentEncryptionAlgorithm?: string;
  tokenExpiration?: number;
  urlConfig?: UrlConfig;
}

/**
 * @interface ClientConfig
 * @description Defines the configuration for a single client, containing one or more environments.
 * @property {string} name - The unique name of the client (e.g., "ClientA", "ClientB").
 * @property {EnvironmentConfig[]} environments - An array of configurations for the environments supported by this client.
 */
export interface ClientConfig {
  name: string;
  environments: EnvironmentConfig[];
}

/**
 * @interface RootConfig
 * @description Defines the root structure of the entire configuration object.
 * @property {ClientConfig[]} clients - An array of client configurations.
 */
export interface RootConfig {
  clients: ClientConfig[];
}
