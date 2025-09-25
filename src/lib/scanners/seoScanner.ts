import axios from "axios";
import * as cheerio from "cheerio";

interface SeoResult {
  title: string | null;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  h1s: string[];
  h2s: string[];
  imgAltTagsMissing: string[];
  schemaMarkups: string[];
  errors: string[];
}

export async function scanSeo(url: string): Promise<SeoResult> {
  const result: SeoResult = {
    title: null,
    description: null,
    robots: null,
    canonical: null,
    h1s: [],
    h2s: [],
    imgAltTagsMissing: [],
    schemaMarkups: [],
    errors: [],
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Title
    result.title = $("head title").text() || null;

    // Meta Description
    result.description =
      $('head meta[name="description"]').attr("content") || null;

    // Meta Robots
    result.robots = $('head meta[name="robots"]').attr("content") || null;

    // Canonical Tag
    result.canonical = $('head link[rel="canonical"]').attr("href") || null;

    // H1s
    $("h1").each((_i, elem) => {
      result.h1s.push($(elem).text());
    });

    // H2s
    $("h2").each((_i, elem) => {
      result.h2s.push($(elem).text());
    });

    // Image Alt Tags
    $("img").each((_i, elem) => {
      if (!$(elem).attr("alt")) {
        result.imgAltTagsMissing.push($(elem).attr("src") || "Unknown image");
      }
    });

    // Schema Markup (JSON-LD)
    $('script[type="application/ld+json"]').each((_i, elem) => {
      try {
        const schema = JSON.parse($(elem).text());
        result.schemaMarkups.push(JSON.stringify(schema, null, 2));
      } catch (e: any) {
        result.errors.push(`Error parsing schema markup: ${e.message}`);
      }
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `HTTP Error fetching page (${url}): ${error.response.status} - ${error.response.statusText}`,
        );
      } else if (error.request) {
        result.errors.push(`No response received when fetching page (${url}).`);
      } else {
        result.errors.push(
          `Request Error fetching page (${url}): ${error.message}`,
        );
      }
    } else {
      result.errors.push(
        `Unknown Error fetching page (${url}): ${error.message}`,
      );
    }
  }

  return result;
}
