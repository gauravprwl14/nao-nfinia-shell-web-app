/**
 * @fileoverview Defines TypeScript types for session and customer information payloads.
 * @description These types correspond to the expected payload structures, including the combined structure used for JWE generation.
 * @version 1.1.0
 * @since 2025-04-23
 * @updated 2025-04-25 - Updated interfaces to match the detailed combined payload structure provided.
 */

// --- Session Payload ---

/**
 * @interface SessionPayload
 * @summary Defines the structure for the session information.
 * @description Contains details about the user's session, including identifiers, timestamps, and relevant URLs.
 * @property {string} id - A unique identifier for the user's session.
 * @property {string} issuedAt - ISO 8601 timestamp indicating when the session was initiated. Example: '2025-04-08T10:34:54.960Z'.
 * @property {string} expiresAt - ISO 8601 timestamp indicating when the session will expire. Example: '2025-04-08T11:04:54.960Z'.
 * @property {string} [keepAliveUrl] - Optional URL for session keep-alive requests.
 * @property {string} [callbackUrl] - Optional URL for callback operations after session events.
 */
export interface SessionPayload {
  id: string;
  issuedAt: string;
  expiresAt: string;
  keepAliveUrl?: string;
  callbackUrl?: string;
}

// --- Customer Payload (Detailed Structure) ---

/**
 * @interface CustomerName
 * @summary Defines the structure for a customer's name components.
 * @description Includes first name, last name, and optional middle name and suffix.
 * @property {string} first - The customer's first name.
 * @property {string} [middle] - The customer's middle name (optional).
 * @property {string} last - The customer's last name.
 * @property {string} [suffix] - The customer's name suffix (e.g., Jr., Sr.) (optional).
 */
export interface CustomerName {
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
}

/**
 * @interface EmailTyfoneExtension
 * @summary Defines Tyfone-specific extensions for an email address.
 * @description Includes type, primary status, and core system identifier for the email.
 * @property {string} type - The type or label of the email address (e.g., 'Email1', 'Personal').
 * @property {boolean} isPrimary - Flag indicating if this is the primary email address.
 * @property {string} coreEmailId - Identifier linking the email to the core banking system.
 */
export interface EmailTyfoneExtension {
  type: string;
  isPrimary: boolean;
  coreEmailId: string;
}

/**
 * @interface CustomerEmail
 * @summary Defines the structure for a customer's email address entry.
 * @description Contains the email address string and associated Tyfone extensions.
 * @property {string} email - The customer's email address.
 * @property {EmailTyfoneExtension} tyfoneExtension - Tyfone-specific metadata for the email.
 */
export interface CustomerEmail {
  email: string;
  tyfoneExtension: EmailTyfoneExtension;
}

/**
 * @interface AddressTyfoneExtension
 * @summary Defines Tyfone-specific extensions for a physical address.
 * @description Includes primary status and core system identifier for the address.
 * @property {boolean} isPrimary - Flag indicating if this is the primary address.
 * @property {string} coreAddressId - Identifier linking the address to the core banking system.
 */
export interface AddressTyfoneExtension {
  isPrimary: boolean;
  coreAddressId: string;
}

/**
 * @interface CustomerAddress
 * @summary Defines the structure for a customer's physical address entry.
 * @description Contains standard address components (lines, city, state, etc.) and Tyfone extensions.
 * @property {string} line1 - The first line of the street address.
 * @property {string} [line2] - The second line of the street address (optional).
 * @property {string} city - The city name.
 * @property {string} state - The state or province code (e.g., 'CA').
 * @property {string} postalCode - The postal or ZIP code.
 * @property {string} country - The country code (e.g., 'US').
 * @property {string} type - The type of address (e.g., 'Mailing', 'Physical').
 * @property {AddressTyfoneExtension} tyfoneExtension - Tyfone-specific metadata for the address.
 */
export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: string;
  tyfoneExtension: AddressTyfoneExtension;
}

/**
 * @interface TelephoneTyfoneExtension
 * @summary Defines Tyfone-specific extensions for a telephone number.
 * @description Includes primary status and core system identifier for the telephone number.
 * @property {boolean} isPrimary - Flag indicating if this is the primary telephone number.
 * @property {string} coreTelephoneId - Identifier linking the telephone number to the core banking system.
 */
export interface TelephoneTyfoneExtension {
  isPrimary: boolean;
  coreTelephoneId: string;
}

/**
 * @interface CustomerTelephone
 * @summary Defines the structure for a customer's telephone number entry.
 * @description Contains the type, country code, number, and Tyfone extensions.
 * @property {string} type - The type of telephone number (e.g., 'Business', 'Cellular', 'Home').
 * @property {string} country - The country code (e.g., '+1').
 * @property {string} number - The telephone number string.
 * @property {TelephoneTyfoneExtension} tyfoneExtension - Tyfone-specific metadata for the telephone number.
 */
export interface CustomerTelephone {
  type: string;
  country: string;
  number: string;
  tyfoneExtension: TelephoneTyfoneExtension;
}

/**
 * @interface CustomerEligibility
 * @summary Defines the structure for customer eligibility details within Tyfone extensions.
 * @description Specifies the type of eligibility and associated employer if applicable.
 * @property {string} type - The eligibility type (e.g., 'CORPORATE_PARTNER').
 * @property {string} employer - The name of the employer related to eligibility.
 */
export interface CustomerEligibility {
  type: string;
  employer: string;
}

/**
 * @interface CustomerEmployment
 * @summary Defines the structure for customer employment details within Tyfone extensions.
 * @description Contains the name of the employer.
 * @property {string} employerName - The name of the customer's employer.
 */
export interface CustomerEmployment {
  employerName: string;
}

/**
 * @interface CustomerKycDocument
 * @summary Defines the structure for Know Your Customer (KYC) document details within Tyfone extensions.
 * @description Specifies the document type and an external verification identifier.
 * @property {string} documentType - The type of KYC document (e.g., 'DRIVER_LICENSE').
 * @property {string} externalVerificationId - An external identifier associated with the document verification.
 */
export interface CustomerKycDocument {
  documentType: string;
  externalVerificationId: string;
}

/**
 * @interface CustomerTyfoneExtension
 * @summary Defines the main Tyfone-specific extension block for a customer.
 * @description Contains various Tyfone-related identifiers, statuses, and detailed information arrays.
 * @property {string} nfiniaId - Tyfone's Nfinia platform identifier for the customer.
 * @property {string} ownership - The customer's ownership type (e.g., 'Primary').
 * @property {CustomerEligibility} eligibility - Details about the customer's eligibility.
 * @property {CustomerEmployment[]} employment - An array of employment details.
 * @property {string} secretIdentifier - A secret identifier or security question answer.
 * @property {CustomerKycDocument[]} kycDocuments - An array of KYC document details.
 */
export interface CustomerTyfoneExtension {
  nfiniaId: string;
  ownership: string;
  eligibility: CustomerEligibility;
  employment: CustomerEmployment[];
  secretIdentifier: string;
  kycDocuments: CustomerKycDocument[];
}

/**
 * @interface CustomerPayload
 * @summary Defines the detailed structure for the customer information payload.
 * @description Contains comprehensive customer data including personal details, contact information, and Tyfone-specific extensions.
 * @property {string} customerId - The primary identifier for the customer in the system.
 * @property {CustomerName} name - The customer's name components.
 * @property {string} dateOfBirth - The customer's date of birth (ISO date format, e.g., '1981-07-05').
 * @property {string} taxId - The customer's tax identification number.
 * @property {string} ssn - The customer's Social Security Number (Note: Handle sensitivity appropriately).
 * @property {CustomerEmail[]} email - An array of the customer's email addresses.
 * @property {CustomerAddress[]} addresses - An array of the customer's physical addresses.
 * @property {CustomerTelephone[]} telephones - An array of the customer's telephone numbers.
 * @property {CustomerTyfoneExtension} tyfoneExtension - Tyfone-specific metadata and details for the customer.
 */
export interface CustomerPayload {
  customerId: string;
  name: CustomerName;
  dateOfBirth: string;
  taxId: string;
  ssn: string;
  email: CustomerEmail[];
  addresses: CustomerAddress[];
  telephones: CustomerTelephone[];
  tyfoneExtension: CustomerTyfoneExtension;
}

export interface CustomerPayloadWithIdentityKey {
  identityKey: string; // Unique identifier for the session or user
  customer: CustomerPayload;
}

// --- Combined Payload ---

/**
 * @interface CombinedPayload
 * @summary Represents the final payload structure before signing and encryption.
 * @description This structure combines session details, an identity key, and detailed customer information.
 *              It also includes standard JWT claims (`iat`, `exp`) that are added during the token generation process.
 * @property {SessionPayload} session - The session information object.
 * @property {string} identityKey - An additional identity key string.
 * @property {CustomerPayload} customer - The detailed customer information object.
 * @property {number} iat - JWT Issued At timestamp (seconds since epoch), added during token generation.
 * @property {number} exp - JWT Expiration Time timestamp (seconds since epoch), added during token generation.
 */
export interface CombinedPayload {
  session: SessionPayload;
  identityKey: string; // Unique identifier for the session or user
  customer: CustomerPayload;
  iat: number; // Added by JWT signing process
  exp: number; // Added by JWT signing process
}

/**
 * @interface PayloadEditorProps
 * @summary Properties for payload editor components.
 * @description Defines the common properties used by payload editor components for managing JSON payloads.
 * @property {string} value - The initial JSON string value for the payload.
 * @property {(value: string) => void} onChange - Callback function invoked when the payload changes.
 */
export interface PayloadEditorProps {
  value: string;
  onChange: (value: string) => void;
}
