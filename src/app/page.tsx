"use client"; // Required for AuthGuard which uses hooks like useRouter and useEffect

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";

/**
 * @page HomePage
 * @description The main landing page of the SSO Simulation Tool after successful login.
 * @description This page is protected by the AuthGuard and uses the MainLayout.
 * @description It currently displays a placeholder message.
 * @returns {React.ReactElement} The rendered home page element.
 */
export default function HomePage(): React.ReactElement {
  return (
    <AuthGuard>
      <MainLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to the SSO Simulator
          </h1>
          <p className="text-lg text-gray-700">
            You are logged in. Use the upcoming controls to configure and launch
            the child application.
          </p>
          {/* Placeholder for future components like Client/Environment Selectors, Payload Editors, etc. */}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}
