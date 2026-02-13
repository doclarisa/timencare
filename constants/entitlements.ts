/**
 * Entitlements layer — centralized feature flags.
 * For MVP, all features return FREE-tier defaults.
 * When monetization is added, update values here — no scattered checks.
 */

export const Entitlements = {
  /** Maximum number of calendar events (Infinity = unlimited) */
  maxEvents: Infinity,
  /** Can export session/event data */
  canExportData: false,
  /** Can use multiple client profiles */
  canUseMultipleClients: true,
  /** Can customize event colors */
  canCustomizeColors: true,
  /** Can use advanced repeating reminders */
  canUseAdvancedReminders: false,
  /** Ad-free experience */
  adFree: true,
  /** Pro user flag */
  isProUser: false,
} as const;

export type EntitlementKey = keyof typeof Entitlements;

export function checkEntitlement<K extends EntitlementKey>(
  key: K
): (typeof Entitlements)[K] {
  return Entitlements[key];
}
