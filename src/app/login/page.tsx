"use client"; // Mark this page as a Client Component

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { setAuthStatus } from "@/components/auth/AuthGuard"; // Import the helper
import { LoginCredentials, AuthResponse } from "@/types/auth";

/**
 * @page LoginPage
 * @description Renders the login page for the SSO Simulation Tool.
 * @description It displays the LoginForm component and handles the API call for authentication.
 * @description Upon successful login, it sets an authentication flag in sessionStorage and redirects the user to the main application page ('/').
 * @returns {React.ReactElement} The rendered login page element.
 * @example
 * // Navigate to /login to view this page.
 */
const LoginPage: React.FC = (): React.ReactElement => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @function handleLogin
   * @description Handles the login attempt by calling the backend API.
   * @param {LoginCredentials} credentials - The username and password entered by the user.
   * @returns {Promise<void>} A promise that resolves when the login attempt is complete.
   * @throws Sets an error state if the API call fails or returns an unsuccessful response.
   */
  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed. Please check your credentials."
        );
      }

      // Set authentication status in session storage on successful login
      setAuthStatus(true);
      // Redirect to the main page
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred during login.");
      setAuthStatus(false); // Ensure auth status is false on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginForm onLogin={handleLogin} error={error} isLoading={isLoading} />
    </div>
  );
};

export default LoginPage;
