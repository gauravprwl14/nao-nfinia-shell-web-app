/**
 * @fileoverview API route handler for generating JWE tokens.
 * @description Handles POST requests to generate a JWE token based on client configuration,
 *              environment, session payload, and user payload.
 * @version 1.0.0
 * @since 2025-04-23
 */

import { NextRequest, NextResponse } from "next/server";
import { getEnvironmentConfig, loadAndValidateConfig } from "@/lib/config";
import {
  generateSignedAndEncryptedToken,
  // generateJweToken,
  constructLaunchUrl,
} from "@/lib/jwe";
import {
  CombinedPayload,
  // SessionPayload, UserPayload
} from "@/types/payload";
import {
  GenerateTokenRequest,
  GenerateTokenResponse,
  GenerateTokenErrorResponse,
} from "@/types/token";
// import { logInfo, logError } from '@/lib/logger'; // Uncomment when logger is implemented (Task 5)

/**
 * @function POST
 * @description Handles POST requests to generate a JWE token.
 * @description Validates the request body, retrieves configuration, combines payloads,
 *              generates the JWE token, constructs the launch URL, and returns the result.
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse<GenerateTokenResponse>>} A promise resolving to the Next.js response.
 * @throws Will return error responses for invalid method, missing/invalid config, payload issues, or token generation failures.
 * @example
 * // POST /api/token/generate
 * // Body: { clientName: "ClientA", environment: "dev", sessionPayload: {...}, userPayload: {...} }
 * // Response (Success): Status 200 { status: "success", token: "...", url: "..." }
 * // Response (Error): Status 4xx/5xx { status: "error", code: "...", message: "..." }
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateTokenResponse>> {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID(); // Basic request ID for potential logging

  try {
    // --- 1. Parse and Validate Request Body ---
    let requestBody: GenerateTokenRequest;
    try {
      requestBody = await req.json();
    } catch (e) {
      // logError('Failed to parse request body', e, { requestId }); // Task 5
      console.error("Failed to parse request body", e);
      return NextResponse.json<GenerateTokenErrorResponse>(
        {
          status: "error",
          code: "INVALID_REQUEST_BODY",
          message: "Invalid JSON in request body.",
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    const { clientName, environment, sessionPayload, userPayload } =
      requestBody;

    // Basic validation of presence
    if (!clientName || !environment || !sessionPayload || !userPayload) {
      // logError('Missing fields in token generation request', new Error('Missing fields'), { requestId, body: requestBody }); // Task 5
      console.error("Missing fields in token generation request", {
        body: requestBody,
      });
      return NextResponse.json<GenerateTokenErrorResponse>(
        {
          status: "error",
          code: "MISSING_FIELDS",
          message:
            "Missing required fields: clientName, environment, sessionPayload, userPayload.",
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    // --- 2. Load and Retrieve Configuration ---
    let environmentConfig;
    try {
      // Ensure configurations are loaded (can potentially be cached)
      loadAndValidateConfig();
      environmentConfig = getEnvironmentConfig(clientName, environment);
      if (!environmentConfig) {
        throw new Error(
          `Configuration not found for ${clientName}/${environment}`
        );
      }
    } catch (error: Error | unknown) {
      // logError('Configuration error during token generation', error, { requestId, clientName, environment }); // Task 5
      console.error("Configuration error during token generation", error);
      return NextResponse.json<GenerateTokenErrorResponse>(
        {
          status: "error",
          code: "INVALID_CONFIGURATION",
          message: `Configuration error: ${(error as Error).message}`,
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    // --- 3. Validate Payloads (More specific validation if needed) ---
    // The basic structure is implicitly validated by TypeScript types if parsing succeeds.
    // Add more specific business logic validation here if required (e.g., check specific field values).
    // const validationError = validateSpecificPayloadFields(sessionPayload, userPayload); // Example
    // if (validationError) { ... return error ... }

    // --- 4. Combine Payloads and Add JWT Claims ---
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expirationSeconds =
      nowSeconds + (environmentConfig.tokenExpiration || 300); // Default 5 mins

    const combinedPayload: CombinedPayload = {
      // Spread session payload, excluding potential overlaps if needed
      session: sessionPayload,
      // Nest user payload as per PRD section 8 and 10.1
      // Required fields from CombinedPayload type
      identityKey: userPayload.identityKey || "",
      customer: userPayload.customer,
      // Add standard JWT claims
      iat: nowSeconds, // Issued At
      exp: expirationSeconds, // Expiration Time
    };

    // --- 5. Generate JWE Token ---
    let jweToken: string;
    try {
      jweToken = await generateSignedAndEncryptedToken({
        payload: combinedPayload,
        config: environmentConfig,
      });
    } catch (error: Error | unknown) {
      // logError('JWE token generation failed', error, { requestId, clientName, environment }); // Task 5
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown Error Inside the generateSignedAndEncryptedToken";
      console.error("JWE token generation failed", error);
      return NextResponse.json<GenerateTokenErrorResponse>(
        {
          status: "error",
          code: "TOKEN_GENERATION_ERROR",
          message: "Failed to generate JWE token.",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
          timestamp,
          requestId,
        },
        { status: 500 }
      );
    }

    const fullUrl = constructLaunchUrl(jweToken, environmentConfig);

    // --- 6. Construct Launch URL ---
    // const baseUrl = environmentConfig.childDomain;
    // const pathPrefix = environmentConfig.urlConfig?.pathPrefix || "/sso/launch";
    // const tokenParam = environmentConfig.urlConfig?.tokenParam || "token";
    // const additionalParams =
    //   environmentConfig.urlConfig?.additionalParams || {}; // Ensure it's an object

    // const urlParams = new URLSearchParams({
    //   [tokenParam]: jweToken,
    //   ...additionalParams,
    // });

    // const fullUrl = `${baseUrl}${pathPrefix}?${urlParams.toString()}`;

    // --- 7. Log Success and Return Response ---
    // logInfo('Token generated successfully', { requestId, clientName, environment, url: fullUrl }); // Task 5
    console.log("Token generated successfully", {
      clientName,
      environment,
      url: fullUrl,
    });

    return NextResponse.json<GenerateTokenResponse>(
      {
        status: "success",
        token: jweToken,
        url: fullUrl,
      },
      { status: 200 }
    );
  } catch (error: Error | unknown) {
    // Catch unexpected errors during the process
    // logError('Unexpected error in token generation endpoint', error, { requestId }); // Task 5
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "Unexpected error in token generation endpoint",
      errorMessage
    );
    return NextResponse.json<GenerateTokenErrorResponse>(
      {
        status: "error",
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected internal server error occurred.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        timestamp,
        requestId,
      },
      { status: 500 }
    );
  }
}
