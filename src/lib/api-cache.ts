// API call utilities with caching
const API_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheDuration?: number
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options || {})}`;
  const cached = API_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < (cacheDuration || CACHE_DURATION)) {
    return cached.data as T;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  API_CACHE.set(cacheKey, { data, timestamp: Date.now() });

  return data as T;
}

export function clearCache(urlPattern?: string) {
  if (!urlPattern) {
    API_CACHE.clear();
    return;
  }

  const keysToDelete: string[] = [];
  for (const key of API_CACHE.keys()) {
    if (key.includes(urlPattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => API_CACHE.delete(key));
}
