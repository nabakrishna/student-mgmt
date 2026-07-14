import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

//-- for the following problem add the below code of block 
// ⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "26.1.200.231".
// Cross-origin access to Next.js dev resources is blocked by default for safety.

// To allow this host in development, add it to "allowedDevOrigins" in next.config.js and restart the dev server:

// // next.config.js
// module.exports = {
//   allowedDevOrigins: ['26.1.200.231'],
// }

// next.config.js
module.exports = {
  allowedDevOrigins: ['26.1.200.231'],
}