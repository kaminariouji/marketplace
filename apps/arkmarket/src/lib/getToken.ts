import type { Token } from "~/types";
import { env } from "~/env";
import { normalizeChainId } from "~/config/chains";

export interface TokenApiResponse {
  data: Token;
}

interface GetCollectionTokenProps {
  contractAddress: string;
  tokenId: string;
  chainId?: string;
}
export default async function getToken({
  contractAddress,
  tokenId,
  chainId,
}: GetCollectionTokenProps) {
  const url = `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/tokens/${contractAddress}/${normalizeChainId(chainId)}/${tokenId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch token");
  }

  const { data } = (await response.json()) as TokenApiResponse;

  return data;
}
