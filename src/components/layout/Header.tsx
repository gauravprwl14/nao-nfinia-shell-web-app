import React from "react";

/**
 * @component Header
 * @description Renders the header component for the application layout.
 * @description Displays the application title and potentially navigation or user status.
 * @returns {React.ReactElement} The rendered header element.
 * @example
 * <Header />
 */
const Header: React.FC = (): React.ReactElement => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-xl font-semibold">SSO Simulation Tool</h1>
        {/* Future additions: User status, logout button, etc. */}
      </div>
    </header>
  );
};

export default Header;
