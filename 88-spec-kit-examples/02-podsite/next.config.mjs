/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to ./out (constitution I).
  output: 'export',
  // /about -> /about/index.html, portable across static hosts without rewrites.
  trailingSlash: true,
  // The image optimizer is a server feature; cover art is generated SVG anyway.
  images: { unoptimized: true },
};

export default nextConfig;
