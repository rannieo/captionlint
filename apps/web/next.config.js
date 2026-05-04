/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/caption-parser",
    "@repo/config",
    "@repo/lint-engine",
    "@repo/shared-types",
    "@repo/ui",
  ],
};

export default nextConfig;
