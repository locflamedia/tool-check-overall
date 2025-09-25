import axios from "axios";

export interface SSRResult {
  isSSR: boolean;
  ssrIndicators: string[];
  errors: string[];
}

export async function scanSSR(url: string): Promise<SSRResult> {
  const result: SSRResult = {
    isSSR: false,
    ssrIndicators: [],
    errors: [],
  };

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const html = response.data;

    // Check for common SSR indicators
    if (html.includes('<div id="__next"')) {
      result.isSSR = true;
      result.ssrIndicators.push("Next.js SSR/SSG indicator (__next div)");
    }
    if (html.includes("data-reactroot")) {
      result.isSSR = true;
      result.ssrIndicators.push("React SSR indicator (data-reactroot)");
    }
    if (html.includes('id="__nuxt"')) {
      result.isSSR = true;
      result.ssrIndicators.push("Nuxt.js SSR/SSG indicator (__nuxt div)");
    }
    if (html.includes('id="_sapper"')) {
      result.isSSR = true;
      result.ssrIndicators.push(
        "Sapper/SvelteKit SSR/SSG indicator (_sapper div)"
      );
    }
    // Add more framework-specific indicators
    if (
      html.includes('id="__N_DATA__"') ||
      html.includes('id="__N_HYDRATION_DATA__"')
    ) {
      result.isSSR = true;
      result.ssrIndicators.push("Next.js hydration data (id=__N_DATA__)");
    }
    if (html.includes("data-nuxt-hydration")) {
      result.isSSR = true;
      result.ssrIndicators.push("Nuxt.js hydration data (data-nuxt-hydration)");
    }

    // More generic check: if body contains substantial content, not just script tags
    const bodyContentRegex = /<body[^>]*?>([\s\S]*?)<\/body>/i;
    const bodyMatch = html.match(bodyContentRegex);
    if (bodyMatch && bodyMatch[1]) {
      // Remove script and style tags to check for actual content
      const cleanedBody = bodyMatch[1]
        .replace(/<script[^>]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*?>[\s\S]*?<\/style>/gi, "");
      // Check if the cleaned body has a substantial amount of non-whitespace characters
      if (cleanedBody.replace(/\s+/g, "").length > 200) {
        // Arbitrary threshold
        if (!result.isSSR) {
          // Only add if not already marked by framework indicators
          result.isSSR = true;
          result.ssrIndicators.push(
            "Substantial pre-rendered content in <body>"
          );
        }
      }
    }

    if (!result.isSSR && result.ssrIndicators.length === 0) {
      result.ssrIndicators.push("No strong SSR indicators found");
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      result.errors.push(`Error fetching URL for SSR scan: ${error.message}`);
    } else {
      result.errors.push(`Unknown error during SSR scan: ${error.message}`);
    }
  }

  return result;
}
