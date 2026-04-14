import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    if (dev) {
      config.plugins.push(codeInspectorPlugin({ bundler: "webpack" }));
    }
    return config;
  },
  transpilePackages: ["@reown/appkit", "@reown/appkit-adapter-wagmi"],
};

export default nextConfig;
