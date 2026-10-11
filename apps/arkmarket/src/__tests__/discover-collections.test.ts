import { describe, expect, it } from "vitest";

import { mergeDiscoveredCollections } from "~/lib/discoverCollections";
import type { CollectionSearchResult, TrendingNow } from "~/types";

function trending(address: string, name: string): TrendingNow {
  return {
    collection_address: address,
    collection_image: "https://media.test.local/trending.png",
    collection_name: name,
    floor_difference: 0.05,
    floor_price: "1.5",
    preview_nfts: [{}, {}, {}],
  };
}

function searchResult(
  address: string,
  name: string,
  overrides?: Partial<CollectionSearchResult>,
): CollectionSearchResult {
  return {
    address,
    image: null,
    is_verified: true,
    name,
    token_count: 42,
    ...overrides,
  };
}

describe("mergeDiscoveredCollections", () => {
  it("maps trending entries with floor data", () => {
    const result = mergeDiscoveredCollections(
      [trending("0xabc", "Realms")],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      address: "0xabc",
      name: "Realms",
      floorPrice: "1.5",
      floorDifference: 0.05,
      isVerified: false,
      tokenCount: null,
      source: "trending",
    });
  });

  it("maps search entries with verification data", () => {
    const result = mergeDiscoveredCollections(
      [],
      [searchResult("0xabc", "Realms")],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      address: "0xabc",
      floorPrice: null,
      isVerified: true,
      tokenCount: 42,
      source: "search",
    });
  });

  it("returns an empty list when both sources are empty", () => {
    expect(mergeDiscoveredCollections([], [])).toEqual([]);
  });

  it("de-duplicates by canonical address and merges fields", () => {
    // Same collection, written with different leading-zero padding.
    const result = mergeDiscoveredCollections(
      [trending("0x0abc", "Realms")],
      [searchResult("0xabc", "Realms")],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      address: "0x0abc",
      floorPrice: "1.5",
      isVerified: true,
      tokenCount: 42,
      source: "trending",
    });
  });

  it("keeps trending order and appends search-only collections", () => {
    const result = mergeDiscoveredCollections(
      [trending("0x1", "One"), trending("0x2", "Two")],
      [searchResult("0x2", "Two"), searchResult("0x3", "Three")],
    );

    expect(result.map((collection) => collection.address)).toEqual([
      "0x1",
      "0x2",
      "0x3",
    ]);
    expect(result[1]?.tokenCount).toBe(42);
  });
});
