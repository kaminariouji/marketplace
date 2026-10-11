import { afterEach, describe, expect, it, vi } from "vitest";

// `nuqs/server` relies on `react.cache`, which the Next.js runtime provides
// but plain vitest does not. The fetchers under test do not use the search
// params cache, so a minimal stub is enough to import the module.
vi.mock("nuqs/server", () => ({
  createSearchParamsCache: () => ({}),
  parseAsStringLiteral: () => ({ withDefault: () => ({}) }),
}));

import { SN_MAIN, SN_SEPOLIA } from "~/config/chains";
import { env } from "~/env";
import { getCollectionTokens } from "~/lib/getCollectionTokens";
import getToken from "~/lib/getToken";
import getTokenActivity from "~/lib/getTokenActivity";
import getTokenMarketData from "~/lib/getTokenMarketData";
import { getTokenOffers } from "~/lib/getTokenOffers";

const API = env.NEXT_PUBLIC_MARKETPLACE_API_URL;

function mockFetch(payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function calledUrl(fetchMock: ReturnType<typeof mockFetch>): string {
  return String(fetchMock.mock.calls[0]?.[0]);
}

const emptyTokensPage = { data: [], next_page: null, token_count: 0 };

describe("chain parameterization of indexer fetchers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults collection tokens to Starknet mainnet", async () => {
    const fetchMock = mockFetch(emptyTokensPage);

    await getCollectionTokens({ collectionAddress: "0xabc" });

    expect(calledUrl(fetchMock)).toContain(
      `/collections/0xabc/${SN_MAIN}/tokens?`,
    );
  });

  it("sends the requested chain id for collection tokens", async () => {
    const fetchMock = mockFetch(emptyTokensPage);

    await getCollectionTokens({
      collectionAddress: "0xabc",
      chainId: SN_SEPOLIA,
    });

    expect(calledUrl(fetchMock)).toContain(
      `/collections/0xabc/${SN_SEPOLIA}/tokens?`,
    );
  });

  it("sends direction even when no sort field is set (regression)", async () => {
    const fetchMock = mockFetch(emptyTokensPage);

    await getCollectionTokens({
      collectionAddress: "0xabc",
      sortDirection: "desc",
    });

    const url = calledUrl(fetchMock);
    expect(url).toContain("direction=desc");
    expect(url).not.toContain("undefined");
  });

  it("does not emit direction when it is not set", async () => {
    const fetchMock = mockFetch(emptyTokensPage);

    await getCollectionTokens({ collectionAddress: "0xabc", sortBy: "price" });

    const url = calledUrl(fetchMock);
    expect(url).toContain("sort=price");
    expect(url).not.toContain("direction=");
  });

  it("builds token URLs with the requested chain", async () => {
    const fetchMock = mockFetch({ data: {} });

    await getToken({
      contractAddress: "0xabc",
      tokenId: "1",
      chainId: SN_SEPOLIA,
    });

    expect(calledUrl(fetchMock)).toBe(`${API}/tokens/0xabc/${SN_SEPOLIA}/1`);
  });

  it("builds token activity URLs with the requested chain", async () => {
    const fetchMock = mockFetch({ data: [], count: 0, next_page: 0 });

    await getTokenActivity({
      contractAddress: "0xabc",
      tokenId: "1",
      chainId: SN_SEPOLIA,
    });

    expect(calledUrl(fetchMock)).toContain(
      `/tokens/0xabc/${SN_SEPOLIA}/1/activity?`,
    );
  });

  it("builds token market data URLs with the requested chain", async () => {
    const fetchMock = mockFetch({ data: {} });

    await getTokenMarketData({
      contractAddress: "0xabc",
      tokenId: "1",
      chainId: SN_SEPOLIA,
    });

    expect(calledUrl(fetchMock)).toBe(
      `${API}/tokens/0xabc/${SN_SEPOLIA}/1/marketdata`,
    );
  });

  it("builds token offers URLs with the requested chain", async () => {
    const fetchMock = mockFetch({ data: [], count: 0, next_page: 0 });

    await getTokenOffers({
      contractAddress: "0xabc",
      tokenId: "1",
      chainId: SN_SEPOLIA,
    });

    expect(calledUrl(fetchMock)).toContain(
      `/tokens/0xabc/${SN_SEPOLIA}/1/offers?`,
    );
  });
});
