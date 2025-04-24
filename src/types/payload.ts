/**
 * @fileoverview Defines TypeScript types for session and user information payloads.
 * @description These types correspond to the expected payload structures defined in the PRD (section 8).
 * @version 1.0.0
 * @since 2025-04-23
 */

/**
 * @interface SessionPayloadAttributes
 * @description Defines attributes within the session payload.
 * @property {string} [deviceFingerprint] - A unique identifier for the user's device.
 * @property {string} [authMethod] - The authentication method used (e.g., "PASSWORD", "MFA").
 * @property {boolean} [mfaCompleted] - Flag indicating if Multi-Factor Authentication was completed.
 * @property {string} [authLevel] - The level of authentication achieved (e.g., "FULL_ACCESS").
 */
export interface SessionPayloadAttributes {
  deviceFingerprint?: string;
  authMethod?: string;
  mfaCompleted?: boolean;
  authLevel?: string;
}

/**
 * @interface SessionPayload
 * @description Defines the structure for the session payload (banking industry standard).
 * @property {string} sessionId - A unique identifier for the user's session.
 * @property {string} issuedAt - ISO 8601 timestamp when the session was issued.
 * @property {string} expiresAt - ISO 8601 timestamp when the session expires.
 * @property {string} [sourceIp] - The IP address from which the session originated.
 * @property {string} [sourceSystem] - The system that initiated the session (e.g., "MainBankingPortal").
 * @property {SessionPayloadAttributes} [sessionAttributes] - Additional attributes related to the session context.
 */
export interface SessionPayload {
  id: string;
  issuedAt: string; // ISO 8601 format (e.g., "2025-04-17T10:30:45Z")
  expiresAt: string; // ISO 8601 format
  keepAliveUrl?: string;
  callbackUrl?: string;
}

/**
 * @interface UserPersonalInfo
 * @description Defines the personal information structure within the user payload.
 * @property {string} firstName - User's first name.
 * @property {string} [middleName] - User's middle name (optional).
 * @property {string} lastName - User's last name.
 * @property {string} [dateOfBirth] - User's date of birth (e.g., "1980-05-15").
 * @property {string} [taxId] - User's tax identifier (e.g., SSN, potentially masked like "last-four-only").
 * @property {string} [email] - User's email address.
 * @property {string} [phoneNumber] - User's phone number.
 */
export interface UserPersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  taxId?: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * @interface UserAddressInfo
 * @description Defines the address structure within the user payload.
 * @property {string} [streetAddress] - Street address line.
 * @property {string} [city] - City name.
 * @property {string} [state] - State or province code.
 * @property {string} [zipCode] - Postal code.
 * @property {string} [country] - Country code (e.g., "US").
 */
export interface UserAddressInfo {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * @interface UserAccountTotals
 * @description Defines the structure for account total indicators.
 * @property {string} [checking] - Indicator for checking account details (e.g., "AVAILABLE_ONLY").
 * @property {string} [savings] - Indicator for savings account details.
 */
export interface UserAccountTotals {
  checking?: string;
  savings?: string;
}

/**
 * @interface UserAccountInfo
 * @description Defines the account information structure within the user payload.
 * @property {boolean} [hasCheckingAccount] - Flag indicating if the user has a checking account.
 * @property {boolean} [hasSavingsAccount] - Flag indicating if the user has a savings account.
 * @property {boolean} [hasLoanAccount] - Flag indicating if the user has a loan account.
 * @property {UserAccountTotals} [accountsTotals] - Indicators for the level of detail provided for account totals.
 */
export interface UserAccountInfo {
  hasCheckingAccount?: boolean;
  hasSavingsAccount?: boolean;
  hasLoanAccount?: boolean;
  accountsTotals?: UserAccountTotals;
}

/**
 * @interface UserPayload
 * @description Defines the structure for the user information payload (credit union member data).
 * @property {string} memberId - The unique identifier for the credit union member.
 * @property {string} [memberSince] - Date when the user became a member (e.g., "2015-06-12").
 * @property {UserPersonalInfo} [personalInfo] - User's personal details.
 * @property {UserAddressInfo} [addressInfo] - User's address details.
 * @property {UserAccountInfo} [accountInfo] - User's account summary.
 */
export interface UserPayload {
  memberId: string;
  memberSince?: string;
  personalInfo?: UserPersonalInfo;
  addressInfo?: UserAddressInfo;
  accountInfo?: UserAccountInfo;
}

/**
 * @interface CombinedPayload
 * @description Represents the structure when session and user payloads are combined before encryption.
 * @description Includes standard JWT claims like `iat` (issued at) and `exp` (expiration time).
 * @property {string} sessionId - Inherited from SessionPayload.
 * @property {string} issuedAt - Inherited from SessionPayload (session issuance).
 * @property {string} expiresAt - Inherited from SessionPayload (session expiration).
 * @property {string} [sourceIp] - Inherited from SessionPayload.
 * @property {string} [sourceSystem] - Inherited from SessionPayload.
 * @property {SessionPayloadAttributes} [sessionAttributes] - Inherited from SessionPayload.
 * @property {UserPayload} user - The nested user information payload.
 * @property {number} iat - JWT Issued At timestamp (seconds since epoch).
 * @property {number} exp - JWT Expiration Time timestamp (seconds since epoch).
 */
export interface CombinedPayload extends Omit<SessionPayload, "sessionId"> {
  // Omit sessionId if it's nested under user or redundant
  sessionId: string; // Keep sessionId if it's top-level in combined
  user: UserPayload;
  iat: number; // JWT Issued At (seconds since epoch)
  exp: number; // JWT Expiration Time (seconds since epoch)
}
