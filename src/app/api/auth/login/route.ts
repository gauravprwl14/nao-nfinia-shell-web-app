import { NextRequest, NextResponse } from "next/server";
import { LoginCredentials, AuthResponse } from "@/types/auth";

/**
 * @function POST
 * @description Handles POST requests for user login.
 * @description This API route validates user credentials against environment variables.
 * @description It expects a POST request with a JSON body containing username and password.
 * @param {NextRequest} req - The incoming API request object.
 * @returns {Promise<NextResponse<AuthResponse>>} A promise that resolves with the API response.
 * @throws Will return a 400 status code if the request body is missing or invalid JSON.
 * @throws Will return a 401 status code if the credentials are invalid.
 * @throws Will return a 500 status code if required environment variables are missing.
 * @security Sensitive operation: Compares provided credentials with server-side environment variables.
 * @example
 * // POST /api/auth/login
 * // Body: { "username": "admin", "password": "securepassword123" }
 * // Response (Success): Status 200 { "success": true }
 * // Response (Failure): Status 401 { "success": false, "message": "Invalid credentials" }
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<AuthResponse>> {
  // 1. Retrieve credentials from environment variables
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;

  // 2. Check if environment variables are set
  if (!expectedUsername || !expectedPassword) {
    console.error(
      "Authentication environment variables (AUTH_USERNAME, AUTH_PASSWORD) are not set."
    );
    // Return 500 for server configuration issues
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  let credentials: LoginCredentials;
  try {
    // 3. Parse request body
    credentials = await req.json();
  } catch (error) {
    // Handle JSON parsing errors
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { username, password } = credentials;

  // 4. Validate presence of username and password in the body
  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: "Username and password are required." },
      { status: 400 }
    );
  }

  // 5. Compare provided credentials with expected credentials
  const isValid =
    username === expectedUsername && password === expectedPassword;

  // 6. Send response
  if (isValid) {
    // In a real application, you would typically set a session cookie or JWT here.
    // For this simulator, we just confirm success.
    return NextResponse.json({ success: true }, { status: 200 });
  } else {
    // Return 401 for invalid credentials
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
