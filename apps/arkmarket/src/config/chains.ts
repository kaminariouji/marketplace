/**
 * Chain ids and Starknet address helpers shared by every indexer-backed
 * fetcher in `src/lib`.
 *
 * The marketplace indexer scopes collections and tokens by chain id. Several
 * fetchers historically hardcoded Starknet Mainnet (`SN_MAIN`), which made
 * collections deployed on other chains (e.g. Sepolia) undiscoverable and
 * unrenderable. This module is the single source of truth for the chain ids
 * and address normalization used across the app.
 */

export const SN_MAIN = "0x534e5f4d41494e";
export const SN_SEPOLIA = "0x534e5f5345504f4c4941";

/** Chain used when a caller does not specify one (keeps existing URLs stable). */
export const DEFAULT_CHAIN_ID = SN_MAIN;

export const SUPPORTED_CHAIN_IDS = [SN_MAIN, SN_SEPOLIA] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export function isSupportedChainId(value: string): value is SupportedChainId {
  return (SUPPORTED_CHAIN_IDS as readonly string[]).includes(
    value.toLowerCase(),
  );
}

/**
 * Normalize a user- or config-supplied chain id to the lowercase, 0x-prefixed
 * form the indexer expects. Unknown or missing values fall back to the default
 * chain so existing URLs keep resolving.
 */
export function normalizeChainId(value?: string | null): string {
  if (typeof value !== "string") {
    return DEFAULT_CHAIN_ID;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    return DEFAULT_CHAIN_ID;
  }

  return normalized.startsWith("0x") ? normalized : `0x${normalized}`;
}

/** True when `value` looks like a Starknet contract address (0x + hex). */
export function isStarknetAddress(value?: string | null): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^0x[0-9a-f]{1,64}$/i.test(value.trim());
}

/**
 * Canonical form of a Starknet address for equality checks: lowercase,
 * 0x-prefixed and without leading zeros, because the same address can be
 * written with any number of leading zeros.
 */
export function normalizeStarknetAddress(value: string): string {
  const lower = value.trim().toLowerCase();
  const hex = (lower.startsWith("0x") ? lower.slice(2) : lower).replace(
    /^0+/,
    "",
  );

  return `0x${hex.length > 0 ? hex : "0"}`;
}
