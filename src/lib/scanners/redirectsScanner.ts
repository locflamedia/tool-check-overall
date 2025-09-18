import axios from "axios";
import { URL } from "url";

interface RedirectInfo {
  from: string;
  to: string;
  status: number;
}

interface RedirectsResult {
  hasRedirects: boolean;
  redirectCount: number;
  redirectChain: RedirectInfo[];
  finalUrl: string;
  errors: string[];
}

export async function scanRedirects(url: string): Promise<RedirectsResult> {
  const result: RedirectsResult = {
    hasRedirects: false,
    redirectCount: 0,
    redirectChain: [],
    finalUrl: url,
    errors: [],
  };

  try {
    const initialUrl = new URL(url).toString();
    let currentUrl = initialUrl;
    const history: RedirectInfo[] = [];
    let response;

    // Using axios with maxRedirects: 0 to manually follow redirects
    while (true) {
      try {
        response = await axios.head(currentUrl, {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        });
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          response = error.response; // Capture response even if it's a 3xx status
        } else {
          throw error; // Re-throw if it's not an Axios error or a non-redirect HTTP error
        }
      }

      const status = response.status;
      const location = response.headers.location;

      if (status >= 300 && status < 400 && location) {
        const newUrl = new URL(location, currentUrl).toString();
        history.push({
          from: currentUrl,
          to: newUrl,
          status: status,
        });
        currentUrl = newUrl;
        result.redirectCount++;
        result.hasRedirects = true;

        if (result.redirectCount > 10) {
          // Prevent infinite redirect loops
          result.errors.push(
            "Too many redirects, potential redirect loop detected."
          );
          break;
        }
      } else {
        result.finalUrl = currentUrl;
        break;
      }
    }

    result.redirectChain = history;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      result.errors.push(
        `HTTP status ${error.response.status} when scanning for redirects.`
      );
    } else if (axios.isAxiosError(error) && error.request) {
      result.errors.push(
        `No response received for redirects scan: ${error.message}`
      );
    } else {
      result.errors.push(`Redirects scan failed: ${error.message}`);
    }
  }

  return result;
}
