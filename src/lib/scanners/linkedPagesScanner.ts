import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

interface LinkedPage {
  url: string;
  isInternal: boolean;
  text: string;
}

interface LinkedPagesResult {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  sampleLinks: LinkedPage[];
  errors: string[];
}

export async function scanLinkedPages(url: string): Promise<LinkedPagesResult> {
  const result: LinkedPagesResult = {
    totalLinks: 0,
    internalLinks: 0,
    externalLinks: 0,
    sampleLinks: [],
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const links: LinkedPage[] = [];

    $("a").each((_i, linkElement) => {
      const href = $(linkElement).attr("href");
      const text = $(linkElement).text().trim();

      if (href) {
        try {
          const absoluteUrl = new URL(href, url).toString();
          const isInternal = absoluteUrl.startsWith(baseUrl);

          links.push({
            url: absoluteUrl,
            isInternal: isInternal,
            text: text,
          });
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    result.totalLinks = links.length;
    result.internalLinks = links.filter((link) => link.isInternal).length;
    result.externalLinks = links.filter((link) => !link.isInternal).length;
    result.sampleLinks = links.slice(0, 10); // Take first 10 as a sample
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      result.errors.push(
        `HTTP status ${error.response.status} when fetching page for linked pages scan.`
      );
    } else if (axios.isAxiosError(error) && error.request) {
      result.errors.push(
        `No response received for linked pages scan: ${error.message}`
      );
    } else {
      result.errors.push(`Linked Pages scan failed: ${error.message}`);
    }
  }

  return result;
}
