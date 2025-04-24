import React, { useState, useEffect } from "react";
import ClientSelector from "@/components/config/ClientSelector";
import EnvironmentSelector from "@/components/config/EnvironmentSelector";
import SessionPayloadEditor from "@/components/payload/SessionPayloadEditor";
import UserPayloadEditor from "@/components/payload/UserPayloadEditor";
import LaunchOptions from "@/components/launch/LaunchOptions";
import TokenPreview from "@/components/preview/TokenPreview";
import IframeRenderer from "@/components/launch/IframeRenderer";
import { useConfiguration } from "@/context/ConfigurationContext";
import { logInfo, logError } from "@/lib/logger"; // Assuming logger exists as per PRD
import { defaultUserPayload, defaultSessionPayload } from "@/utils/payload"; // Assuming this is where default payloads are stored

export function MainApp() {
  const {
    // clients,
    selectClient,
    selectedClient,
    selectedClientName, // Needed to determine if environments should be shown
    selectEnvironment,
    selectedEnvironmentName,
    selectedEnvironmentConfig,
    availableEnvironments,
    // error,
  } = useConfiguration();
  const [sessionPayload, setSessionPayload] = useState(defaultSessionPayload);
  const [userPayload, setUserPayload] = useState(defaultUserPayload);
  const [launchMethod, setLaunchMethod] = useState("iframe"); // 'iframe' or 'newTab'
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUrlGenerated, setIsUrlGenerated] = useState(false);

  logInfo("selectedClient: inside the MainApp", {
    selectClient,
    selectedClientName,
    // availableEnvironments,
    selectedEnvironmentName,
  });

  // Reset token/URL when config changes
  useEffect(() => {
    setToken("");
    setUrl("");
    setError("");
    setIsUrlGenerated(false);
  }, [selectedClient, selectedEnvironmentConfig]);

  // Validate JSON payloads before attempting generation
  const validatePayloads = (): boolean => {
    try {
      JSON.parse(sessionPayload);
      JSON.parse(userPayload);
      setError(""); // Clear previous errors if valid
      return true;
    } catch (e) {
      setError(`Invalid JSON in payload: ${e.message}`);
      logError("Payload validation failed", e, { component: "MainApp" });
      return false;
    }
  };

  // Generate token and URL
  const generateTokenAndUrl = async () => {
    if (!selectedClient || !selectedEnvironmentConfig) {
      setError("Please select a client and environment.");
      return;
    }
    if (!validatePayloads()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setToken("");
      setUrl("");
      setIsUrlGenerated(false);

      const response = await fetch("/api/token/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: selectedClient?.name,
          environment: selectedEnvironmentConfig?.name,
          sessionPayload: JSON.parse(sessionPayload),
          userPayload: JSON.parse(userPayload),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to generate token (HTTP ${response.status})`
        );
      }

      if (data.status === "success") {
        setToken(data.token);
        setUrl(data.url);
        setIsUrlGenerated(true);
        logInfo("Token generated successfully", {
          client: selectedClient?.name,
          environment: selectedEnvironmentConfig?.name,
        });
      } else {
        throw new Error(data.message || "API returned an error status.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logError("Token generation failed", err, { component: "MainApp" });
      setToken("");
      setUrl("");
      setIsUrlGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  // Launch child application
  const launchChildApp = () => {
    if (!url) {
      setError("Please generate the URL first by clicking 'Preview URL'.");
      return;
    }
    if (launchMethod === "iframe") {
      // Iframe rendering is handled by the IframeRenderer component below
      // No specific action needed here, just ensure URL is set
      logInfo("Launching in iframe", { url });
    } else {
      logInfo("Launching in new tab", { url });
      window.open(url, "_blank");
    }
  };

  const handleLaunch = async () => {
    if (!isUrlGenerated) {
      // If URL wasn't generated via preview, generate it first
      await generateTokenAndUrl();
      // Check if generation was successful before launching
      if (url && !error) {
        launchChildApp();
      }
    } else {
      // URL already generated, just launch
      launchChildApp();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SSO Simulation Tool</h1>

      {/* Configuration and Payload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <ClientSelector
              selectedClientName={selectedClient?.name || ""}
              selectClient={(clientName) => {
                // Find client object and set it
                // This assumes ConfigurationContext provides a way to get clients
                // For now, just setting the name for context update
                logInfo("Client selectedClient", { selectedClient });
                logInfo("Client selected", { clientName });
                selectClient(clientName);
              }}
            />
            <EnvironmentSelector
              selectedClientName={selectedClient?.name}
              selectedEnvironmentName={selectedEnvironmentConfig?.name || ""}
              onChange={(envName) => {
                // Find env object and set it
                logInfo("Environment selected", { envName });
                selectEnvironment(envName);
              }}
              selectEnvironment={selectedEnvironmentConfig}
              availableEnvironments={availableEnvironments}
            />
          </div>

          <SessionPayloadEditor
            value={sessionPayload}
            onChange={setSessionPayload}
          />

          <UserPayloadEditor value={userPayload} onChange={setUserPayload} />
        </div>

        {/* Launch and Preview Section */}
        <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Launch & Preview</h2>
          <LaunchOptions
            value={launchMethod}
            onChange={setLaunchMethod}
            onPreview={generateTokenAndUrl}
            onLaunch={handleLaunch}
            isLoading={loading}
            isUrlGenerated={isUrlGenerated}
            canLaunch={!!selectedClient && !!selectedEnvironmentConfig}
          />

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <TokenPreview token={token} url={url} />
        </div>
      </div>

      {/* Iframe Renderer Section */}
      {launchMethod === "iframe" && url && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Child Application (iframe)
          </h2>
          <IframeRenderer url={url} />
        </div>
      )}
    </div>
  );
}

// import React from "react";
import Header from "./Header";

/**
 * Props for the MainLayout component.
 * @property {React.ReactNode} children - The content to be rendered within the main layout area.
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout structure for the application.
 * @description Provides a consistent layout structure including a header and the main content area.
 * @param {MainLayoutProps} props - The props for the component.
 * @param {React.ReactNode} props.children - Child elements to render inside the main content area.
 * @returns {JSX.Element} The main layout component.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {children}
        <MainApp></MainApp>
      </main>
      {/* Footer could be added here */}
    </div>
  );
};

export default MainLayout;
