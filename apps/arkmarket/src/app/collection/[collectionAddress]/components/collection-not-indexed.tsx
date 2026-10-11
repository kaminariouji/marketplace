"use client";

import { useState } from "react";

import { cn, focusableStyles } from "@ark-market/ui";

import postCollectionMetadataRefresh from "~/lib/postCollectionMetadataRefresh";

interface CollectionNotIndexedProps {
  collectionAddress: string;
  name: string;
}

type RequestState = "idle" | "pending" | "success" | "error";

/**
 * Shown when a contract is a verified Starknet NFT collection that the
 * marketplace indexer has not seen yet: instead of a bare 404, the visitor
 * can request indexing and the collection becomes browsable.
 */
export default function CollectionNotIndexed({
  collectionAddress,
  name,
}: CollectionNotIndexedProps) {
  const [state, setState] = useState<RequestState>("idle");

  const requestIndexing = async () => {
    setState("pending");
    try {
      await postCollectionMetadataRefresh({
        contractAddress: collectionAddress,
      });
      setState("success");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-var(--site-header-height))] w-full max-w-screen-md flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Not indexed yet
      </p>
      <h1 className="font-display text-3xl font-semibold">{name}</h1>
      <p className="text-muted-foreground">
        This contract is a Starknet NFT collection that the marketplace indexer
        has not seen yet. Request indexing and it will become browsable —
        tokens, activity and offers included.
      </p>
      <code className="rounded-md border border-border px-3 py-1 text-sm">
        {collectionAddress}
      </code>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            void requestIndexing();
          }}
          disabled={state === "pending" || state === "success"}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60",
            focusableStyles,
          )}
        >
          {state === "pending"
            ? "Requesting…"
            : state === "success"
              ? "Indexing requested"
              : "Request indexing"}
        </button>
        <a
          href={`https://voyager.online/contract/${collectionAddress}`}
          target="_blank"
          rel="noreferrer"
          className={cn("text-sm underline", focusableStyles)}
        >
          View contract on Voyager
        </a>
      </div>
      {state === "error" && (
        <p className="text-sm text-destructive">
          The indexer is unreachable right now. Try again in a few minutes.
        </p>
      )}
    </div>
  );
}
