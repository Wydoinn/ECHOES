/**
 * Application-wide constants
 * Centralized configuration to avoid duplication and ensure consistency.
 */

/** Single contact email used across all pages */
export const CONTACT_EMAIL = 'santhoshs1881@gmail.com';

/** Gemini model used across all API calls */
export const GEMINI_MODEL = 'gemini-3-flash-preview';

/** localStorage keys */
export const STORAGE_KEYS = {
  SETTINGS: 'echoes_settings',
  SAFETY_RAIL_LAST_SHOWN: 'echoes_safety_rail_last_shown',
  FIRST_VISIT: 'echoes_first_visit',
} as const;
