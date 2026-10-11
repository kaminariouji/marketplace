import type { TokenActivity } from "~/types";
import { env } from "~/env";
import { normalizeChainId } from "~/config/chains";

export interface TokenActivityApiResponse {
  data: TokenActivity[];
  count: number;
  next_page: number;
}

interface GetTokenActivityParams {
  contractAddress: string;
  chainId?: string;
  page?: number;
  tokenId: string;
}

export default async function getTokenActivity({
  contractAddress,
  chainId,
  page,
  tokenId,
}: GetTokenActivityParams) {
  const queryParams = [`items_per_page=${30}`];

  if (page !== undefined) {
    queryParams.push(`page=${page}`);
  }

  const url = `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/tokens/${contractAddress}/${normalizeChainId(chainId)}/${tokenId}/activity?${queryParams.join("&")}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch token activity");
  }

  const result = (await response.json()) as TokenActivityApiResponse;

  return result;
}
