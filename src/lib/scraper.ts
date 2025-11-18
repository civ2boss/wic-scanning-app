export async function findCurrentAPLUrl(): Promise<string> {
  const baseUrl = import.meta.env.PROD
    ? 'https://wic.robinting.com'
    : 'http://localhost:4321';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout on client

    const response = await fetch(`${baseUrl}/api/find-apl-link`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch APL link: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('APL URL not found in response');
    }
    
    return data.url;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
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