/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Autorise toute source d'image en https (photos de candidats hébergées
      // n'importe où : Supabase Storage, Imgur, Google Drive avec lien direct, etc.)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
