import React, { useState, useEffect } from "react";
// Correct import for App Router
import { useRouter } from "next/navigation";

/**
 * @interface AuthGuardProps
 * @description Defines the props for the AuthGuard component.
 * @property {React.ReactNode} children - The content to render if the user is authenticated.
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

// Simple key for session storage
const AUTH_STATUS_KEY = "sso_sim_auth_status";

/**
 * @component AuthGuard
 * @description Protects routes by checking the user's authentication status.
 * @description It checks for a flag in sessionStorage. If the user is not authenticated (flag not present or false),
 * @description it redirects them to the login page. Otherwise, it renders the child components.
 * @param {AuthGuardProps} props - The props for the component.
 * @param {React.ReactNode} props.children - The components to render for authenticated users.
 * @returns {React.ReactElement | null} The child components if authenticated, or null while redirecting/checking.
 * @example
 * <AuthGuard>
 *   <ProtectedPageContent />
 * </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
}): React.ReactElement | null => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initially, true/false after check

  useEffect(() => {
    // Check authentication status only on the client-side
    if (typeof window !== "undefined") {
      const authStatus = sessionStorage.getItem(AUTH_STATUS_KEY);
      if (authStatus === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Redirect to login page if not authenticated
        router.push("/login");
      }
    }
  }, [router]);

  // Render children only if authenticated, otherwise render nothing (or a loader)
  // while the check is in progress or redirecting.
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  // Render null or a loading indicator while checking or redirecting
  return null; // Or <LoadingSpinner />
};

export default AuthGuard;

/**
 * @function setAuthStatus
 * @description Sets the authentication status in sessionStorage.
 * @param {boolean} status - The authentication status to set (true for logged in, false for logged out).
 * @returns {void}
 */
export const setAuthStatus = (status: boolean): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_STATUS_KEY, String(status));
  }
};

/**
 * @function clearAuthStatus
 * @description Clears the authentication status from sessionStorage.
 * @returns {void}
 */
export const clearAuthStatus = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_STATUS_KEY);
  }
};
