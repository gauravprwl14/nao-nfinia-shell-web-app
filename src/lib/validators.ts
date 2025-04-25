/**
 * @fileoverview Provides validation functions for payloads and other data structures.
 * @version 1.0.0
 * @since 2025-04-23
 */

/**
 * @function isValidJson
 * @description Checks if a given string is valid JSON.
 * @param {string} str - The string to validate.
 * @returns {boolean} True if the string is valid JSON, false otherwise.
 * @example
 * isValidJson('{"key": "value"}'); // true
 * isValidJson('{"key": "value"'); // false
 * isValidJson(''); // false
 */
export const isValidJson = (str: string): boolean => {
  if (!str || typeof str !== "string") {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (e: Error | unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error during JSON parsing";
    console.error("JSON parsing error:", errorMessage);
    console.error(e);
    return false;
  }
};

/**
 * @function validatePayloads
 * @description Performs basic validation on session and user payload strings.
 * @description Currently checks if both strings are valid JSON.
 * @param {string} sessionPayloadStr - The session payload as a JSON string.
 * @param {string} userPayloadStr - The user payload as a JSON string.
 * @returns {string | null} An error message string if validation fails, or null if validation passes.
 * @example
 * validatePayloads('{}', '{}'); // null
 * validatePayloads('{', '{}'); // "Session payload is not valid JSON."
 */
export const validatePayloads = (
  sessionPayloadStr: string,
  userPayloadStr: string
): string | null => {
  if (!isValidJson(sessionPayloadStr)) {
    return "Session payload is not valid JSON.";
  }
  if (!isValidJson(userPayloadStr)) {
    return "User payload is not valid JSON.";
  }

  // Add more specific validation based on SessionPayload and UserPayload types if needed
  // For example, check for required fields after parsing:
  // try {
  //   const session = JSON.parse(sessionPayloadStr);
  //   if (!session.sessionId || !session.issuedAt || !session.expiresAt) {
  //     return 'Session payload is missing required fields (sessionId, issuedAt, expiresAt).';
  //   }
  //   const user = JSON.parse(userPayloadStr);
  //   if (!user.memberId) {
  //     return 'User payload is missing required field (memberId).';
  //   }
  // } catch (e) {
  //   // Should be caught by isValidJson, but as a safeguard
  //   return 'Error during detailed payload validation.';
  // }

  return null; // Validation passed
};

// Add other validation functions as needed (e.g., for configuration objects)
