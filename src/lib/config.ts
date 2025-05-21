/**
 * @fileoverview Configuration management library for the SSO Simulation Tool.
 * @description Provides functions to load, parse, validate, and access client/environment
 *              configurations stored in the CLIENT_CONFIGURATIONS environment variable.
 * @version 1.0.0
 * @since 2025-04-22
 */

import { RootConfig, ClientConfig, EnvironmentConfig } from "@/types/config";

// Memoization cache for the parsed configuration
let parsedConfig: RootConfig | null = null;
let parseError: Error | null = null;

/**
 * @function loadAndValidateConfig
 * @description Loads the configuration from the CLIENT_CONFIGURATIONS environment variable,
 *              parses it as JSON, and performs basic validation.
 * @description This function is memoized to avoid redundant parsing and validation.
 *              It should only be called server-side or during build time if possible.
 * @returns {RootConfig} The parsed and validated root configuration object.
 * @throws {Error} If the CLIENT_CONFIGURATIONS environment variable is not set.
 * @throws {Error} If the configuration string is not valid JSON.
 * @throws {Error} If the parsed configuration does not match the expected structure (basic validation).
 * @security Reads environment variables, ensure this is done in a secure context.
 */
export const loadAndValidateConfig = (): RootConfig => {
  // Return cached result if available
  if (parsedConfig) {
    return parsedConfig;
  }
  // Return cached error if parsing failed previously
  if (parseError) {
    throw parseError;
  }

  const configJson = process.env.NEXT_PUBLIC_CLIENT_CONFIGURATIONS;

  if (!configJson) {
    parseError = new Error(
      "CLIENT_CONFIGURATIONS environment variable is not set."
    );
    console.error(parseError.message);
    throw parseError;
  }

  try {
    const config: unknown = JSON.parse(configJson);
    console.log("Parsed CLIENT_CONFIGURATIONS:", {
      config: JSON.stringify(config),
    });

    // Basic structural validation (more robust validation can be added using libraries like Zod)
    if (
      typeof config !== "object" ||
      config === null ||
      !Array.isArray((config as RootConfig).clients)
    ) {
      throw new Error(
        "Invalid configuration structure: Root object or clients array is missing."
      );
    }

    const rootConfig = config as RootConfig;

    // Further validation (example: ensure names are unique, required fields exist)
    if (
      !rootConfig.clients.every(
        (client) => client.name && Array.isArray(client.environments)
      )
    ) {
      throw new Error(
        "Invalid client configuration: Missing name or environments array."
      );
    }

    rootConfig.clients.forEach((client) => {
      if (
        !client.environments.every(
          (env) =>
            env.name &&
            env.childDomain &&
            env.clientId &&
            env.clientSecret &&
            env.keys.enc.publicKey &&
            env.keys.sig.publicKey
        )
      ) {
        throw new Error(
          `Invalid environment configuration in client "${client.name}": Missing required fields (name, childDomain, apiKey, apiSecret, publicKey).`
        );
      }
    });

    // Memoize the successfully parsed and validated config
    parsedConfig = rootConfig;
    return parsedConfig;
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred inside the loadAndValidateConfig function.";
    parseError = new Error(
      `Failed to parse or validate CLIENT_CONFIGURATIONS: ${errorMessage}`
    );
    console.error(parseError.message, error);
    throw parseError;
  }
};

/**
 * @function getClients
 * @description Retrieves the list of client configurations.
 * @returns {ClientConfig[]} An array of client configuration objects.
 * @throws {Error} If the configuration cannot be loaded or validated.
 */
export const getClients = (): ClientConfig[] => {
  const config = loadAndValidateConfig();
  return config.clients;
};

/**
 * @function getClientNames
 * @description Retrieves a list of client names.
 * @returns {string[]} An array of client names.
 * @throws {Error} If the configuration cannot be loaded or validated.
 */
export const getClientNames = (): string[] => {
  return getClients().map((client) => client.name);
};

/**
 * @function getEnvironmentsForClient
 * @description Retrieves the list of environment configurations for a specific client.
 * @param {string} clientName - The name of the client.
 * @returns {EnvironmentConfig[] | undefined} An array of environment configuration objects for the client, or undefined if the client is not found.
 * @throws {Error} If the configuration cannot be loaded or validated.
 */
export const getEnvironmentsForClient = (
  clientName: string
): EnvironmentConfig[] | undefined => {
  const client = getClients().find((c) => c.name === clientName);
  return client?.environments;
};

/**
 * @function getEnvironmentNamesForClient
 * @description Retrieves a list of environment names for a specific client.
 * @param {string} clientName - The name of the client.
 * @returns {string[] | undefined} An array of environment names for the client, or undefined if the client is not found.
 * @throws {Error} If the configuration cannot be loaded or validated.
 */
export const getEnvironmentNamesForClient = (
  clientName: string
): string[] | undefined => {
  return getEnvironmentsForClient(clientName)?.map((env) => env.name);
};

/**
 * @function getEnvironmentConfig
 * @description Retrieves the specific configuration for a given client and environment name.
 * @param {string} clientName - The name of the client.
 * @param {string} environmentName - The name of the environment.
 * @returns {EnvironmentConfig | undefined} The environment configuration object, or undefined if not found.
 * @throws {Error} If the configuration cannot be loaded or validated.
 */
export const getEnvironmentConfig = (
  clientName: string,
  environmentName: string
): EnvironmentConfig | undefined => {
  const environments = getEnvironmentsForClient(clientName);
  return environments?.find((env) => env.name === environmentName);
};
