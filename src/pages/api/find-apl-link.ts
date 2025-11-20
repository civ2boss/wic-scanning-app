export const prerender = false;

import type { APIRoute } from "astro";
import { load } from "cheerio";

// Simple in-memory cache for APL URL
// Cache for 1 hour (3600000ms) to avoid hitting external site on every request
interface CacheEntry {
  url: string;
  timestamp: number;
}

let aplUrlCache: CacheEntry | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function getCachedUrl(): string | null {
  if (!aplUrlCache) {
    return null;
  }
  
  const age = Date.now() - aplUrlCache.timestamp;
  if (age > CACHE_DURATION_MS) {
    console.log('[DEBUG] Cache expired', { ageMs: age, cacheDurationMs: CACHE_DURATION_MS });
    aplUrlCache = null;
    return null;
  }
  
  console.log('[DEBUG] Using cached APL URL', { ageMs: age, url: aplUrlCache.url });
  return aplUrlCache.url;
}

function setCachedUrl(url: string): void {
  aplUrlCache = {
    url,
    timestamp: Date.now(),
  };
  console.log('[DEBUG] Cached APL URL', { url, timestamp: aplUrlCache.timestamp });
}

// Helper function to add timeout to fetch
async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
  const startTime = Date.now();
  console.log('[DEBUG] fetchWithTimeout: Starting fetch', { url, timeoutMs });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const elapsed = Date.now() - startTime;
    console.error('[DEBUG] fetchWithTimeout: Timeout triggered', { url, elapsedMs: elapsed, timeoutMs });
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      // Add redirect handling
      redirect: 'follow',
    });
    
    const elapsed = Date.now() - startTime;
    console.log('[DEBUG] fetchWithTimeout: Fetch completed', {
      url,
      elapsedMs: elapsed,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    clearTimeout(timeoutId);
    
    console.error('[DEBUG] fetchWithTimeout: Error caught', {
      url,
      elapsedMs: elapsed,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      isAbortError: error instanceof Error && error.name === 'AbortError',
    });
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms (elapsed: ${elapsed}ms)`);
    }
    throw error;
  }
}

export const GET: APIRoute = async ({ request }) => {
  // Log immediately - this helps us know if the request reached the server
  const apiStartTime = Date.now();
  const requestUrl = request.url;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  // CRITICAL: Log immediately to verify request reaches server
  console.log('[DEBUG] GET /api/find-apl-link: Request received IMMEDIATELY', {
    timestamp: new Date().toISOString(),
    requestUrl,
    userAgent,
    clientIp,
    method: request.method,
    isAndroid: userAgent.toLowerCase().includes('android'),
  });
  
  // Flush logs immediately if possible (some platforms support this)
  if (typeof process !== 'undefined' && process.stdout && typeof process.stdout.write === 'function') {
    try {
      process.stdout.write('');
    } catch (e) {
      // Ignore
    }
  }

  // Check cache first - this makes responses instant for mobile networks
  const cachedUrl = getCachedUrl();
  if (cachedUrl) {
    const cacheElapsed = Date.now() - apiStartTime;
    console.log('[DEBUG] GET /api/find-apl-link: Returning cached URL', {
      cacheElapsedMs: cacheElapsed,
      url: cachedUrl,
    });
    
    return new Response(JSON.stringify({ url: cachedUrl }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Cache": "HIT",
      },
    });
  }

  console.log('[DEBUG] GET /api/find-apl-link: Cache miss, fetching from external site');

  try {
    const wicAPLWebsiteUrl = "https://nyswicvendors.com/upc-resources/";
    console.log('[DEBUG] GET /api/find-apl-link: Starting fetch to external site', {
      wicAPLWebsiteUrl,
      timeoutMs: 5000,
    });

    const fetchStartTime = Date.now();
    // Reduced timeout to 5 seconds for mobile networks - they have shorter connection timeouts
    const response = await fetchWithTimeout(wicAPLWebsiteUrl, 5000);
    const fetchElapsed = Date.now() - fetchStartTime;
    
    console.log('[DEBUG] GET /api/find-apl-link: External fetch completed', {
      fetchElapsedMs: fetchElapsed,
      status: response.status,
      statusText: response.statusText,
    });
    
    if (!response.ok) {
      console.error('[DEBUG] GET /api/find-apl-link: External fetch failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Failed to fetch APL website: ${response.status} ${response.statusText}`);
    }
    
    const textStartTime = Date.now();
    const html = await response.text();
    const textElapsed = Date.now() - textStartTime;
    
    console.log('[DEBUG] GET /api/find-apl-link: HTML received', {
      textElapsedMs: textElapsed,
      htmlLength: html.length,
    });

    const parseStartTime = Date.now();
    const $ = load(html);

    let aplUrl: string | null = null;
    let linkCount = 0;

    $("a").each((_, element) => {
      linkCount++;
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
        console.log('[DEBUG] GET /api/find-apl-link: APL URL found', { aplUrl });
        return false;
      }
    });

    const parseElapsed = Date.now() - parseStartTime;
    console.log('[DEBUG] GET /api/find-apl-link: Parsing completed', {
      parseElapsedMs: parseElapsed,
      linkCount,
      aplUrlFound: !!aplUrl,
    });

    if (!aplUrl) {
      console.error('[DEBUG] GET /api/find-apl-link: APL link not found', {
        linkCount,
      });
      return new Response(JSON.stringify({ error: "APL link not found" }), {
        status: 404,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const totalElapsed = Date.now() - apiStartTime;
    console.log('[DEBUG] GET /api/find-apl-link: Success', {
      totalElapsedMs: totalElapsed,
      aplUrl,
    });

    // Cache the URL for future requests
    setCachedUrl(aplUrl);

    return new Response(JSON.stringify({ url: aplUrl }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const totalElapsed = Date.now() - apiStartTime;
    
    console.error('[DEBUG] GET /api/find-apl-link: Error caught', {
      totalElapsedMs: totalElapsed,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          elapsedMs: totalElapsed,
          errorName: error instanceof Error ? error.name : 'Unknown',
        },
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      },
    );
  }
};

// Handle OPTIONS request for CORS preflight
export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
