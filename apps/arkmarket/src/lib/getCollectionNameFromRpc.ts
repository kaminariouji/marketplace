import { shortString } from "starknet";

import { getL2Rpc } from "~/lib/rpc";

/**
 * Best-effort on-chain check that `contractAddress` is a real Starknet NFT
 * contract: calls the ERC-721 `name()` entrypoint over RPC and decodes the
 * result as a short string.
 *
 * Returns `null` when the call fails for any reason (not a contract, no
 * `name()` entrypoint, RPC unreachable), so callers can fall back to a 404
 * without throwing.
 */
export default async function getCollectionNameFromRpc(
  contractAddress: string,
): Promise<string | null> {
  try {
    const provider = getL2Rpc();
    const result = await provider.callContract({
      contractAddress,
      entrypoint: "name",
    });

    const first = result[0];
    if (typeof first !== "string") {
      return null;
    }

    return shortString.decodeShortString(first);
  } catch {
    return null;
  }
}
