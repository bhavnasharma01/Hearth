import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray lockfile
  // elsewhere on the machine can make Next infer the wrong root directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
