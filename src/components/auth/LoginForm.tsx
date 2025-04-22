import React, { useState, FormEvent } from "react";
import { LoginCredentials } from "@/types/auth";

/**
 * @interface LoginFormProps
 * @description Defines the props for the LoginForm component.
 * @property {(credentials: LoginCredentials) => Promise<void>} onLogin - Callback function executed upon successful form submission with valid credentials.
 * @property {string | null} error - An optional error message to display.
 * @property {boolean} isLoading - Indicates if the login process is currently in progress.
 */
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

/**
 * @component LoginForm
 * @description Renders a form for user authentication.
 * @description Handles user input for username and password, performs basic validation, and triggers the onLogin callback upon submission.
 * @param {LoginFormProps} props - The props for the component.
 * @param {Function} props.onLogin - The function to call when the user submits the form.
 * @param {string | null} props.error - An error message to display, if any.
 * @param {boolean} props.isLoading - Flag to indicate if the login process is ongoing.
 * @returns {React.ReactElement} The rendered login form element.
 * @example
 * <LoginForm onLogin={handleLogin} error={loginError} isLoading={isSubmitting} />
 */
const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  error,
  isLoading,
}): React.ReactElement => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  /**
   * @function handleSubmit
   * @description Handles the form submission event.
   * @description Prevents the default form submission, validates inputs, and calls the onLogin prop.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event object.
   * @returns {Promise<void>} A promise that resolves when the login attempt is handled.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    if (!username || !password) {
      // Basic client-side validation (more robust validation can be added)
      alert("Please enter both username and password.");
      return;
    }
    await onLogin({ username, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
          aria-live="assertive"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          aria-required="true"
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="Enter your username"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-required="true"
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          placeholder="Enter your password"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
