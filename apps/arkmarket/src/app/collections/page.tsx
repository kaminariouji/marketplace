import type { Metadata } from "next";
import Link from "next/link";

import { VerifiedIcon } from "@ark-market/ui/icons";

import type { DiscoveredCollection } from "~/lib/discoverCollections";
import { mergeDiscoveredCollections } from "~/lib/discoverCollections";
import getCollectionSearch from "~/lib/getCollectionSearch";
import getHomepageTrendingNow from "~/lib/getHomepageTrendingNow";

export const metadata: Metadata = {
  title: "Explore collections",
  description:
    "Discover NFT collections indexed across the Starknet ecosystem.",
};

interface CollectionsPageProps {
  searchParams?: { q?: string };
}

/**
 * Load the collections shown in the directory.
 *
 * - With a query: search the indexer and render the matches.
 * - Without: show trending collections, which carry live floor data.
 *
 * The indexer can be unreachable; in that case the directory still renders
 * with an explanatory empty state instead of crashing the page.
 */
async function loadCollections(query: string): Promise<DiscoveredCollection[]> {
  if (query.length > 0) {
    const { data } = await getCollectionSearch({ searchQuery: query });
    return mergeDiscoveredCollections([], data.collections);
  }

  try {
    const trending = await getHomepageTrendingNow();
    return mergeDiscoveredCollections(trending.data, []);
  } catch {
    return [];
  }
}

export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const collections = await loadCollections(query);

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold">
          Explore collections
        </h1>
        <p className="text-muted-foreground">
          Every collection indexed across the Starknet ecosystem. Missing one?
          Open its page and request indexing.
        </p>
      </div>

      <form
        action="/collections"
        method="get"
        className="mt-6 flex max-w-md items-center gap-2"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search collections by name or address"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary"
        />
        <button
          type="submit"
          className="h-10 flex-shrink-0 rounded-md border border-border px-4 text-sm font-medium hover:border-primary"
        >
          Search
        </button>
      </form>

      {collections.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          {query.length > 0
            ? `No collections found for "${query}".`
            : "No collections are available right now. The indexer may be unreachable."}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.address} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({ collection }: { collection: DiscoveredCollection }) {
  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group rounded-lg border border-border p-4 transition-colors hover:border-primary"
    >
      {collection.image ? (
        <img
          src={collection.image}
          alt={collection.name}
          className="aspect-square w-full overflow-hidden rounded-md object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="aspect-square w-full rounded-md bg-secondary" />
      )}
      <div className="mt-3 flex items-center gap-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{collection.name}</p>
        {collection.isVerified && (
          <VerifiedIcon className="flex-shrink-0 text-primary" />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {collection.tokenCount !== null
            ? `${collection.tokenCount.toLocaleString("en-US")} items`
            : collection.source === "trending"
              ? "Trending"
              : "Indexed"}
        </span>
        {collection.floorPrice !== null && (
          <span>Floor {collection.floorPrice}</span>
        )}
      </div>
    </Link>
  );
}
