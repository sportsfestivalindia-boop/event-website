import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/thank-you",
        "/payment-failed",
        "/pay",
        "/payu/",
        "/ticket/",
      ],
    },
    sitemap: "https://www.sportsfestivalindia.com/sitemap.xml",
  };
}

