"use client";

import React, { useState } from "react";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { PayloadEditorProps } from "@/types/payload";

/**
 * @summary Component for editing the user information payload.
 * @description Provides a JSON editor interface for users to input and modify the user information payload.
 * It utilizes the 'react-json-editor-ajrm' library for JSON editing capabilities, including syntax highlighting and validation.
 * The component manages the state of the user payload internally and calls the provided onChange handler when the payload is updated.
 * @param {PayloadEditorProps} props - The properties for the UserPayloadEditor component.
 * @param {string} props.value - The initial JSON string value for the user payload.
 * @param {(value: string) => void} props.onChange - Callback function invoked when the user payload changes.
 * @returns {React.ReactElement} The rendered UserPayloadEditor component.
 * @example
 * const [userPayload, setUserPayload] = useState('{}');
 * <UserPayloadEditor value={userPayload} onChange={setUserPayload} />
 */
const UserPayloadEditor: React.FC<PayloadEditorProps> = ({
  value,
  onChange,
}) => {
  const [isValid, setIsValid] = useState(true);

  /**
   * Handles changes from the JSON editor.
   * @param {object} data - The data object from the JSON editor.
   * @param {string} data.jsObject - The JavaScript object representation of the JSON.
   * @param {string} data.json - The JSON string representation.
   * @param {boolean} data.error - Indicates if there is a parsing error.
   */
  const handleEditorChange = (data: {
    jsObject?: object;
    json?: string;
    error?: boolean;
  }) => {
    setIsValid(!data.error);
    if (!data.error && data.json) {
      onChange(data.json);
    } else if (data.json === "") {
      // Allow clearing the editor
      onChange("");
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="user-payload-editor"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        User Information Payload
      </label>
      <div
        id="user-payload-editor"
        className={`rounded-md border ${
          isValid ? "border-gray-300 dark:border-gray-600" : "border-red-500"
        }`}
      >
        <JSONInput
          placeholder={JSON.parse(value || "{}")} // Initial value
          onChange={handleEditorChange}
          locale={locale}
          colors={{
            default: "var(--foreground)",
            background: "var(--background)",
            background_warning: "var(--background)", // Use standard background for warnings
            string: "#DAA520", // DarkGoldenrod
            number: "#1E90FF", // DodgerBlue
            colon: "var(--foreground)",
            keys: "#BA55D3", // MediumOrchid
            keys_whiteSpace: "#8F8F8F",
            primitive: "#4CAF50", // Green
            error: "#F44336", // Red
          }}
          style={{
            outerBox: {
              border: "none",
              borderRadius: "0.375rem", // Corresponds to rounded-md
              backgroundColor: "var(--background)",
            },
            container: {
              backgroundColor: "var(--background)",
              fontSize: "14px",
              fontFamily: "monospace",
            },
            warningBox: {
              backgroundColor: "var(--background)",
            },
            errorMessage: {
              color: "#F44336", // Red
              fontSize: "12px",
              marginTop: "4px",
            },
          }}
          height="200px"
          width="100%"
          waitAfterKeyPress={1000} // Delay validation slightly
        />
      </div>
      {!isValid && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Invalid JSON format.
        </p>
      )}
      {/* TODO: Add template loading/saving functionality */}
      {/* TODO: Add toggle between raw JSON and structured form */}
    </div>
  );
};

export default UserPayloadEditor;
