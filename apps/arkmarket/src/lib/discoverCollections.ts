import type { CollectionSearchResult, TrendingNow } from "~/types";
import { normalizeStarknetAddress } from "~/config/chains";

/**
 * A collection surfaced by the discovery directory, normalized across the
 * indexer endpoints that can produce one (`/trending` and
 * `/collections/search`).
 */
export interface DiscoveredCollection {
  address: string;
  name: string;
  image: string | null;
  floorPrice: string | null;
  floorDifference: number | null;
  isVerified: boolean;
  tokenCount: number | null;
  source: "trending" | "search";
}

export function fromTrending(trending: TrendingNow): DiscoveredCollection {
  return {
    address: trending.collection_address,
    name: trending.collection_name,
    image: trending.collection_image || null,
    floorPrice: trending.floor_price,
    floorDifference: trending.floor_difference,
    isVerified: false,
    tokenCount: null,
    source: "trending",
  };
}

export function fromSearch(
  result: CollectionSearchResult,
): DiscoveredCollection {
  return {
    address: result.address,
    name: result.name,
    image: result.image,
    floorPrice: null,
    floorDifference: null,
    isVerified: result.is_verified,
    tokenCount: result.token_count,
    source: "search",
  };
}

/**
 * Combine two entries for the same collection. `primary` wins on conflicts;
 * `secondary` only fills gaps (trending carries the live floor, search
 * carries the verification flag and token count).
 */
function fillGaps(
  primary: DiscoveredCollection,
  secondary: DiscoveredCollection,
): DiscoveredCollection {
  return {
    ...primary,
    image: primary.image ?? secondary.image,
    floorPrice: primary.floorPrice ?? secondary.floorPrice,
    floorDifference: primary.floorDifference ?? secondary.floorDifference,
    isVerified: primary.isVerified || secondary.isVerified,
    tokenCount: primary.tokenCount ?? secondary.tokenCount,
  };
}

/**
 * Merge trending and search results into a single, de-duplicated list.
 * Trending collections come first (they carry live floor data); search-only
 * collections follow in indexer order. Entries are de-duplicated by canonical
 * address so the same collection cannot appear twice with different padding.
 */
export function mergeDiscoveredCollections(
  trending: TrendingNow[],
  search: CollectionSearchResult[],
): DiscoveredCollection[] {
  const byAddress = new Map<string, DiscoveredCollection>();
  const ordered: DiscoveredCollection[] = [];

  const upsert = (entry: DiscoveredCollection) => {
    const key = normalizeStarknetAddress(entry.address);
    const existing = byAddress.get(key);

    if (existing) {
      const merged = fillGaps(existing, entry);
      byAddress.set(key, merged);
      ordered[ordered.indexOf(existing)] = merged;
      return;
    }

    byAddress.set(key, entry);
    ordered.push(entry);
  };

  for (const item of trending) {
    upsert(fromTrending(item));
  }

  for (const item of search) {
    upsert(fromSearch(item));
  }

  return ordered;
}
