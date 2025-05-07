# Token Creation Process (JWS + JWE)

## 1. Overview

This document details the step-by-step process for generating the secure token used to launch the child application. The process involves creating a JSON Web Signature (JWS) of the payload and then encrypting that JWS into a JSON Web Encryption (JWE) token. This ensures both the integrity and confidentiality of the data passed to the child application.

## 2. Prerequisites

- **Client Configuration:** A valid configuration must exist for the selected client and environment, including:
  - `clientId`: Identifier for the client.
  - `clientSecret`: Shared secret used for signing (HS256).
  - `keys.enc.publicKey`: Public key (SPKI PEM format) for encryption (e.g., RSA-OAEP-256).
  - `signAlgorithm`: Algorithm for JWS (e.g., "HS256").
  - `keyEncryptionAlgorithm`: Algorithm for JWE key encryption (e.g., "RSA-OAEP-256").
  - `contentEncryptionAlgorithm`: Algorithm for JWE content encryption (e.g., "A256GCM").
  - `tokenExpiration`: Duration for token validity (e.g., "15m" or 300 seconds).
  - `childDomain`, `urlConfig`: Details for constructing the final launch URL.
- **Payloads:**
  - `sessionPayload`: JSON object containing session-specific data.
  - `userPayload`: JSON object containing user-specific data.

## 3. Process Steps

The token generation is handled by the `/api/token/generate` API route and the `generateSignedAndEncryptedToken` function in `src/lib/jwe.ts`.

### Step 1: API Request Reception and Validation

- **Action:** The frontend sends a POST request to `/api/token/generate`.
- **Input:** Request body containing `clientName`, `environment`, `sessionPayload`, and `userPayload`.
- **Process:**
  - The API route (`src/app/api/token/generate/route.ts`) receives the request.
  - It parses the JSON request body.
  - It validates that all required fields (`clientName`, `environment`, `sessionPayload`, `userPayload`) are present.
- **Output:** Parsed and validated request data.
- **Error Handling:** Returns HTTP 400 errors for invalid JSON or missing fields.

### Step 2: Configuration Loading

- **Action:** Retrieve the specific configuration for the requested client and environment.
- **Input:** `clientName`, `environment`.
- **Process:**
  - Calls `loadAndValidateConfig()` to ensure configurations are loaded (from environment variables or cache).
  - Calls `getEnvironmentConfig(clientName, environment)` to fetch the specific `EnvironmentConfig` object.
- **Output:** The `environmentConfig` object containing keys, secrets, algorithms, etc.
- **Error Handling:** Returns HTTP 400 error if configuration is not found or invalid.

### Step 3: Payload Combination and JWT Claim Addition

- **Action:** Combine the session and user payloads and add standard JWT claims.
- **Input:** `sessionPayload`, `userPayload`, `environmentConfig`.
- **Process:**
  - Creates a `combinedPayload` object.
  - Spreads the `sessionPayload` into a `session` property.
  - Nests the `userPayload` under properties like `identityKey` and `customer` as defined in `CombinedPayload` type.
  - Calculates `iat` (Issued At) timestamp (current time in seconds).
  - Calculates `exp` (Expiration Time) timestamp based on `iat` and `environmentConfig.tokenExpiration` (defaulting to 5 minutes if not set).
- **Output:** A `combinedPayload` object ready for signing.

### Step 4: Payload Signing (JWS Generation)

- **Action:** Create a JSON Web Signature (JWS) of the combined payload.
- **Input:** `combinedPayload`, `environmentConfig`.
- **Process (within `generateSignedAndEncryptedToken`):**
  - Retrieves the `signAlgorithm` (defaulting to "HS256") from `environmentConfig`.
  - Calls `prepareSigningSecret(config)` to get the `clientSecret` as a `Uint8Array`.
  - Instantiates `jose.SignJWT` with the `combinedPayload`.
  - Sets the protected header:
    - `alg`: The signing algorithm (e.g., "HS256").
    - `apiKey`: Set to `config.clientId`.
  - Sets standard JWT claims using methods like:
    - `setIssuedAt()`
    - `setSubject(config.clientId)`
    - `setIssuer(config.clientId)`
    - `setExpirationTime(config.expiredTime || "15m")`
    - `setNotBefore("0s")`
    - `setJti(crypto.randomUUID())`
  - Calls `.sign(signingSecret)` to generate the compact JWS string.
- **Output:** A JWS string (e.g., `xxxxx.yyyyy.zzzzz`).
- **Error Handling:** Throws an error if `clientSecret` is missing or signing fails. Logs errors via `logError`.

### Step 5: JWS Encryption (JWE Generation)

- **Action:** Encrypt the generated JWS string using JWE.
- **Input:** JWS string, `environmentConfig`.
- **Process (within `generateSignedAndEncryptedToken`):**
  - Retrieves `keyEncryptionAlgorithm` (default "RSA-OAEP-256") and `contentEncryptionAlgorithm` (default "A256GCM") from `config`.
  - Calls `importEncryptionPublicKey(config, keyEncryptionAlgorithm)` to import the `publicKey` from the config into a `KeyLike` object suitable for JOSE.
  - Encodes the JWS string into a `Uint8Array`.
  - Instantiates `jose.CompactEncrypt` with the JWS byte array.
  - Sets the protected header:
    - `alg`: The key encryption algorithm (e.g., "RSA-OAEP-256").
    - `enc`: The content encryption algorithm (e.g., "A256GCM").
    - `apiKey`: Set to `config.clientId`.
    - Optionally `cty: 'JWT'` could be added to indicate the encrypted content is a JWT.
  - Calls `.encrypt(publicKey)` to generate the final compact JWE string.
- **Output:** A JWE string (e.g., `xxxxx.yyyyy.zzzzz.aaaaa.bbbbb`).
- **Error Handling:** Throws an error if the public key is missing/invalid or encryption fails. Logs errors via `logError`.

### Step 6: Launch URL Construction

- **Action:** Build the final URL to launch the child application.
- **Input:** JWE token string, `environmentConfig`.
- **Process (within `constructLaunchUrl`):**
  - Retrieves `childDomain`, `urlConfig.pathPrefix`, `urlConfig.tokenParam`, and `urlConfig.additionalParams` from the `environmentConfig`.
  - Constructs the base URL using `childDomain` and `pathPrefix`.
  - Creates `URLSearchParams` including:
    - The JWE token under the key specified by `tokenParam` (default "ssotoken").
    - Any `additionalParams` defined in the config.
  - Appends the query parameters to the base URL.
- **Output:** The complete launch URL string.
- **Error Handling:** Throws an error if `childDomain` is missing.

### Step 7: API Response

- **Action:** Send the generated token and URL back to the frontend.
- **Input:** JWE token string, launch URL string.
- **Process:**
  - The API route logs success information.
  - It returns an HTTP 200 response with a JSON body:
    ```json
    {
      "status": "success",
      "token": "JWE_TOKEN_STRING",
      "url": "FULL_LAUNCH_URL"
    }
    ```
- **Error Handling:** If any step from 4-6 failed and threw an error, the API route catches it, logs the error, and returns an HTTP 500 response with an error structure.

## 4. Security Considerations

- **Secret Management:** `clientSecret` and the private key corresponding to `publicKey` must be kept confidential and managed securely (e.g., via environment variables or a secrets manager).
- **Key Rotation:** Implement a strategy for rotating signing secrets and encryption keys periodically.
- **Algorithm Choice:** The chosen algorithms (HS256, RSA-OAEP-256, A256GCM) are industry standards, but ensure they meet the specific security requirements of the integrating systems.
- **Transport Security:** All communication (frontend to API, API to child app) must use HTTPS.
- **Input Validation:** Although basic validation is done, robust validation of payload contents against expected schemas is recommended to prevent unexpected data issues.
- **Expiration Time:** Set a reasonably short `tokenExpiration` to limit the window for replay attacks.
