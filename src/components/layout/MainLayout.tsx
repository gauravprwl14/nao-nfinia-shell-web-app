import React from "react";
import Header from "./Header";

/**
 * @interface MainLayoutProps
 * @description Defines the props for the MainLayout component.
 * @property {React.ReactNode} children - The content to be rendered within the layout.
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * @component MainLayout
 * @description Provides the main application layout structure for authenticated pages.
 * @description Includes the application header and renders the main content area.
 * @param {MainLayoutProps} props - The props for the component.
 * @param {React.ReactNode} props.children - The child elements to render within the main content area.
 * @returns {React.ReactElement} The rendered main layout structure.
 * @example
 * <MainLayout>
 *   <p>Page content goes here</p>
 * </MainLayout>
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}): React.ReactElement => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">{children}</main>
      {/* Optional: Add a Footer component here */}
    </div>
  );
};

export default MainLayout;
