/**
 * @fileoverview API route for application health check.
 * @version 1.0.0
 * @since 2025-04-23
 */
import { NextResponse } from "next/server";
import { loadAndValidateConfig } from "@/lib/config"; // Optional: Check config loading

/**
 * @function GET
 * @description Handles GET requests to the health check endpoint.
 * @description Performs basic checks (e.g., server is running, configuration loads)
 *              and returns a status indicating the application's health.
 * @returns {Promise<NextResponse>} A promise resolving to the health status response.
 * @example
 * // GET /api/health
 * // Response (Success): Status 200 { status: "ok", timestamp: "..." }
 * // Response (Failure): Status 503 { status: "error", message: "...", timestamp: "..." }
 */
export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    // Optional: Perform a quick check to see if the configuration can be loaded.
    // This adds a dependency check but might be useful.
    loadAndValidateConfig();

    // If checks pass, return OK status
    return NextResponse.json(
      {
        status: "ok",
        timestamp: timestamp,
      },
      { status: 200 }
    );
  } catch (error: Error | unknown) {
    // If any check fails, return an error status
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Health check failed:", errorMessage);
    return NextResponse.json(
      {
        status: "error",
        message: `Health check failed: ${errorMessage}`,
        timestamp: timestamp,
      },
      { status: 503 } // 503 Service Unavailable is appropriate here
    );
  }
}
