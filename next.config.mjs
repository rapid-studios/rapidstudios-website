import createMDX from "@next/mdx";

const withMDX = createMDX({});

const securityHeaders = [
  { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const noStoreHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "Expires", value: "0" },
  { key: "Pragma", value: "no-cache" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async rewrites() {
    return [
      { source: "/kumo", destination: "/kumo/index.html" },
      // BEGIN GENERATED PROSPECT DEMOS
      { source: "/dta-tumbling/demo", destination: "/dta-tumbling/demo.html" },
      { source: "/dta-tumbling", destination: "/dta-tumbling/index.html" },
      { source: "/united-dance-center/demo", destination: "/united-dance-center/demo/index.html" },
      { source: "/pantry-plenty/demo", destination: "/pantry-plenty/demo/index.html" },
      { source: "/exl-fitness/demo", destination: "/exl-fitness/demo/index.html" },
      { source: "/ranches-fitness/demo", destination: "/ranches-fitness/demo/index.html" },
      { source: "/valhalla-strength/demo", destination: "/valhalla-strength/demo/index.html" },
      { source: "/alpine-fitness/demo", destination: "/alpine-fitness/demo/index.html" },
      { source: "/spa-lounge/demo", destination: "/spa-lounge/demo/index.html" },
      { source: "/purify-wellness/demo", destination: "/purify-wellness/demo/index.html" },
      { source: "/unified-hot-yoga/demo", destination: "/unified-hot-yoga/demo/index.html" },
      { source: "/united-dance-center", destination: "/united-dance-center/index.html" },
      { source: "/pantry-plenty", destination: "/pantry-plenty/index.html" },
      { source: "/exl-fitness", destination: "/exl-fitness/index.html" },
      { source: "/valhalla-strength", destination: "/valhalla-strength/index.html" },
      { source: "/alpine-fitness", destination: "/alpine-fitness/index.html" },
      { source: "/purify-wellness", destination: "/purify-wellness/index.html" },
      { source: "/spa-lounge", destination: "/spa-lounge/index.html" },
      { source: "/unified-hot-yoga", destination: "/unified-hot-yoga/index.html" },
      { source: "/ranches-fitness", destination: "/ranches-fitness/index.html" },
      // END GENERATED PROSPECT DEMOS
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // BEGIN GENERATED PROSPECT HEADERS
      { source: "/dta-tumbling/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/united-dance-center/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/pantry-plenty/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/exl-fitness/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/ranches-fitness/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/valhalla-strength/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/alpine-fitness/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/spa-lounge/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/purify-wellness/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/unified-hot-yoga/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/dta-tumbling", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/united-dance-center", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/pantry-plenty", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/exl-fitness", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/valhalla-strength", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/alpine-fitness", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/purify-wellness", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/spa-lounge", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/unified-hot-yoga", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/ranches-fitness", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      // END GENERATED PROSPECT HEADERS
      { source: "/studio/:path*", headers: noStoreHeaders },
      { source: "/api/cms/:path*", headers: noStoreHeaders },
      { source: "/kumo/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/api/kumo/:path*", headers: noStoreHeaders },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  }
};

export default withMDX(nextConfig);
