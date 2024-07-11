/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aragon/ods"],
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "euc.li",
      },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
