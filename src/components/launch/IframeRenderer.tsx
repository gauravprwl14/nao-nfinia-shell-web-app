/**
 * @fileoverview Component for rendering the child application within an iframe.
 * @description Displays an iframe pointing to the provided URL.
 * @version 1.0.0
 * @since 2025-04-23
 */

import React from "react";

/**
 * @interface IframeRendererProps
 * @description Props for the IframeRenderer component.
 * @property {string} url - The URL to load in the iframe.
 */
interface IframeRendererProps {
  url: string;
}

/**
 * @function IframeRenderer
 * @description Renders an iframe with the specified URL.
 * @param {IframeRendererProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered IframeRenderer component or null if no URL.
 */
const IframeRenderer: React.FC<IframeRendererProps> = ({ url }) => {
  if (!url) {
    return null; // Don't render if the URL is not yet available
  }

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Child Application (Iframe)
      </h3>
      <iframe
        src={url}
        title="Child Application"
        className="w-full h-96 border border-gray-300 rounded-md dark:border-gray-600"
        // Consider adding sandbox attributes for security if needed:
        // sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onError={(e) => {
          // Basic error handling - logs to console.
          // More robust handling (e.g., displaying a message) can be added.
          console.error("Iframe loading error:", e);
          // Consider checking for specific errors like X-Frame-Options issues,
          // although detecting them reliably client-side is difficult.
        }}
        aria-label="Embedded child application content"
      ></iframe>
    </div>
  );
};

export default IframeRenderer;
