import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        // @ts-expect-error - instrumentationHook is valid but may not be in type definitions yet
        instrumentationHook: true,
    },
    eslint: {
        // Disable ESLint during builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable type checking during builds (for faster builds)
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
