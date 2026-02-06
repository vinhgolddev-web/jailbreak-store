const nextConfig = {
  // output: "standalone", // Removed to support custom server.js
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
      },
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'jailbreak.fandom.com',
      },
    ],
  },
};

export default nextConfig;
