/**
 * @fileoverview Component for displaying the generated JWE token and launch URL with copy functionality.
 * @description Renders the generated token and the full launch URL, allowing users to copy each value to the clipboard.
 * @version 1.1.0
 * @since 2025-04-23
 */

import React, { useState } from "react"; // Import useState

/**
 * @interface TokenPreviewProps
 * @description Props for the TokenPreview component.
 * @property {string} token - The generated JWE token string.
 * @property {string} url - The constructed launch URL.
 */
interface TokenPreviewProps {
  token: string;
  url: string;
}

/**
 * @function TokenPreview
 * @description Renders the token and URL preview section with copy buttons.
 * @param {TokenPreviewProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered TokenPreview component or null if no token/URL.
 */
const TokenPreview: React.FC<TokenPreviewProps> = ({ token, url }) => {
  // State to manage copy feedback for token and URL
  const [tokenCopied, setTokenCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  /**
   * @function handleCopy
   * @description Copies the provided text to the clipboard and sets feedback state.
   * @param {string} textToCopy - The text to be copied.
   * @param {'token' | 'url'} type - The type of content being copied ('token' or 'url').
   * @returns {Promise<void>}
   * @throws {Error} If clipboard API is unavailable or fails.
   */
  const handleCopy = async (textToCopy: string, type: "token" | "url") => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (type === "token") {
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000); // Reset after 2 seconds
      } else {
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000); // Reset after 2 seconds
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Optionally: Show an error message to the user
    }
  };

  if (!token && !url) {
    return null; // Don't render anything if there's no token or URL yet
  }

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800 space-y-4">
      {" "}
      {/* Increased space */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Preview
      </h3>
      {token && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="token-preview"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Generated Token (JWE):
            </label>
            <button
              onClick={() => handleCopy(token, "token")}
              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Copy generated token"
            >
              {tokenCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            id="token-preview"
            readOnly
            value={token} // Display full token in textarea
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            rows={4}
            aria-describedby="token-copy-button" // Optional: for better accessibility if needed
          />
        </div>
      )}
      {url && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="url-preview"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Launch URL:
            </label>
            <button
              onClick={() => handleCopy(url, "url")}
              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Copy launch URL"
            >
              {urlCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <input
            id="url-preview"
            type="text"
            readOnly
            value={url}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-describedby="url-copy-button" // Optional: for better accessibility if needed
          />
        </div>
      )}
    </div>
  );
};

export default TokenPreview;
