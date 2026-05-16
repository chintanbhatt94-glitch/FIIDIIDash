/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // yahoo-finance2 ships Deno/test files that break webpack bundling.
  // Externalize it so Next.js loads it at runtime instead.
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2", "@anthropic-ai/sdk"],
  },
};

module.exports = nextConfig;
