import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    // Deterministic environment values so tests can import modules that read
    // from `~/env` (which validates its schema at import time outside CI).
    env: {
      NEXT_PUBLIC_MARKETPLACE_API_URL: "https://api.test.local",
      NEXT_PUBLIC_BROKER_ID: "test-broker",
      NEXT_PUBLIC_IPFS_GATEWAY: "https://ipfs.test.local/ipfs/",
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: "test-project",
      NEXT_PUBLIC_IMAGE_CDN_URL: "https://media.test.local",
      NEXT_PUBLIC_IMAGE_PROXY_URL: "https://imgproxy.test.local",
      NEXT_PUBLIC_MOBULA_API_KEY: "test-key",
      NEXT_PUBLIC_LORDS_TOKEN_ADDRESS: "0x0",
      NEXT_PUBLIC_RPC_URL: "https://rpc.test.local",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
