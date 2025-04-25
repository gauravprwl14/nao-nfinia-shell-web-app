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
 * @property {string} [pathPrefix="/"] - The path prefix for the child application's SSO endpoint.
 * @property {string} [tokenParam="token"] - The query parameter name for the JWE token.
 * @property {Record<string, string>} [additionalParams] - A map of additional static query parameters to include in the URL.
 */
export interface UrlConfig {
  pathPrefix?: string;
  tokenParam?: string;
  additionalParams?: Record<string, string>;
}

/**
 * @interface SigKey
 * @description Defines the structure for signature-related keys.
 * @property {string} publicKey - The public key (in PEM/SPKI format) used for signature verification.
 */
export interface SigKey {
  publicKey: string;
}

/**
 * @interface EncKey
 * @description Defines the structure for encryption-related keys.
 * @property {string} publicKey - The public key (in PEM/SPKI format) used for JWE encryption.
 */
export interface EncKey {
  publicKey: string;
}

/**
 * @interface KeySet
 * @description Defines the nested structure containing signature and encryption keys.
 * @property {SigKey} sig - Contains keys related to signing operations.
 * @property {EncKey} enc - Contains keys related to encryption operations.
 */
export interface KeySet {
  sig: SigKey;
  enc: EncKey;
}

/**
 * @interface EnvironmentConfig
 * @description Defines the configuration specific to a single environment within a client.
 * @property {string} name - The unique name of the environment (e.g., "dev", "qa", "prod").
 * @property {string} childDomain - The base domain name of the child application for this environment.
 * @property {string} clientId - The client identifier for this environment.
 * @property {string} clientSecret - The client secret associated with the clientId (handle securely).
 * @property {string} sharedSecret - A shared secret used for specific cryptographic operations (handle securely).
 * @property {KeySet} keys - An object containing the public keys for signing and encryption.
 * @property {string} [keyEncryptionAlgorithm="RSA-OAEP-256"] - The JWE algorithm for key encryption (e.g., "RSA-OAEP-256"). Corresponds to the 'enc' key usage.
 * @property {string} [contentEncryptionAlgorithm="A256GCM"] - The JWE algorithm for content encryption (e.g., "A256GCM").
 * @property {number} [tokenExpiration=300] - The default expiration time for generated tokens in seconds (default: 5 minutes).
 * @property {UrlConfig} [urlConfig] - Optional specific URL construction parameters for this environment.
 */
export interface EnvironmentConfig {
  name: string;
  childDomain: string;
  clientId: string; // Added based on .env
  clientSecret: string; // Added based on .env (Note: Ensure this is handled securely)
  sharedSecret: string; // Added based on .env (Note: Ensure this is handled securely)
  keys: KeySet; // Added nested keys structure based on .env
  keyEncryptionAlgorithm?: string; // Kept as optional, maps to 'enc' key usage
  contentEncryptionAlgorithm?: string; // Kept as optional
  signAlgorithm: string; // signature algorithm (e.g., "HS256")
  tokenExpiration?: number; // Kept as optional
  urlConfig?: UrlConfig; // Kept as optional
  // Removed apiKey, apiSecret (top-level), publicKey (top-level) as they are replaced/restructured
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
