# Product Requirements Document: SSO Simulation Web Application

## 1. Overview

This document outlines the requirements for a web application designed to simulate Single Sign-On (SSO) login mechanisms. The application will serve as a parent app that can render a child application either within an iframe or launch it in a separate tab. The primary purpose is to test SSO integration between a credit union banking system and a new account opening application.

## 2. Core Functionality

### 2.1 Parent Application

- Built as a Next.js application using TypeScript and Tailwind CSS
- Serves as the host for the child application
- Provides UI for payload configuration and environment selection
- Handles token generation and child app launching
- No database dependency - all configuration and state managed through environment variables and client-side storage
- Simple username/password authentication using environment variables

### 2.2 Payload Management

- Interface to input two separate payloads:
  - Session payload (authentication/session data)
  - User information payload (user details/attributes)
- Functionality to combine these payloads into a single unified payload
- Option to save/load payload templates for testing various scenarios (client-side storage only)
- No persistent storage of payloads in any database
- No history tracking of generated tokens

### 2.3 Token Generation

- Server-side implementation of JWE (JSON Web Encryption) token generation using the JOSE library
- Utilizes configuration-specific API key, secret key, and public key
- Secure handling of cryptographic materials
- Token generation occurs exclusively on the server side (in Next.js API routes)
- Recommended JWE algorithms for financial industry:
  - Key Encryption: RSA-OAEP-256 (RSA with OAEP padding using SHA-256)
  - Content Encryption: A256GCM (AES 256-bit in Galois/Counter Mode)
- Configurable token expiration time (default: 5 minutes)

### 2.4 Child Application Launch

- Two launch modes:
  - Embedded iframe within the parent application
  - New browser tab/window
- Preview URL functionality before launch
- Configurable based on testing requirements
- Appends the generated JWE token to the child application URL
- Standard URL structure: `https://{childDomain}/sso/launch?token={jweToken}&source=parent-app`
- No responsibility for token validation - child app will handle validation errors

## 3. Configuration Management

### 3.1 Multi-Environment Support

- Support for multiple clients and environments:
  - Development (dev)
  - Quality Assurance (qa)
  - Testing (test)
  - Staging (stage)
  - User Acceptance Testing (uat)

### 3.2 Configuration Structure

- JSON configuration structure stored in environment variables:

```json
{
  "clients": [
    {
      "name": "ClientA",
      "environments": [
        {
          "name": "dev",
          "childDomain": "https://dev.childapp-a.com",
          "apiKey": "key_dev_a",
          "apiSecret": "secret_dev_a",
          "publicKey": "public_key_dev_a",
          "keyEncryptionAlgorithm": "RSA-OAEP-256",
          "contentEncryptionAlgorithm": "A256GCM",
          "tokenExpiration": 300,
          "urlConfig": {
            "pathPrefix": "/sso/launch",
            "tokenParam": "token",
            "additionalParams": {
              "source": "parent-app"
            }
          }
        },
        {
          "name": "qa",
          "childDomain": "https://qa.childapp-a.com",
          "apiKey": "key_qa_a",
          "apiSecret": "secret_qa_a",
          "publicKey": "public_key_qa_a"
        }
        // Additional environments...
      ]
    }
    // Additional clients...
  ]
}
```

### 3.3 Environment Selection

- UI dropdown/selector for client selection
- UI dropdown/selector for environment selection
- Dynamic configuration loading based on selections

## 4. Security Requirements

### 4.1 Server-Side Processing

- All sensitive operations (token generation, key handling) must be performed server-side
- No sensitive keys or secrets exposed to the client

### 4.2 Secure Configuration Storage

- All API keys, secrets, and cryptographic materials stored in environment variables
- No hardcoding of sensitive information in the codebase
- No database storage of sensitive information

### 4.3 Input Validation

- Validation of all user inputs before processing
- Sanitization of payload data
- Prevention of common web security vulnerabilities (XSS, CSRF, etc.)

### 4.4 Secure Communication

- HTTPS for all communications
- Proper CORS configuration
- Secure handling of tokens in URLs and redirects

### 4.5 Authentication

- Simple username/password authentication
- Credentials stored in environment variables:

```
AUTH_USERNAME=admin
AUTH_PASSWORD=securepassword123
```

- No user roles or permission levels required
- All authenticated users have full access to the application

## 5. Technical Implementation

### 5.1 Technology Stack

- **Frontend**:

  - Next.js (latest stable version)
  - TypeScript
  - Tailwind CSS for styling
  - React hooks for state management

- **Backend/Server-side**:
  - Next.js API routes
  - JOSE library for JWE token generation
  - Environment-based configuration management

### 5.2 Key Components

- **Configuration Manager**: Handles loading and validation of environment configuration
- **Payload Editor**: UI component for editing session and user information payloads
- **Token Generator**: Server-side implementation of JWE token creation
- **Child App Renderer**: Component for rendering child app in iframe or handling new tab launch

### 5.3 Logging Implementation

Industry-standard structured logging implementation:

```typescript
// logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "sso-simulator" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

// Redact sensitive information
const redactSensitiveInfo = (obj) => {
  // Implementation to redact tokens, keys, etc.
};

export const logInfo = (message, meta = {}) => {
  logger.info(message, redactSensitiveInfo(meta));
};

export const logError = (message, error, meta = {}) => {
  logger.error(message, {
    error: error.toString(),
    stack: error.stack,
    ...redactSensitiveInfo(meta),
  });
};
```

### 5.4 Docker Configuration

#### Dockerfile

```dockerfile
# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies image
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder image
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner image
FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user for security
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: "3.8"

services:
  sso-simulator:
    build:
      context: .
      target: ${NODE_ENV:-production}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - AUTH_USERNAME=${AUTH_USERNAME}
      - AUTH_PASSWORD=${AUTH_PASSWORD}
      - CLIENT_CONFIGURATIONS=${CLIENT_CONFIGURATIONS}
      - DEFAULT_JWE_KEY_ENCRYPTION=${DEFAULT_JWE_KEY_ENCRYPTION}
      - DEFAULT_JWE_CONTENT_ENCRYPTION=${DEFAULT_JWE_CONTENT_ENCRYPTION}
      - DEFAULT_TOKEN_EXPIRATION=${DEFAULT_TOKEN_EXPIRATION}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/api/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

## 6. User Interface Requirements

### 6.1 Layout

- Clean, intuitive interface with clear sections for:
  - Client/environment selection
  - Payload configuration
  - Launch options
  - Token preview
  - Child app display (for iframe mode)

### 6.2 Client/Environment Selection

- Dropdown selectors for client and environment
- Visual indication of currently selected configuration

### 6.3 Payload Editor

- JSON editors for session and user information payloads
- Syntax highlighting and validation
- Option to toggle between raw JSON and structured form inputs
- Template selection for common testing scenarios

### 6.4 Launch Controls

- Toggle for iframe vs. new tab launch mode
- Launch button to initiate the process
- Preview URL button to view the complete URL before launching
- Token decoder to view decoded JWE token contents

## 7. Error Handling

### 7.1 Error Categories

1. **Authentication Errors**

   - Invalid Credentials
   - Session Timeout

2. **Configuration Errors**

   - Invalid Configuration Format
   - Missing Required Configuration
   - Invalid Cryptographic Materials

3. **Payload Errors**

   - Invalid JSON Format
   - Required Fields Missing
   - Field Validation Failures

4. **Token Generation Errors**

   - Encryption Failure
   - Key Incompatibility
   - Payload Size Limit Exceeded

5. **Child Application Launch Errors**
   - URL Generation Error
   - Iframe Rendering Error
   - X-Frame-Options Restriction
   - CORS Error

### 7.2 Error Response Format

```typescript
interface ErrorResponse {
  status: "error";
  code: string; // Machine-readable error code
  message: string; // User-friendly message
  details?: string; // Additional technical details (dev environments only)
  timestamp: string; // ISO timestamp
  requestId: string; // For correlation with logs
}
```

### 7.3 Error Handling Approach

- Clear user-facing error messages
- Detailed logging for troubleshooting
- Visual indication of errors in the UI
- Appropriate HTTP status codes for API errors
- No exposure of sensitive details in production environments

## 8. Payload Structure

### 8.1 Session Payload (Banking Industry Standard)

```json
{
  "sessionId": "unique-session-identifier",
  "issuedAt": "2025-04-17T10:30:45Z",
  "expiresAt": "2025-04-17T11:30:45Z",
  "sourceIp": "192.168.1.1",
  "sourceSystem": "MainBankingPortal",
  "sessionAttributes": {
    "deviceFingerprint": "device-fingerprint-hash",
    "authMethod": "PASSWORD",
    "mfaCompleted": true,
    "authLevel": "FULL_ACCESS"
  }
}
```

### 8.2 User Information Payload (Credit Union Member Data)

```json
{
  "memberId": "123456789",
  "memberSince": "2015-06-12",
  "personalInfo": {
    "firstName": "John",
    "middleName": "David",
    "lastName": "Smith",
    "dateOfBirth": "1980-05-15",
    "taxId": "last-four-only",
    "email": "john.smith@example.com",
    "phoneNumber": "+1234567890"
  },
  "addressInfo": {
    "streetAddress": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "accountInfo": {
    "hasCheckingAccount": true,
    "hasSavingsAccount": true,
    "hasLoanAccount": false,
    "accountsTotals": {
      "checking": "AVAILABLE_ONLY",
      "savings": "AVAILABLE_ONLY"
    }
  }
}
```

## 9. Project Structure

```
/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── AuthGuard.tsx
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   └── Header.tsx
│   ├── payload/
│   │   ├── PayloadEditor.tsx
│   │   ├── SessionPayloadEditor.tsx
│   │   └── UserPayloadEditor.tsx
│   ├── preview/
│   │   ├── TokenPreview.tsx
│   │   └── URLPreview.tsx
│   └── launch/
│       ├── LaunchOptions.tsx
│       ├── IframeRenderer.tsx
│       └── NewTabLauncher.tsx
├── lib/
│   ├── auth.ts
│   ├── config.ts
│   ├── jwe.ts
│   ├── logger.ts
│   └── validators.ts
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.ts
│   │   ├── token/
│   │   │   └── generate.ts
│   │   └── health.ts
│   ├── _app.tsx
│   ├── index.tsx
│   └── login.tsx
├── public/
│   ├── favicon.ico
│   └── logos/
├── styles/
│   └── globals.css
├── types/
│   ├── auth.ts
│   ├── config.ts
│   ├── payload.ts
│   └── token.ts
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── Dockerfile
└── docker-compose.yml
```

## 10. Implementation Guidelines

### 10.1 API Implementation Sample

Token Generation API Route:

```typescript
// pages/api/token/generate.ts
import { NextApiRequest, NextApiResponse } from "next";
import * as jose from "jose";
import { getClientConfig } from "@/lib/config";
import { validatePayload } from "@/lib/validators";
import { logInfo, logError } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { clientName, environment, sessionPayload, userPayload } = req.body;

    // Get client configuration
    const config = getClientConfig(clientName, environment);
    if (!config) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_CONFIGURATION",
        message: "Invalid client or environment configuration",
      });
    }

    // Validate payloads
    const validationError = validatePayload(sessionPayload, userPayload);
    if (validationError) {
      return res.status(400).json({
        status: "error",
        code: "PAYLOAD_VALIDATION_ERROR",
        message: validationError,
      });
    }

    // Combine payloads
    const combinedPayload = {
      ...sessionPayload,
      user: userPayload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (config.tokenExpiration || 300),
    };

    // Generate JWE token
    const publicKey = await jose.importSPKI(
      config.publicKey,
      config.keyEncryptionAlgorithm
    );

    const jwe = await new jose.CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(combinedPayload))
    )
      .setProtectedHeader({
        alg: config.keyEncryptionAlgorithm,
        enc: config.contentEncryptionAlgorithm,
        kid: config.apiKey,
      })
      .encrypt(publicKey);

    // Construct URL
    const baseUrl = config.childDomain;
    const pathPrefix = config.urlConfig?.pathPrefix || "/sso/launch";
    const tokenParam = config.urlConfig?.tokenParam || "token";

    const urlParams = new URLSearchParams({
      [tokenParam]: jwe,
      ...config.urlConfig?.additionalParams,
    });

    const fullUrl = `${baseUrl}${pathPrefix}?${urlParams.toString()}`;

    // Log successful token generation (without sensitive data)
    logInfo("Token generated successfully", {
      client: clientName,
      environment,
      tokenLength: jwe.length,
    });

    return res.status(200).json({
      status: "success",
      token: jwe,
      url: fullUrl,
    });
  } catch (error) {
    logError("Token generation failed", error, {
      path: req.url,
      method: req.method,
    });

    return res.status(500).json({
      status: "error",
      code: "TOKEN_GENERATION_ERROR",
      message: "Failed to generate token",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
```

### 10.2 UI Component Sample

Main application component structure:

```jsx
// components/MainApp.tsx
import React, { useState, useEffect } from "react";
import ClientSelector from "./ClientSelector";
import EnvironmentSelector from "./EnvironmentSelector";
import SessionPayloadEditor from "./SessionPayloadEditor";
import UserPayloadEditor from "./UserPayloadEditor";
import LaunchOptions from "./LaunchOptions";
import TokenPreview from "./TokenPreview";
import IframeRenderer from "./IframeRenderer";

export default function MainApp() {
  const [client, setClient] = useState("");
  const [environment, setEnvironment] = useState("");
  const [sessionPayload, setSessionPayload] = useState("{}");
  const [userPayload, setUserPayload] = useState("{}");
  const [launchMethod, setLaunchMethod] = useState("iframe");
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate token and URL
  const generateToken = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/token/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: client,
          environment,
          sessionPayload: JSON.parse(sessionPayload),
          userPayload: JSON.parse(userPayload),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate token");
      }

      setToken(data.token);
      setUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Launch child application
  const launchChildApp = () => {
    if (launchMethod === "iframe") {
      // Iframe rendering is handled by the IframeRenderer component
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SSO Simulation Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex space-x-4">
            <ClientSelector value={client} onChange={setClient} />
            <EnvironmentSelector
              clientName={client}
              value={environment}
              onChange={setEnvironment}
            />
          </div>

          <SessionPayloadEditor
            value={sessionPayload}
            onChange={setSessionPayload}
          />

          <UserPayloadEditor value={userPayload} onChange={setUserPayload} />

          <LaunchOptions
            value={launchMethod}
            onChange={setLaunchMethod}
            onPreview={generateToken}
            onLaunch={() => {
              generateToken().then(() => launchChildApp());
            }}
            isLoading={loading}
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <TokenPreview token={token} url={url} />

          {launchMethod === "iframe" && url && <IframeRenderer url={url} />}
        </div>
      </div>
    </div>
  );
}
```

## 11. Summary of Key Requirements

1. **No Database**: All configuration stored in environment variables
2. **Security**: Server-side token generation, secure key handling
3. **Flexibility**: Support for multiple clients and environments
4. **Preview Functionality**: URL and token preview before launch
5. **Launch Options**: iframe or new tab rendering of child app
6. **Industry Standards**: Financial-grade encryption and payload structure
7. **Error Handling**: Comprehensive error handling and logging
8. **Docker Support**: Production-ready Docker and Docker Compose configuration
9. **Simple Authentication**: Basic username/password auth from environment variables
10. **Standard Technology Stack**: Next.js, TypeScript, Tailwind CSS
