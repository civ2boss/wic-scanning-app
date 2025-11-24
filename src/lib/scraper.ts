import { load } from "cheerio";

export async function findCurrentAPLUrl(): Promise<string> {
  const wicAPLWebsiteUrl = "https://nyswicvendors.com/upc-resources/";
  
  console.log('[DEBUG] findCurrentAPLUrl: Scraping external site directly', {
    url: wicAPLWebsiteUrl
  });

  try {
    const controller = new AbortController();
    // 15 second timeout for the initial page load
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(wicAPLWebsiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch APL website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);
    let aplUrl: string | null = null;

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      const text = $(element).text().toLowerCase();

      // Logic matching your find-apl-link.ts
      if (
        (href && text.includes("full-apl")) ||
        href?.includes(".xlsx") ||
        href?.match(/\/excel/i)
      ) {
        aplUrl = href.startsWith("http")
          ? href
          : new URL(href, wicAPLWebsiteUrl).toString();
        return false;
      }
    });

    if (!aplUrl) {
      throw new Error('APL URL not found in external page content');
    }

    console.log('[DEBUG] findCurrentAPLUrl: Found URL', { aplUrl });
    return aplUrl;

  } catch (error) {
    console.error('[DEBUG] findCurrentAPLUrl failed:', error);
    throw error;
  }
}

export async function downloadAPLFile(url: string): Promise<ArrayBuffer> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file download

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to download APL file: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('File download timed out. Please try again.');
    }
    throw error;
  }
}
