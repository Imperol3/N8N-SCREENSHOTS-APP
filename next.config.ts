import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        instrumentationHook: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
