import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.builder.io'], // Add the domain for the images
  },
  // Include any other existing configuration you have
};

module.exports = nextConfig;
