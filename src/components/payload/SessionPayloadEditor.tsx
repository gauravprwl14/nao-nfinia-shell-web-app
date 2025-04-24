"use client";

import React, { useState, useEffect } from "react";
import { isValidJson } from "@/lib/validators";
import { SessionPayload } from "@/types/payload"; // Import type for default

// Default template based on PRD section 8.1
// const defaultSessionPayload: SessionPayload = {
//   sessionId: "59df3825-9f61-448f-9afa-4e79c03de3ed",
//   issuedAt: new Date().toISOString(), // Use current time as default
//   expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Default 5 mins expiry
//   sourceIp: "192.168.1.1", // Example IP
//   sourceSystem: "MainBankingPortal",
//   sessionAttributes: {
//     deviceFingerprint: "device-fingerprint-hash",
//     authMethod: "PASSWORD",
//     mfaCompleted: true,
//     authLevel: "FULL_ACCESS",
//   },
// };

/**
 * @function generateDefaultSessionPayload
 * @description Generates the default session payload object with dynamic values.
 * @description Creates a UUID v4 for the session ID, sets issued and expiry timestamps,
 *              and includes predefined keep-alive and callback URLs, nested under a 'session' key.
 * @returns {object} The default session payload object structured as { session: { ... } }.
 */
const generateDefaultSessionPayload = (): SessionPayload => {
  const now = new Date();
  const expires = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry

  return {
    id: crypto.randomUUID(), // Generate UUID v4
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    keepAliveUrl: "https://www.digital-channel.com/keep-alive", // Example URL
    callbackUrl: "https://www.digital-channel.com/callback", // Example URL
  };
};

// Default template based on the requested structure
const defaultSessionPayload = generateDefaultSessionPayload();
/**
 * @interface SessionPayloadEditorProps
 * @description Props for the SessionPayloadEditor component.
 * @property {(payload: string) => void} onChange - Callback function triggered when the payload string changes.
 * @property {string} [initialValue] - Optional initial value for the payload editor. Defaults to a template.
 */
interface SessionPayloadEditorProps {
  onChange: (payload: string) => void;
  initialValue?: string;
}

/**
 * @component SessionPayloadEditor
 * @description Renders a textarea for editing the session payload JSON.
 * @description Provides basic validation feedback for JSON validity. Includes a default template.
 * @param {SessionPayloadEditorProps} props - Component props.
 * @returns {React.ReactElement} The session payload editor component.
 * @example
 * <SessionPayloadEditor onChange={handleSessionChange} />
 */
const SessionPayloadEditor: React.FC<SessionPayloadEditorProps> = ({
  onChange,
  initialValue = JSON.stringify(defaultSessionPayload, null, 2), // Use default template
}): React.ReactElement => {
  // --- State ---
  const [payload, setPayload] = useState<string>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(true);

  // --- Effects ---
  /**
   * @effect Validate payload whenever it changes.
   */
  useEffect(() => {
    setIsValid(isValidJson(payload));
    onChange(payload); // Notify parent component of the change
  }, [payload, onChange]);

  /**
   * @effect Update internal state if initialValue prop changes.
   */
  useEffect(() => {
    setPayload(initialValue);
  }, [initialValue]);

  // --- Event Handlers ---
  /**
   * @function handleChange
   * @description Updates the payload state when the textarea value changes.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} event - The textarea change event.
   * @returns {void}
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setPayload(event.target.value);
  };

  // --- Render Logic ---
  return (
    <div className="space-y-2">
      <label
        htmlFor="session-payload-editor"
        className="block text-sm font-medium text-gray-700"
      >
        Session Payload (JSON)
      </label>
      <textarea
        id="session-payload-editor"
        name="sessionPayload"
        rows={10}
        value={payload}
        onChange={handleChange}
        className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md font-mono
                    ${
                      isValid
                        ? "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        : "border-red-500 focus:ring-red-500 focus:border-red-500"
                    }
                  `}
        placeholder="Enter session payload as JSON..."
        aria-invalid={!isValid}
        aria-describedby={!isValid ? "session-payload-error" : undefined}
      />
      {!isValid && (
        <p id="session-payload-error" className="mt-1 text-xs text-red-600">
          Invalid JSON format.
        </p>
      )}
      {/* Add buttons for Load/Save Template later */}
    </div>
  );
};

export default SessionPayloadEditor;
