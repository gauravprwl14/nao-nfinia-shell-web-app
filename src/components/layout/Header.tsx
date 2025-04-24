/**
 * @fileoverview Header component for the application layout.
 * @version 1.1.0
 * @since 2025-04-22
 * @updated 2025-04-23 - Added ClientSelector and EnvironmentSelector.
 */
import React from "react";
import ClientSelector from "@/components/config/ClientSelector";
import EnvironmentSelector from "@/components/config/EnvironmentSelector";

/**
 * @component Header
 * @description Renders the header component for the application layout.
 * @description Displays the application title and includes selectors for client and environment configuration.
 * @returns {React.ReactElement} The rendered header element.
 * @example
 * <Header />
 */
const Header: React.FC = (): React.ReactElement => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-xl font-semibold">SSO Simulation Tool</h1>
        {/* Navigation or other header elements can be added here */}
      </div>
    </header>
  );
};

export default Header;
