import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env } from "~/env";
import { ChainId, CollectionAddresses, Collections } from "~/config/homepage";
import { isStarknetAddress } from "~/config/chains";
import TokenPage from "~/app/token/[contractAddress]/[tokenId]/page";

interface GenerateMetadataProps {
  params: Promise<{ collectionAddress: string }>;
}

interface TokenPageRouteProps {
  params: { collectionAddress: string; tokenId: string };
}

/**
 * The legacy `/[collection]/[tokenId]` route accepts either a known
 * collection slug (e.g. `realms`) or a raw Starknet address, so links to
 * tokens of any indexed collection keep working.
 */
function resolveCollectionAddress(slugOrAddress: string): string | undefined {
  if (isStarknetAddress(slugOrAddress)) {
    return slugOrAddress;
  }

  const slug = Object.values(Collections).find(
    (collection) => collection === slugOrAddress,
  );

  return slug !== undefined
    ? CollectionAddresses[slug][ChainId.SN_MAIN]
    : undefined;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { collectionAddress: slugOrAddress } = await params;
  const collectionAddress = resolveCollectionAddress(slugOrAddress);
  const platform =
    env.NEXT_PUBLIC_THEME === "unframed" ? "Unframed" : "Ark Market";

  return {
    title: `Collection | ${platform}`,
    openGraph: {
      images: [
        `https://ark-market-unframed.vercel.app/api/og/collection?collection_address=${collectionAddress ?? slugOrAddress}`,
      ],
    },
  };
}

export default function TokenPageRoute({ params }: TokenPageRouteProps) {
  const address = resolveCollectionAddress(params.collectionAddress);
  if (address === undefined) {
    return notFound();
  }

  return TokenPage({
    params: { contractAddress: address, tokenId: params.tokenId },
  });
}
