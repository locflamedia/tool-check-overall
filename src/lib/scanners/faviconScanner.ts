import axios from "axios";
import { URL } from "url";

export interface FaviconResult {
  exists: boolean;
  url: string | null;
  errors: string[];
}

export async function scanFavicon(pageUrl: string): Promise<FaviconResult> {
  const result: FaviconResult = {
    exists: false,
    url: null,
    errors: [],
  };

  try {
    const parsedPageUrl = new URL(pageUrl);
    const baseUrl = `${parsedPageUrl.protocol}//${parsedPageUrl.host}`;

    // 1. Check for favicon link in HTML
    try {
      const response = await axios.get(pageUrl, { timeout: 5000 });
      const html = response.data;

      const linkRegex =
        /<link\s+(?:[^>]*?\s+)?rel=["\'](?:icon|shortcut\s+icon)["\']\s+[^>]*?href=["\']([^"\']+)["\']/i;
      const match = html.match(linkRegex);

      if (match && match[1]) {
        let faviconUrl = match[1];
        // Resolve relative URLs
        if (faviconUrl.startsWith("//")) {
          faviconUrl = `${parsedPageUrl.protocol}${faviconUrl}`;
        } else if (faviconUrl.startsWith("/")) {
          faviconUrl = `${baseUrl}${faviconUrl}`;
        } else if (!faviconUrl.startsWith("http")) {
          faviconUrl = `${parsedPageUrl.href.substring(
            0,
            parsedPageUrl.href.lastIndexOf("/")
          )}/${faviconUrl}`;
        }

        const faviconResponse = await axios.head(faviconUrl, { timeout: 5000 });
        if (faviconResponse.status >= 200 && faviconResponse.status < 300) {
          result.exists = true;
          result.url = faviconUrl;
          return result;
        }
      }
    } catch (htmlError: any) {
      // Log HTML fetch error but don't stop, proceed to check default /favicon.ico
      result.errors.push(
        `Error fetching page HTML for favicon links: ${htmlError.message}`
      );
    }

    // 2. Fallback: Check for /favicon.ico at root
    const defaultFaviconUrl = `${baseUrl}/favicon.ico`;
    try {
      const defaultFaviconResponse = await axios.head(defaultFaviconUrl, {
        timeout: 5000,
      });
      if (
        defaultFaviconResponse.status >= 200 &&
        defaultFaviconResponse.status < 300
      ) {
        result.exists = true;
        result.url = defaultFaviconUrl;
      }
    } catch (defaultFaviconError: any) {
      result.errors.push(
        `Error checking default /favicon.ico: ${defaultFaviconError.message}`
      );
    }

    if (!result.exists) {
      result.errors.push("No favicon found via link tags or at /favicon.ico");
    }
  } catch (mainError: any) {
    result.errors.push(`Favicon scan failed: ${mainError.message}`);
  }

  return result;
}
