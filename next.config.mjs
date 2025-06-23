/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  trailingSlash: true,
  basePath:
    process.env.NODE_ENV === "production" ? "/warehouse-3d-management" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/warehouse-3d-management/" : "",
};

export default nextConfig;
