/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aragon/ods"],
  trailingSlash: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
