"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react"; // Monaco type import removed as it was unused
import { editor } from "monaco-editor"; // Import editor type for markers
import { PayloadEditorProps } from "@/types/payload";
import { logError, logInfo } from "@/lib/logger";

/**
 * @summary Component for editing the user information payload.
 * @description Provides a Monaco editor interface for users to input and modify the user information payload.
 * It utilizes the '@monaco-editor/react' library for a rich JSON editing experience,
 * including syntax highlighting, validation, and auto-completion.
 * The component manages the state of the user payload internally and calls the provided onChange handler when the payload is updated.
 * @param {PayloadEditorProps} props - The properties for the UserPayloadEditor component.
 * @param {string} props.value - The initial JSON string value for the user payload.
 * @param {string} props.title - The initial title for the payload editor.
 * @param {(value: string) => void} props.onChange - Callback function invoked when the user payload changes.
 * @returns {React.ReactElement} The rendered UserPayloadEditor component.
 * @example
 * const [userPayload, setUserPayload] = useState('{}');
 * <UserPayloadEditor value={userPayload} onChange={setUserPayload} />
 */
const UserPayloadEditor: React.FC<PayloadEditorProps> = ({
  value,
  onChange,
  title,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [editorTheme, setEditorTheme] = useState("vs-light"); // Default to light theme

  // Effect to update editor theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setEditorTheme(mediaQuery.matches ? "vs-dark" : "vs-light");
    };
    handleChange(); // Set initial theme
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Sync external value into editor without losing cursor or undo stack
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && currentValue !== editor.getValue()) {
      const model = editor.getModel();
      const position = editor.getPosition();
      if (!model) return;
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: currentValue as string }],
        () => null
      );
      if (position) editor.setPosition(position);
    }
  }, [currentValue]);

  // Effect to sync internal state if the prop value changes from outside
  // useEffect(() => {
  //   if (value !== currentValue) {
  //     setCurrentValue(value);
  //     try {
  //       JSON.parse(value);
  //       setIsValid(true);
  //     } catch {
  //       // Error parsing, set as invalid
  //       setIsValid(false);
  //     }
  //   }
  // }, [value, currentValue]); // Added currentValue to dependency array

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  /**
   * Handles changes from the Monaco editor.
   * @param {string | undefined} newValue - The new value from the editor.
   */
  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      const val = newValue || "";
      setCurrentValue(val);
      try {
        const parsedValue: object = JSON.parse(val);
        setIsValid(true);
        logInfo("User Payload Editor", { userPayload: parsedValue });
        onChange(parsedValue);
      } catch (error) {
        logError("User Payload Editor", {
          error: "Invalid JSON format",
          details: error,
          userPayload: val,
        });
        // Error parsing, set as invalid
        setIsValid(false);
        // Still call onChange with the potentially invalid JSON
        // so the parent component is aware and can decide how to handle it.
        // onChange(val);
      }
    },
    [onChange] // onChange is a dependency
  );

  /**
   * Handles editor validation events.
   * @param {editor.IMarker[]} markers - An array of validation markers from the editor.
   */
  const handleEditorValidation = useCallback((markers: editor.IMarker[]) => {
    setIsValid(markers.length === 0);
  }, []);

  logInfo("User Payload Editor", {
    // userPayload: currentValue,
    userPayLoadType: typeof currentValue,
    isValid,
    editorTheme,
  });

  return (
    <div className="space-y-2">
      <label
        htmlFor="user-payload-editor" // Although Monaco doesn't use a native input, this is good for semantics
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {title || "Payload (JSON)"} {/* Added title prop */}
      </label>
      <div
        id="user-payload-editor-container" // Changed ID to avoid conflict if Monaco creates its own with the same ID
        className={`rounded-md border overflow-hidden ${
          isValid ? "border-gray-300 dark:border-gray-600" : "border-red-500"
        }`}
      >
        <Editor
          height="500px"
          language="json"
          theme={editorTheme}
          defaultValue={JSON.stringify(currentValue, null, 2)}
          onChange={handleEditorChange}
          onValidate={handleEditorValidation}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "monospace",
            automaticLayout: true, // Ensures editor resizes correctly
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: "on", // Enable word wrapping
            tabSize: 2, // Set tab size to 2 spaces
            insertSpaces: true, // Ensure tabs are spaces
          }}
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
