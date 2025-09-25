import axios from "axios";
import * as cheerio from "cheerio";

interface SitemapResult {
  sitemapUrls: string[];
  urls: string[];
  errors: string[];
}

async function fetchAndParseSitemap(
  sitemapUrl: string,
  visitedSitemaps: Set<string>,
  result: SitemapResult,
) {
  if (visitedSitemaps.has(sitemapUrl)) {
    return;
  }
  visitedSitemaps.add(sitemapUrl);

  try {
    const response = await axios.get(sitemapUrl, { timeout: 10000 });
    const $ = cheerio.load(response.data, { xmlMode: true });

    // Check for sitemapindex
    const sitemapIndexUrls: string[] = [];
    $("sitemapindex sitemap loc").each((_i, elem) => {
      const loc = $(elem).text();
      if (loc) sitemapIndexUrls.push(loc);
    });

    if (sitemapIndexUrls.length > 0) {
      for (const nextSitemapUrl of sitemapIndexUrls) {
        await fetchAndParseSitemap(nextSitemapUrl, visitedSitemaps, result);
      }
    } else {
      // This is a regular sitemap
      $("urlset url loc").each((_i, elem) => {
        const loc = $(elem).text();
        if (loc) result.urls.push(loc);
      });
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `Sitemap HTTP Error (${sitemapUrl}): ${error.response.status} - ${error.response.statusText}`,
        );
      } else if (error.request) {
        result.errors.push(
          `No response received from sitemap server (${sitemapUrl}).`,
        );
      } else {
        result.errors.push(
          `Sitemap Request Error (${sitemapUrl}): ${error.message}`,
        );
      }
    } else {
      result.errors.push(
        `Sitemap Unknown Error (${sitemapUrl}): ${error.message}`,
      );
    }
  }
}

export async function scanSitemap(
  baseUrl: string,
  robotsTxtSitemaps: string[] = [],
): Promise<SitemapResult> {
  const result: SitemapResult = {
    sitemapUrls: [],
    urls: [],
    errors: [],
  };
  const visitedSitemaps = new Set<string>();

  const possibleSitemapUrls = new Set<string>();

  // Add sitemaps found in robots.txt
  robotsTxtSitemaps.forEach((s) => possibleSitemapUrls.add(s));

  // Add common sitemap paths
  possibleSitemapUrls.add(new URL("/sitemap.xml", baseUrl).toString());
  possibleSitemapUrls.add(new URL("/sitemap_index.xml", baseUrl).toString());

  for (const sitemapUrl of Array.from(possibleSitemapUrls)) {
    result.sitemapUrls.push(sitemapUrl);
    await fetchAndParseSitemap(sitemapUrl, visitedSitemaps, result);
  }

  return result;
}
