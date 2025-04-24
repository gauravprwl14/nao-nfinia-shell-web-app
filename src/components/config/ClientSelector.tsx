"use client";

import React from "react";
import { useConfiguration } from "@/context/ConfigurationContext";
import { logInfo } from "@/lib/logger";

/**
 * @component ClientSelector
 * @description Renders a dropdown menu to select the active client.
 * @description Uses the `useConfiguration` hook to access the list of available clients
 *              and the function to update the selected client in the global context.
 * @returns {React.ReactElement | null} A select dropdown element populated with client names,
 *                                      or null if there's an error or no clients are configured.
 * @example
 * <ClientSelector />
 */
const ClientSelector: React.FC = ({
  selectedClientName,
  selectClient,
}): React.ReactElement | null => {
  // --- Hooks ---
  // const { clients, selectedClientName, selectClient, error } =
  const { clients, error } = useConfiguration();

  // --- Event Handlers ---
  /**
   * @function handleChange
   * @description Handles the change event of the select dropdown.
   * @description Calls the `selectClient` function from the context to update the global state.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The select change event object.
   * @returns {void}
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    logInfo(
      `Inside the config selector Client selected: ${event.target.value}`
    );
    selectClient(event.target.value);

    // event.preventDefault();
  };

  // --- Render Logic ---
  // Do not render if there was an error loading configuration or no clients exist
  if (error || clients.length === 0) {
    return null; // Or render an error/empty state message
  }

  return (
    <div>
      <label
        htmlFor="client-selector"
        className="block text-sm font-medium text-black mb-1" // Adjusted color for header
      >
        Client
      </label>
      <select
        id="client-selector"
        name="client"
        value={selectedClientName || ""}
        onChange={handleChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        aria-label="Select Client"
      >
        {/* Placeholder option if needed */}
        {/* <option value="" disabled>Select a client</option> */}
        {clients.map((client) => (
          <option key={client.name} value={client.name}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClientSelector;
