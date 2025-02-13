/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img1.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img2.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img3.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img9.doubanio.com",
      },
    ],
  },
};

export default config;
