import type { APIRoute } from "astro";
import { load } from "cheerio";

// Helper function to add timeout to fetch
async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export const GET: APIRoute = async () => {
  try {
    const wicAPLWebsiteUrl = "https://nyswicvendors.com/upc-resources/";

    const response = await fetchWithTimeout(wicAPLWebsiteUrl, 15000); // 15 second timeout
    
    if (!response.ok) {
      throw new Error(`Failed to fetch APL website: ${response.status} ${response.statusText}`);
    }
    
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
