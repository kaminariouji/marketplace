import { validateAndParseAddress } from "starknet";

import { env } from "~/env";

interface CollectionParams {
  contractAddress: string;
}

/**
 * Ask the indexer to (re)index a collection that is missing from the
 * marketplace. Mirrors the token-level metadata refresh call
 * (`postTokenMetadataRefresh`) without a token id, so the request covers the
 * whole contract.
 */
export default async function postCollectionMetadataRefresh({
  contractAddress,
}: CollectionParams) {
  const validatedContractAddress = validateAndParseAddress(contractAddress);

  const response = await fetch(
    `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/metadata/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contract_address: validatedContractAddress,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to request collection indexing");
  }
}
