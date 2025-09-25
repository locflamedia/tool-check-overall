import axios from "axios";
import { URL } from "url";
import * as cheerio from "cheerio";

export interface ThirdPartyScript {
  url: string | null; // Null for inline scripts
  domain: string | null; // Null for inline scripts
  type: "external" | "inline";
  status: string; // e.g., "Loaded", "Failed", "Timeout", "Inline"
  contentSnippet?: string; // For inline scripts
  id?: string; // For inline scripts with an ID
}

export interface ThirdPartyScriptsResult {
  totalScripts: number;
  externalScripts: ThirdPartyScript[];
  inlineScripts: ThirdPartyScript[];
  hasGATag: boolean;
  hasGTMTag: boolean;
  gtmId: string | null;
  hasPlausibleTag: boolean;
  errors: string[];
}

export async function scanThirdPartyScripts(
  pageUrl: string,
): Promise<ThirdPartyScriptsResult> {
  const result: ThirdPartyScriptsResult = {
    totalScripts: 0,
    externalScripts: [],
    inlineScripts: [],
    hasGATag: false,
    hasGTMTag: false,
    gtmId: null,
    hasPlausibleTag: false,
    errors: [],
  };

  try {
    const parsedPageUrl = new URL(pageUrl);
    const mainDomain = parsedPageUrl.hostname;

    const response = await axios.get(pageUrl, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const allScriptTags = $("script");
    result.totalScripts = allScriptTags.length;

    const scriptPromises: Promise<void>[] = [];

    allScriptTags.each((_i, elem) => {
      const $script = $(elem);
      const src = $script.attr("src");
      const scriptContent = $script.html()?.trim() || "";

      // Check for GA/GTM/Plausible tags
      if (scriptContent.includes("googletagmanager.com/gtm.js")) {
        result.hasGTMTag = true;
        const match = scriptContent.match(/id=([A-Z0-9-]+)/);
        if (match && match[1]) {
          result.gtmId = match[1];
        }
      }
      if (
        scriptContent.includes("googletagmanager.com/gtag/js") ||
        scriptContent.includes("www.google-analytics.com/analytics.js") ||
        scriptContent.includes("ga.js")
      ) {
        result.hasGATag = true;
      }
      if (
        scriptContent.includes("plausible.io/js") ||
        scriptContent.includes("plausible.io/event") ||
        scriptContent.includes("plausible.js")
      ) {
        result.hasPlausibleTag = true;
      }

      if (src) {
        // External script
        let scriptUrl = src;
        if (scriptUrl.startsWith("//")) {
          scriptUrl = `${parsedPageUrl.protocol}${scriptUrl}`;
        } else if (scriptUrl.startsWith("/")) {
          scriptUrl = `${parsedPageUrl.origin}${scriptUrl}`;
        } else if (!scriptUrl.startsWith("http")) {
          scriptUrl = `${parsedPageUrl.href.substring(
            0,
            parsedPageUrl.href.lastIndexOf("/"),
          )}/${scriptUrl}`;
        }

        // Re-check for GA/GTM/Plausible in external script URLs
        if (scriptUrl.includes("googletagmanager.com/gtm.js")) {
          result.hasGTMTag = true;
          const urlObj = new URL(scriptUrl);
          const id = urlObj.searchParams.get("id");
          if (id) {
            result.gtmId = id;
          }
        }
        if (
          scriptUrl.includes("googletagmanager.com/gtag/js") ||
          scriptUrl.includes("www.google-analytics.com/analytics.js") ||
          scriptUrl.includes("ga.js")
        ) {
          result.hasGATag = true;
        }
        if (
          scriptUrl.includes("plausible.io/js") ||
          scriptUrl.includes("plausible.io/event") ||
          scriptUrl.includes("plausible.js")
        ) {
          result.hasPlausibleTag = true;
        }

        const parsedScriptUrl = new URL(scriptUrl);
        const scriptDomain = parsedScriptUrl.hostname;

        if (scriptDomain !== mainDomain) {
          scriptPromises.push(
            (async () => {
              let scriptStatus: string = "Unknown";
              try {
                const scriptResponse = await axios.head(scriptUrl, {
                  timeout: 5000,
                });
                if (
                  scriptResponse.status >= 200 &&
                  scriptResponse.status < 300
                ) {
                  scriptStatus = "Loaded";
                } else {
                  scriptStatus = `Failed (HTTP ${scriptResponse.status})`;
                }
              } catch (scriptError: any) {
                scriptStatus = `Error (${scriptError.message})`;
              }

              result.externalScripts.push({
                url: scriptUrl,
                domain: scriptDomain,
                type: "external",
                status: scriptStatus,
              });
            })(),
          );
        }
      } else {
        // Inline script
        const content = scriptContent;
        const id = $script.attr("id");
        result.inlineScripts.push({
          url: null,
          domain: null,
          type: "inline",
          status: "Inline",
          contentSnippet: content
            ? content.substring(0, 100) + "..."
            : undefined,
          id: id || undefined,
        });
      }
    });

    await Promise.allSettled(scriptPromises);
  } catch (mainError: any) {
    if (axios.isAxiosError(mainError)) {
      result.errors.push(
        `Error fetching page HTML for third-party scripts scan: ${mainError.message}`,
      );
    } else {
      result.errors.push(
        `Unknown error during third-party scripts scan: ${mainError.message}`,
      );
    }
  }

  return result;
}
