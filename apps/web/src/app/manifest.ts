import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bylaw Chat",
    short_name: "Bylaws",
    description: "Ask questions about the 1399 Park Avenue bylaws, offering plan, and rules.",
    start_url: "/",
    // "browser" keeps Google sign-in working when launched from the iOS home screen.
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
