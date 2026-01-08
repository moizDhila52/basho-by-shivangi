/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Optional: if you use Unsplash placeholders
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
