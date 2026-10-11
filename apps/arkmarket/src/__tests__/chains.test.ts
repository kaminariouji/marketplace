import { describe, expect, it } from "vitest";

import {
  DEFAULT_CHAIN_ID,
  SN_MAIN,
  SN_SEPOLIA,
  isStarknetAddress,
  isSupportedChainId,
  normalizeChainId,
  normalizeStarknetAddress,
} from "~/config/chains";

describe("normalizeChainId", () => {
  it("falls back to the default chain for missing values", () => {
    expect(normalizeChainId()).toBe(DEFAULT_CHAIN_ID);
    expect(normalizeChainId(null)).toBe(DEFAULT_CHAIN_ID);
    expect(normalizeChainId("")).toBe(DEFAULT_CHAIN_ID);
    expect(normalizeChainId("   ")).toBe(DEFAULT_CHAIN_ID);
  });

  it("lowercases and 0x-prefixes supplied values", () => {
    expect(normalizeChainId("0x534E5F4D41494E")).toBe(SN_MAIN);
    expect(normalizeChainId("534e5f5345504f4c4941")).toBe(SN_SEPOLIA);
    expect(normalizeChainId(`  ${SN_SEPOLIA}  `)).toBe(SN_SEPOLIA);
  });
});

describe("isSupportedChainId", () => {
  it("accepts known chain ids regardless of case", () => {
    expect(isSupportedChainId(SN_MAIN)).toBe(true);
    expect(isSupportedChainId(SN_MAIN.toUpperCase())).toBe(true);
    expect(isSupportedChainId(SN_SEPOLIA)).toBe(true);
  });

  it("rejects unknown chain ids", () => {
    expect(isSupportedChainId("0xdeadbeef")).toBe(false);
    expect(isSupportedChainId("")).toBe(false);
  });
});

describe("isStarknetAddress", () => {
  it("accepts 0x-prefixed hex addresses", () => {
    expect(isStarknetAddress(SN_MAIN)).toBe(true);
    expect(
      isStarknetAddress(
        "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
      ),
    ).toBe(true);
    expect(isStarknetAddress("0xABC")).toBe(true);
  });

  it("rejects slugs, empty and malformed values", () => {
    expect(isStarknetAddress("realms")).toBe(false);
    expect(isStarknetAddress("0x")).toBe(false);
    expect(isStarknetAddress("0xnothex")).toBe(false);
    expect(isStarknetAddress(undefined)).toBe(false);
    expect(isStarknetAddress(null)).toBe(false);
  });
});

describe("normalizeStarknetAddress", () => {
  it("collapses leading zeros so differently padded addresses match", () => {
    expect(normalizeStarknetAddress("0x0ABC")).toBe("0xabc");
    expect(normalizeStarknetAddress("0xABC")).toBe("0xabc");
    expect(normalizeStarknetAddress("0x0000")).toBe("0x0");
    expect(normalizeStarknetAddress("ABC")).toBe("0xabc");
  });
});
