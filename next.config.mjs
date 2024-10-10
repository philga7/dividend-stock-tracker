/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
};

export default nextConfig;
