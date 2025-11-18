export async function findCurrentAPLUrl(): Promise<string> {
  const baseUrl = import.meta.env.PROD
    ? 'https://wic.robinting.com'
    : 'http://localhost:4321';

    const response = await fetch(`${baseUrl}/api/find-apl-link`);

    if (!response.ok) {
      throw new Error(`Failed to fetch APL link: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
}

export async function downloadAPLFile(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download APL file: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}