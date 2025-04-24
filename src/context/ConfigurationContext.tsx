"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { RootConfig, ClientConfig, EnvironmentConfig } from "@/types/config";
import {
  loadAndValidateConfig,
  getClients,
  getEnvironmentsForClient,
  getEnvironmentConfig,
} from "@/lib/config";

/**
 * @interface ConfigurationState
 * @description Defines the shape of the configuration state managed by the context.
 * @property {RootConfig | null} config - The loaded root configuration object, or null if not loaded/error.
 * @property {ClientConfig[]} clients - List of available clients.
 * @property {string | null} selectedClientName - The name of the currently selected client.
 * @property {EnvironmentConfig[]} availableEnvironments - List of environments available for the selected client.
 * @property {string | null} selectedEnvironmentName - The name of the currently selected environment.
 * @property {EnvironmentConfig | null} selectedEnvironmentConfig - The full configuration object for the selected environment.
 * @property {Error | null} error - Any error encountered during configuration loading.
 * @property {(clientName: string) => void} selectClient - Function to update the selected client.
 * @property {(environmentName: string) => void} selectEnvironment - Function to update the selected environment.
 */
interface ConfigurationState {
  config: RootConfig | null;
  clients: ClientConfig[];
  selectedClientName: string | null;
  availableEnvironments: EnvironmentConfig[];
  selectedEnvironmentName: string | null;
  selectedEnvironmentConfig: EnvironmentConfig | null;
  error: Error | null;
  selectClient: (clientName: string) => void;
  selectEnvironment: (environmentName: string) => void;
}

/**
 * @constant ConfigurationContext
 * @description React context object for managing and providing configuration state.
 * @throws {Error} If used outside of a ConfigurationProvider.
 */
export const ConfigurationContext = createContext<
  ConfigurationState | undefined
>(undefined);

/**
 * @interface ConfigurationProviderProps
 * @description Defines the props for the ConfigurationProvider component.
 * @property {ReactNode} children - The child components that will consume the context.
 */
interface ConfigurationProviderProps {
  children: ReactNode;
}

/**
 * @component ConfigurationProvider
 * @description Provides the configuration state to its children via context.
 * @description It loads the configuration, manages the selected client and environment,
 *              and handles updates when selections change.
 * @param {ConfigurationProviderProps} props - The component props.
 * @param {ReactNode} props.children - Child components to render within the provider.
 * @returns {React.ReactElement} The provider component wrapping the children.
 * @example
 * <ConfigurationProvider>
 *   <App />
 * </ConfigurationProvider>
 */
export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({
  children,
}): React.ReactElement => {
  const [config, setConfig] = useState<RootConfig | null>(null);
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(
    null
  );
  const [availableEnvironments, setAvailableEnvironments] = useState<
    EnvironmentConfig[]
  >([]);
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState<
    string | null
  >(null);
  const [selectedEnvironmentConfig, setSelectedEnvironmentConfig] =
    useState<EnvironmentConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * @effect Load configuration on initial mount.
   * @description Attempts to load and validate the configuration from the environment variables.
   *              Sets the config state or error state accordingly.
   *              Initializes the client list and selects the first client by default if available.
   */
  useEffect(() => {
    try {
      const loadedConfig = loadAndValidateConfig();
      setConfig(loadedConfig);
      const loadedClients = getClients(); // Use the function from lib/config
      setClients(loadedClients);
      setError(null);

      // Select the first client by default if available
      if (loadedClients.length > 0) {
        selectClient(loadedClients[0].name);
      }
    } catch (err: any) {
      console.error("Configuration loading error:", err);
      setError(err);
      setConfig(null);
      setClients([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  /**
   * @function selectClient
   * @description Updates the selected client state and resets the environment selection.
   * @param {string} clientName - The name of the client to select.
   */
  const selectClient = (clientName: string): void => {
    setSelectedClientName(clientName);
    const environments = getEnvironmentsForClient(clientName) || [];
    setAvailableEnvironments(environments);

    // Reset or select the first environment for the new client
    if (environments.length > 0) {
      selectEnvironment(environments[0].name);
    } else {
      setSelectedEnvironmentName(null);
      setSelectedEnvironmentConfig(null);
    }
  };

  /**
   * @function selectEnvironment
   * @description Updates the selected environment state based on the selected client.
   * @param {string} environmentName - The name of the environment to select.
   */
  const selectEnvironment = (environmentName: string): void => {
    if (selectedClientName) {
      setSelectedEnvironmentName(environmentName);
      const envConfig = getEnvironmentConfig(
        selectedClientName,
        environmentName
      );
      setSelectedEnvironmentConfig(envConfig || null);
    }
  };

  /**
   * @constant value
   * @description Memoized context value to prevent unnecessary re-renders.
   */
  const value = useMemo(
    () => ({
      config,
      clients,
      selectedClientName,
      availableEnvironments,
      selectedEnvironmentName,
      selectedEnvironmentConfig,
      error,
      selectClient,
      selectEnvironment,
    }),
    [
      config,
      clients,
      selectedClientName,
      availableEnvironments,
      selectedEnvironmentName,
      selectedEnvironmentConfig,
      error,
    ]
  );

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

/**
 * @function useConfiguration
 * @description Custom hook to easily access the configuration context state.
 * @returns {ConfigurationState} The current configuration state and actions.
 * @throws {Error} If used outside of a ConfigurationProvider.
 */
export const useConfiguration = (): ConfigurationState => {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error(
      "useConfiguration must be used within a ConfigurationProvider"
    );
  }
  return context;
};
