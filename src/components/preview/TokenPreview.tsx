/**
 * @fileoverview Component for displaying the generated JWE token and launch URL.
 * @description Renders the generated token (truncated for brevity) and the full launch URL.
 * @version 1.0.0
 * @since 2025-04-23
 */

import React from "react";

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
 * @description Renders the token and URL preview section.
 * @param {TokenPreviewProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered TokenPreview component or null if no token/URL.
 */
const TokenPreview: React.FC<TokenPreviewProps> = ({ token, url }) => {
  if (!token && !url) {
    return null; // Don't render anything if there's no token or URL yet
  }

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Preview
      </h3>

      {token && (
        <div>
          <label
            htmlFor="token-preview"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Generated Token (JWE):
          </label>
          <textarea
            id="token-preview"
            readOnly
            value={token} // Display full token in textarea
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            rows={4}
            aria-label="Generated JWE Token"
          />
          {/* Optional: Add a button to copy the full token */}
        </div>
      )}

      {url && (
        <div>
          <label
            htmlFor="url-preview"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Launch URL:
          </label>
          <input
            id="url-preview"
            type="text"
            readOnly
            value={url}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label="Generated Launch URL"
          />
          {/* Optional: Add a button to copy the URL */}
        </div>
      )}
    </div>
  );
};

export default TokenPreview;
