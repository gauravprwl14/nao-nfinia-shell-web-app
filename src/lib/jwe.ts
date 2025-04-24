/**
 * @fileoverview Provides functions for JWE token generation using the JOSE library.
 * @version 1.0.0
 * @since 2025-04-23
 */
import * as jose from "jose";
import { EnvironmentConfig } from "@/types/config";
import { CombinedPayload } from "@/types/payload";
import { logInfo } from "./logger";

/**
 * @interface GenerateTokenOptions
 * @description Options for the generateJweToken function.
 * @property {CombinedPayload} payload - The combined payload object to encrypt.
 * @property {EnvironmentConfig} config - The configuration for the selected environment.
 */
interface GenerateTokenOptions {
  payload: CombinedPayload;
  config: EnvironmentConfig;
}

/**
 * @function generateJweToken
 * @description Generates a JWE token using the provided payload and configuration.
 * @description Encrypts the payload using the public key and algorithms specified in the environment config.
 * @param {GenerateTokenOptions} options - The options containing payload and configuration.
 * @returns {Promise<string>} A promise that resolves with the generated JWE token string.
 * @throws {Error} If key import fails, encryption fails, or configuration is invalid.
 * @security Handles cryptographic operations. Ensure public keys are in the correct format (SPKI PEM).
 */
export const generateJweToken = async ({
  payload,
  config,
}: GenerateTokenOptions): Promise<string> => {
  try {
    logInfo("Generating JWE token", {
      payload,
      config,
    });
    // --- Validate Configuration ---
    if (!config.keys) {
      throw new Error("Keys are missing in the environment configuration.");
    }
    const keyEncryptionAlgorithm =
      config.keyEncryptionAlgorithm || "RSA-OAEP-256"; // Default from PRD
    const contentEncryptionAlgorithm =
      config.contentEncryptionAlgorithm || "A256GCM"; // Default from PRD

    // --- Import Public Key ---
    // Ensure the key is in the correct SPKI PEM format (e.g., starts with -----BEGIN PUBLIC KEY-----)
    let publicKey: jose.KeyLike;
    try {
      publicKey = await jose.importSPKI(
        config.keys.enc.publicKey,
        keyEncryptionAlgorithm
      );
    } catch (keyError: any) {
      console.error("Public key import error:", keyError);
      throw new Error(
        `Failed to import public key: ${keyError.message}. Ensure it's a valid SPKI PEM format for algorithm ${keyEncryptionAlgorithm}.`
      );
    }

    // --- Prepare Payload ---
    const payloadString = JSON.stringify(payload);
    const payloadBytes = new TextEncoder().encode(payloadString);

    // --- Encrypt Payload (Generate JWE) ---
    const jwe = await new jose.CompactEncrypt(payloadBytes)
      .setProtectedHeader({
        alg: keyEncryptionAlgorithm,
        enc: contentEncryptionAlgorithm,
        kid: config.clientId, // Use apiKey as Key ID as per PRD example
        // Add other headers if needed (e.g., typ: 'JWT')
      })
      .encrypt(publicKey);

    return jwe;
  } catch (error: any) {
    console.error("JWE generation failed:", error);
    // Re-throw a more specific error or handle as needed
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * @function constructLaunchUrl
 * @description Constructs the final launch URL for the child application.
 * @description Appends the generated token and any additional parameters from the config.
 * @param {string} token - The generated JWE token.
 * @param {EnvironmentConfig} config - The configuration for the selected environment.
 * @returns {string} The fully constructed launch URL.
 * @throws {Error} If the childDomain is missing in the configuration.
 */
export const constructLaunchUrl = (
  token: string,
  config: EnvironmentConfig
): string => {
  if (!config.childDomain) {
    throw new Error(
      "Child domain is missing in the environment configuration."
    );
  }

  const baseUrl = config.childDomain;
  // Ensure domain doesn't end with a slash if pathPrefix doesn't start with one
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const pathPrefix = config.urlConfig?.pathPrefix || ""; // Default from PRD
  const tokenParam = config.urlConfig?.tokenParam || "ssotoken"; // Default from PRD
  const additionalParams = config.urlConfig?.additionalParams || {};

  const urlParams = new URLSearchParams({
    [tokenParam]: token,
    ...additionalParams,
  });

  const fullUrl = `${cleanBaseUrl}${pathPrefix}?${urlParams.toString()}`;
  return fullUrl;
};
