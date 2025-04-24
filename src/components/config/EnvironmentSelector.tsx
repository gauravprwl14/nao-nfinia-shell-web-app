"use client";

import React from "react";
import { useConfiguration } from "@/context/ConfigurationContext";

/**
 * @component EnvironmentSelector
 * @description Renders a dropdown menu to select the active environment for the currently selected client.
 * @description Uses the `useConfiguration` hook to access the list of available environments
 *              for the selected client and the function to update the selected environment.
 * @returns {React.ReactElement | null} A select dropdown element populated with environment names,
 *                                      or null if no client is selected, no environments exist for the client,
 *                                      or if there was a configuration error.
 * @example
 * <EnvironmentSelector />
 */
const EnvironmentSelector: React.FC = ({
  selectedClientName,
  availableEnvironments,
  selectedEnvironmentName,
  selectEnvironment,
  onChange,
  // error,
}): React.ReactElement | null => {
  // --- Hooks ---
  // const {
  //   availableEnvironments,
  //   selectedEnvironmentName,
  //   selectEnvironment,
  //   selectedClientName, // Needed to determine if environments should be shown
  //   error,
  // } = useConfiguration();

  const { error } = useConfiguration();

  // --- Event Handlers ---
  /**
   * @function handleChange
   * @description Handles the change event of the select dropdown.
   * @description Calls the `selectEnvironment` function from the context to update the global state.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The select change event object.
   * @returns {void}
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange(event.target.value);
  };

  // --- Render Logic ---
  // Do not render if there was an error, no client is selected, or no environments are available
  if (error || !selectedClientName || availableEnvironments.length === 0) {
    return null; // Or render a disabled/empty state
  }

  return (
    <div>
      <label
        htmlFor="environment-selector"
        className="block text-sm font-medium text-gray-300 mb-1" // Adjusted color for header
      >
        Environment
      </label>
      <select
        id="environment-selector"
        name="environment"
        value={selectedEnvironmentName || ""}
        onChange={handleChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        aria-label="Select Environment"
        // Disable if no client is selected or no environments exist
        disabled={!selectedClientName || availableEnvironments.length === 0}
      >
        {/* Placeholder option if needed */}
        {/* <option value="" disabled>Select an environment</option> */}
        {availableEnvironments.map((env) => (
          <option key={env.name} value={env.name}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EnvironmentSelector;
