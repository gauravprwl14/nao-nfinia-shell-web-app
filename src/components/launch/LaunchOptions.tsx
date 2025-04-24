/**
 * @fileoverview Component for selecting launch options (iframe/new tab) and triggering actions.
 * @description Provides UI elements to choose the launch method and buttons for previewing/generating
 *              the token and launching the child application.
 * @version 1.0.0
 * @since 2025-04-23
 */

import React from "react";

/**
 * @typedef {('iframe' | 'newTab')} LaunchMethod
 * @description Type defining the possible launch methods.
 */
export type LaunchMethod = "iframe" | "newTab";

/**
 * @interface LaunchOptionsProps
 * @description Props for the LaunchOptions component.
 * @property {LaunchMethod} value - The currently selected launch method.
 * @property {(value: LaunchMethod) => void} onChange - Callback function when the launch method changes.
 * @property {() => Promise<void>} onPreview - Async callback function triggered when the preview/generate button is clicked.
 * @property {() => void} onLaunch - Callback function triggered when the launch button is clicked.
 * @property {boolean} isLoading - Indicates if an operation (like token generation) is in progress.
 * @property {boolean} canLaunch - Indicates if the launch button should be enabled (e.g., after token generation).
 */
interface LaunchOptionsProps {
  value: LaunchMethod;
  onChange: (value: LaunchMethod) => void;
  onPreview: () => Promise<void>; // Renamed from generateToken for clarity
  onLaunch: () => void;
  isLoading: boolean;
  canLaunch: boolean; // Added to control launch button state
}

/**
 * @function LaunchOptions
 * @description Renders the launch options UI.
 * @param {LaunchOptionsProps} props - The component props.
 * @returns {React.ReactElement} The rendered LaunchOptions component.
 */
const LaunchOptions: React.FC<LaunchOptionsProps> = ({
  value,
  onChange,
  onPreview,
  onLaunch,
  isLoading,
  canLaunch,
}) => {
  return (
    <div className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Launch Options
      </h3>
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Launch Method:
        </span>
        <div className="flex items-center">
          <input
            type="radio"
            id="launch-iframe"
            name="launchMethod"
            value="iframe"
            checked={value === "iframe"}
            onChange={() => onChange("iframe")}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            aria-labelledby="launch-iframe-label"
          />
          <label
            htmlFor="launch-iframe"
            id="launch-iframe-label"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
          >
            Iframe
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="launch-newTab"
            name="launchMethod"
            value="newTab"
            checked={value === "newTab"}
            onChange={() => onChange("newTab")}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            aria-labelledby="launch-newTab-label"
          />
          <label
            htmlFor="launch-newTab"
            id="launch-newTab-label"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
          >
            New Tab
          </label>
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onPreview}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isLoading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Token & Preview URL"}
        </button>
        <button
          onClick={onLaunch}
          disabled={isLoading || !canLaunch} // Disable if loading or if token/URL not generated
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isLoading || !canLaunch
              ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
              : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
          }`}
          aria-disabled={isLoading || !canLaunch}
        >
          Launch NAO App
        </button>
      </div>
    </div>
  );
};

export default LaunchOptions;
