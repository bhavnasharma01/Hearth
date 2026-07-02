import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, a stray lockfile
  // elsewhere on the machine can make Next infer the wrong root directory.
  turbopack: {
    root: path.join(__dirname),
  },
  // node-ical (cron import) and nodemailer (steward email alerts) are Node
  // libraries that don't bundle cleanly — load them from node_modules at
  // runtime instead of tracing them into the serverless bundle.
  serverExternalPackages: ["node-ical", "nodemailer"],
};

export default nextConfig;
