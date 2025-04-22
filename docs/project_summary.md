# Project Summary: SSO Simulator

## Overview

This project implements a web application to simulate Single Sign-On (SSO) workflows, specifically for testing integration between a banking system and a new account opening application. It acts as a parent application that can launch a configured child application in an iframe or new tab, passing a JWE token.

## Core Technologies

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Tokenization:** JOSE library for JWE
- **Configuration:** Environment variables
- **Containerization:** Docker, Docker Compose

## Key Features (Based on PRD)

- Parent application UI for configuration and launch.
- Dynamic client/environment selection.
- JWE token generation via API route.
- Configurable payload editing (session & user info).
- Launch child app in iframe or new tab.
- Basic username/password authentication (via environment variables).
- No database dependency.

## Development Environment & Tooling

- **VS Code:** Configured for TypeScript, ESLint, Prettier.
- **MCP Servers:**
  - `taskmaster-ai`: Configured in VS Code `settings.json` to run via `npx`. Provides potential AI capabilities within the IDE, using configured API keys (Anthropic, Perplexity). It is _not_ directly integrated into the Next.js application code but is available to VS Code features.

## Current Status

- Initial project structure set up.
- PRD defined.
- VS Code configured with relevant settings, including the `taskmaster-ai` MCP server.

## Next Steps

- Implement core UI components (selectors, editors, launch controls).
- Implement API routes for authentication and token generation.
- Implement configuration loading and validation logic.
- Implement JWE generation logic using the JOSE library.
- Refine Docker configuration.
- Add comprehensive tests.
