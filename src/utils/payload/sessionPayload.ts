import { SessionPayload } from "@/types/payload";

/**
 * @function generateDefaultSessionPayload
 * @description Generates the default session payload object with dynamic values.
 * @description Creates a UUID v4 for the session ID, sets issued and expiry timestamps,
 *              and includes predefined keep-alive and callback URLs, nested under a 'session' key.
 * @returns {object} The default session payload object structured as { session: { ... } }.
 */
export const generateDefaultSessionPayload = (): SessionPayload => {
  const now = new Date();
  const expires = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry

  return {
    id: crypto.randomUUID(), // Generate UUID v4
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    keepAliveUrl: "https://www.digital-channel.com/keep-alive", // Example URL
    callbackUrl: "https://www.digital-channel.com/callback", // Example URL
  };
};

export const defaultSessionPayload = generateDefaultSessionPayload();

// Default payload templates (as mentioned in Task 3, using PRD examples)
// export const defaultSessionPayload = JSON.stringify(
//   generateDefaultSessionPayload(),
//   null,
//   2
// );
