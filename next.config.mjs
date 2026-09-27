/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GLB/GLTF and 3D assets are served through API routes / object storage,
  // never bundled into the app source. Keep the bundle lean.
  transpilePackages: ["three"],
  images: {
    // Allow images served from our own asset route and any configured
    // object-storage host. Extend remotePatterns when a real CDN is set.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "150mb", // large GLB uploads via server actions/API
    },
  },
};

export default nextConfig;
