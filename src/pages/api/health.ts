import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  console.log('[DEBUG] GET /api/health: Request received', {
    timestamp,
    requestUrl: request.url,
    userAgent,
    clientIp,
    method: request.method,
  });

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp,
      serverTime: Date.now(),
      message: 'Server is responding',
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
};

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

