/**
 * @fileoverview Provides functions for JWE token generation and related operations using the JOSE library.
 * @version 1.1.0
 * @since 2025-04-23
 * @updated 2025-04-24 - Added generateSignedAndEncryptedToken function.
 */
import * as jose from "jose";
/**
 * @typedef {KeyLike} KeyLike The cryptographic key.
 * @description Represents a cryptographic key used in JOSE operations.
 * @summary Type from the JOSE library representing cryptographic keys.
 * @privateRemarks In the JOSE library, KeyLike is a type for cryptographic keys,
 * which we're importing as a named import from the JOSE library.
 */
import { EnvironmentConfig } from "@/types/config";
import { CombinedPayload } from "@/types/payload";
import { logInfo, logError } from "./logger"; // Assuming logger exists

/**
 * @typedef {Object} KeyLike
 * @description Type definition representing cryptographic keys used in JOSE operations.
 * @summary Mimics the KeyLike type from the JOSE library for our local usage.
 * @privateRemarks This is a local type definition to represent the JOSE KeyLike type,
 * which includes CryptoKey, Uint8Array key representations, or other key formats.
 */
type KeyLike = jose.CryptoKey | Uint8Array;

/**
 * @interface GenerateTokenOptions
 * @description Options for token generation functions.
 * @property {CombinedPayload} payload - The combined payload object to process.
 * @property {EnvironmentConfig} config - The configuration for the selected environment.
 */
interface GenerateTokenOptions {
  payload: CombinedPayload;
  config: EnvironmentConfig;
}

// --- Helper: Prepare Signing Secret ---
/**
 * @function prepareSigningSecret
 * @description Prepares the signing secret from the configuration for JOSE.
 * @description Encodes the sharedSecret from the config into a Uint8Array.
 * @param {EnvironmentConfig} config - The environment configuration containing the sharedSecret.
 * @returns {Uint8Array} The signing secret as a Uint8Array.
 * @throws {Error} If the sharedSecret is missing in the configuration.
 * @privateRemarks This assumes the sharedSecret is used for symmetric signing (e.g., HMAC).
 */
const prepareSigningSecret = (config: EnvironmentConfig): Uint8Array => {
  if (!config.clientSecret) {
    throw new Error(
      "Shared secret for signing is missing in the environment configuration."
    );
  }
  return new TextEncoder().encode(config.clientSecret);
};

// --- Helper: Import Encryption Public Key ---
/**
 * @function importEncryptionPublicKey
 * @description Imports the JWE encryption public key from the configuration.
 * @description Uses jose.importSPKI to parse the PEM-formatted public key.
 * @param {EnvironmentConfig} config - The environment configuration containing the public key and algorithm.
 * @param {string} keyEncryptionAlgorithm - The JWE key encryption algorithm (e.g., "RSA-OAEP-256").
 * @returns {Promise<KeyLike>} A promise resolving to the imported public key object.
 * @throws {Error} If the public key is missing, invalid, or fails to import for the specified algorithm.
 * @privateRemarks Ensures the key is in valid SPKI PEM format.
 * */

const importEncryptionPublicKey = async (
  config: EnvironmentConfig,
  keyEncryptionAlgorithm: string
): Promise<KeyLike> => {
  if (!config.keys?.enc?.publicKey) {
    throw new Error(
      "Encryption public key is missing in the environment configuration (config.keys.enc.publicKey)."
    );
  }
  try {
    const publicKey = await jose.importSPKI(
      config.keys.enc.publicKey,
      keyEncryptionAlgorithm
    );
    return publicKey;
  } catch (keyError: Error | unknown) {
    const errorMessage =
      keyError instanceof Error
        ? keyError.message
        : "Unknown error during public key import";
    // Log the error and re-throw with a more specific message
    logError("Public key import error during JWE preparation", keyError, {
      algorithm: keyEncryptionAlgorithm,
    });
    throw new Error(
      `Failed to import encryption public key: ${errorMessage}. Ensure it's a valid SPKI PEM format for algorithm ${keyEncryptionAlgorithm}.`
    );
  }
};

// --- Original JWE Generation (Encrypt Only) ---
/**
 * @function generateJweToken
 * @description Generates a JWE token by directly encrypting the payload.
 * @description Encrypts the raw payload using the public key and algorithms specified in the environment config.
 *              This function does NOT sign the payload first.
 * @param {GenerateTokenOptions} options - The options containing the raw payload and configuration.
 * @param {CombinedPayload} options.payload - The payload object to encrypt.
 * @param {EnvironmentConfig} options.config - The configuration for the selected environment.
 * @returns {Promise<string>} A promise that resolves with the generated JWE token string.
 * @throws {Error} If key import fails, encryption fails, or configuration is invalid (missing keys, algorithms, etc.).
 * @security Handles cryptographic operations. Ensure public keys are in the correct format (SPKI PEM).
 * @example
 * const jweToken = await generateJweToken({ payload: myPayload, config: envConfig });
 */
// export const generateJweToken = async ({
//   payload,
//   config,
// }: GenerateTokenOptions): Promise<string> => {
//   const operation = "generateJweToken (Encrypt Only)";
//   try {
//     logInfo(`Starting ${operation}`, { clientId: config.clientId });

//     // --- Validate Configuration & Get Algorithms ---
//     const keyEncryptionAlgorithm =
//       config.keyEncryptionAlgorithm || "RSA-OAEP-256"; // Default from PRD
//     const contentEncryptionAlgorithm =
//       config.contentEncryptionAlgorithm || "A256GCM"; // Default from PRD

//     // --- Import Public Key ---
//     const publicKey = await importEncryptionPublicKey(
//       config,
//       keyEncryptionAlgorithm
//     );

//     // --- Prepare Payload ---
//     logInfo("Preparing payload for encryption", {
//       clientId: config.clientId,
//       payload: JSON.stringify(payload),
//     });
//     const payloadString = JSON.stringify(payload);
//     const payloadBytes = new TextEncoder().encode(payloadString);
//     logInfo("Payload prepared for encryption", {
//       clientId: config.clientId,
//       byteLength: payloadBytes.byteLength,
//     });

//     // --- Encrypt Payload (Generate JWE) ---
//     const jwe = await new jose.CompactEncrypt(payloadBytes)
//       .setProtectedHeader({
//         alg: keyEncryptionAlgorithm, // JWE Key Encryption Algorithm
//         enc: contentEncryptionAlgorithm, // JWE Content Encryption Algorithm
//         kid: config.clientId, // Use clientId as Key ID
//         // typ: 'JWT', // Optional: Indicate payload type if relevant
//       })
//       .encrypt(publicKey);

//     logInfo(`Completed ${operation}`, { clientId: config.clientId });
//     return jwe;
//   } catch (error: Error | unknown) {
//     logError(`${operation} failed`, error, { clientId: config.clientId });
//     // Re-throw a consistent error format
//     const errorMessage =
//       error instanceof Error
//         ? error.message
//         : "Unknown error during JWE generation";
//     throw new Error(`JWE generation (encrypt-only) failed: ${errorMessage}`);
//   }
// };

// --- New JWS+JWE Generation (Sign then Encrypt) ---
/**
 * @function generateSignedAndEncryptedToken
 * @description Generates a token by first signing the payload (JWS) and then encrypting the resulting JWS (JWE).
 * @description Step 1: Signs the payload using a shared secret and HS256 algorithm (configurable in future).
 *              Step 2: Encrypts the generated JWS string using the public key and JWE algorithms from the config.
 * @param {GenerateTokenOptions} options - The options containing the raw payload and configuration.
 * @param {CombinedPayload} options.payload - The payload object to sign and then encrypt.
 * @param {EnvironmentConfig} options.config - The configuration for the selected environment, containing secrets and keys.
 * @returns {Promise<string>} A promise that resolves with the final JWE token string containing the signed JWT.
 * @throws {Error} If configuration is invalid (missing secrets, keys, algorithms), signing fails, key import fails, or encryption fails.
 * @security Handles both symmetric signing and asymmetric encryption. Ensure `sharedSecret` and `publicKey` are correctly configured and secured.
 * @example
 * const signedEncryptedToken = await generateSignedAndEncryptedToken({ payload: myPayload, config: envConfig });
 */
export const generateSignedAndEncryptedToken = async ({
  payload,
  config,
}: GenerateTokenOptions): Promise<string> => {
  const operation = "generateSignedAndEncryptedToken (Sign then Encrypt)";
  try {
    logInfo(`Starting ${operation}`, { clientId: config.clientId });

    logInfo("Preparing payload for signing", {
      clientId: config.clientId,
      payload: JSON.stringify(payload),
    });

    // === Step 1: Sign the Payload (Create JWS) ===

    // --- Configuration for Signing ---
    const signingAlgorithm = config.signAlgorithm || "HS256"; // Updated to use config.signAlgorithm
    const signingSecret: Uint8Array = prepareSigningSecret(config); // Get secret as Uint8Array

    // --- Perform Signing ---
    let jws: string;
    try {
      jws = await new jose.SignJWT(payload as unknown as jose.JWTPayload) // Cast payload to unknown first, then to JWTPayload
        .setProtectedHeader({
          alg: signingAlgorithm,
          apiKey: config.clientId, // Use clientId as Key ID for signer
        })
        .setIssuedAt() // Standard JWT claim: Issued At
        .setSubject(config.clientId)
        .setIssuer(config.clientId)
        .setExpirationTime(config.expiredTime || "15m") // Standard JWT claim: Expiration Time (adjust as needed)
        .setNotBefore("0s")
        // .setSubject(config.clientId) // Optional: Subject claim
        // .setIssuer(config.clientId) // Optional: Issuer claim
        .setJti(crypto.randomUUID()) // Standard JWT claim: JWT ID (unique identifier)
        .sign(signingSecret);

      logInfo("Payload signed successfully (JWS created)", {
        clientId: config.clientId,
        alg: signingAlgorithm,
      });
    } catch (signError: Error | unknown) {
      // Handle signing errors
      const errorMessage =
        signError instanceof Error
          ? signError.message
          : "Unknown error during JWS signing";
      // Log the error and re-throw with a more specific message
      logError("Payload signing (JWS creation) failed", signError, {
        clientId: config.clientId,
        alg: signingAlgorithm,
      });
      throw new Error(`Payload signing failed: ${errorMessage}`);
    }

    // === Step 2: Encrypt the Signed JWT (Create JWE) ===

    // --- Configuration for Encryption ---
    const keyEncryptionAlgorithm =
      config.keyEncryptionAlgorithm || "RSA-OAEP-256";
    const contentEncryptionAlgorithm =
      config.contentEncryptionAlgorithm || "A256GCM";

    // const publicKey: KeyLike = await importEncryptionPublicKey(
    const publicKey: KeyLike = await importEncryptionPublicKey(
      config,
      keyEncryptionAlgorithm
    );

    // --- Prepare JWS for Encryption ---
    const jwsBytes = new TextEncoder().encode(jws);

    // --- Perform Encryption ---
    const jwe = await new jose.CompactEncrypt(jwsBytes)
      .setProtectedHeader({
        alg: keyEncryptionAlgorithm, // JWE Key Encryption Algorithm
        enc: contentEncryptionAlgorithm, // JWE Content Encryption Algorithm
        apiKey: config.clientId, // Use clientId as Key ID for encryption key
        // typ: 'JWT', // Optional: Indicate the encrypted content is a JWT (the JWS)
        // cty: 'JWT', // Optional: Content Type header indicating nested JWT
      })
      .encrypt(publicKey);

    logInfo(`Completed ${operation}`, { clientId: config.clientId });
    return jwe;
  } catch (error: Error | unknown) {
    // Catch errors from helpers or the encryption step itself
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during signed and encrypted token generation";
    logError(`${operation} failed`, error, { clientId: config.clientId });
    // Ensure a consistent error message format
    throw new Error(
      `Signed and encrypted token generation failed: ${errorMessage}`
    );
  }
};

// --- URL Construction ---
/**
 * @function constructLaunchUrl
 * @description Constructs the final launch URL for the child application.
 * @description Appends the generated token and any additional parameters from the config.
 * @param {string} token - The generated JWE token (can be from either generation function).
 * @param {EnvironmentConfig} config - The configuration for the selected environment.
 * @returns {string} The fully constructed launch URL.
 * @throws {Error} If the childDomain is missing in the configuration.
 * @example
 * const launchUrl = constructLaunchUrl(jweToken, envConfig);
 */
export const constructLaunchUrl = (
  token: string,
  config: EnvironmentConfig
): string => {
  // ... (constructLaunchUrl implementation remains the same) ...
  if (!config.childDomain) {
    logError("URL construction failed: Child domain missing", null, {
      clientId: config.clientId,
    });
    throw new Error(
      "Child domain is missing in the environment configuration."
    );
  }

  const baseUrl = config.childDomain;
  // Ensure domain doesn't end with a slash if pathPrefix doesn't start with one
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const pathPrefix = config.urlConfig?.pathPrefix || ""; // Default from PRD
  const tokenParam = config.urlConfig?.tokenParam || "token"; // Default from PRD
  const additionalParams = config.urlConfig?.additionalParams || {};

  const urlParams = new URLSearchParams({
    [tokenParam]: token,
    ...additionalParams,
  });

  // Handle cases where pathPrefix might be empty or just "/"
  let pathPart = pathPrefix;
  if (pathPart && !pathPart.startsWith("/")) {
    pathPart = "/" + pathPart;
  }
  // Avoid double slashes if base ends and path starts with / (handled by cleanBaseUrl)
  // Avoid adding a trailing slash if pathPrefix is empty or just "/"
  if (pathPart === "/") pathPart = "";

  const fullUrl = `${cleanBaseUrl}${pathPart}?${urlParams.toString()}`;
  logInfo("Launch URL constructed", {
    clientId: config.clientId,
    url: fullUrl,
  });
  return fullUrl;
};
