"use client";

import React, { useEffect } from "react";
import { useConfiguration } from "@/context/ConfigurationContext";
import { logInfo } from "@/lib/logger";

/**
 * @interface ClientSelectorProps
 * @description Defines the properties required by the ClientSelector component.
 * @property {string} selectedClientName - The name of the currently selected client. Controls the select input's value.
 * @property {(clientName: string) => void} selectClient - Callback function triggered when a new client is selected. Passes the name of the selected client.
 */
interface ClientSelectorProps {
  selectedClientName: string;
  selectClient: (clientName: string) => void;
}

/**
 * @component ClientSelector
 * @description Renders a dropdown menu to select the active client.
 * @description Uses the `useConfiguration` hook to access the list of available clients.
 *              Receives the current selection state and the update function via props.
 * @param {ClientSelectorProps} props - The properties passed to the component.
 * @param {string} props.selectedClientName - The name of the currently selected client.
 * @param {(clientName: string) => void} props.selectClient - Function to call when the selection changes.
 * @returns {React.ReactElement | null} A select dropdown element populated with client names,
 *                                      or null if there's an error or no clients are configured.
 * @example
 * <ClientSelector
 *   selectedClientName={currentClient}
 *   selectClient={handleClientChange}
 * />
 */
const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientName,
  selectClient,
}): React.ReactElement | null => {
  // --- Hooks ---
  // const { clients, selectedClientName, selectClient, error } =
  const { clients, error } = useConfiguration();

  useEffect(() => {
    if (!clients || clients.length === 0) {
      logInfo("No clients available to select.");
      return;
    }

    if (!selectedClientName) {
      logInfo("No client selected, defaulting to the first client.");
      selectClient(clients[0].name);
      return;
    }

    logInfo(
      `Inside the config selector Client selected: ${selectedClientName}`
    );
    // return () => {
    //   second
    // }
  }, []);

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
