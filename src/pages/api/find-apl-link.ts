import type { APIRoute } from "astro";
import { load } from "cheerio";

export const GET: APIRoute = async () => {
  try {
    const wicAPLWebsiteUrl = "https://nyswicvendors.com/upc-resources/";

    const response = await fetch(wicAPLWebsiteUrl);
    const html = await response.text();

    const $ = load(html);

    let aplUrl: string | null = null;

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      const text = $(element).text().toLowerCase();

      if (
        (href && text.includes("full-apl")) ||
        href?.includes(".xlsx") ||
        href?.match(/\/excel/i)
      ) {
        aplUrl = href.startsWith("http")
          ? href
          : new URL(href, wicAPLWebsiteUrl).toString();
        console.log("APL URL:", aplUrl);
        return false;
      }
    });

    if (!aplUrl) {
      return new Response(JSON.stringify({ error: "APL link not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: aplUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
