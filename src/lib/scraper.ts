export async function findCurrentAPLUrl(): Promise<string> {
  const baseUrl = import.meta.env.PROD
    ? 'https://wic.robinting.com'
    : 'http://localhost:4321';

  const apiUrl = `${baseUrl}/api/find-apl-link`;
  const startTime = Date.now();
  
  console.log('[DEBUG] findCurrentAPLUrl: Starting request', {
    baseUrl,
    apiUrl,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      console.error('[DEBUG] findCurrentAPLUrl: Client timeout triggered', {
        elapsedMs: elapsed,
        timeoutMs: 20000,
      });
      controller.abort();
    }, 20000); // 20 second timeout on client

    console.log('[DEBUG] findCurrentAPLUrl: Initiating fetch...');
    const fetchStartTime = Date.now();
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
    });

    const fetchElapsed = Date.now() - fetchStartTime;
    console.log('[DEBUG] findCurrentAPLUrl: Fetch completed', {
      elapsedMs: fetchElapsed,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DEBUG] findCurrentAPLUrl: Response not OK', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        errorData.error || `Failed to fetch APL link: ${response.status} ${response.statusText}`
      );
    }

    const parseStartTime = Date.now();
    const data = await response.json();
    const parseElapsed = Date.now() - parseStartTime;
    
    console.log('[DEBUG] findCurrentAPLUrl: Response parsed', {
      parseElapsedMs: parseElapsed,
      hasUrl: !!data.url,
      dataKeys: Object.keys(data),
    });
    
    if (!data.url) {
      console.error('[DEBUG] findCurrentAPLUrl: No URL in response', { data });
      throw new Error('APL URL not found in response');
    }
    
    const totalElapsed = Date.now() - startTime;
    console.log('[DEBUG] findCurrentAPLUrl: Success', {
      totalElapsedMs: totalElapsed,
      url: data.url,
    });
    
    return data.url;
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    console.error('[DEBUG] findCurrentAPLUrl: Error caught', {
      totalElapsedMs: totalElapsed,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined,
      isAbortError: error instanceof Error && error.name === 'AbortError',
      isTypeError: error instanceof TypeError,
      isNetworkError: error instanceof TypeError && error.message.includes('Failed to fetch'),
    });

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${totalElapsed}ms. Please check your internet connection and try again.`);
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Unable to connect to server (${apiUrl}). Please check your internet connection.`);
    }
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