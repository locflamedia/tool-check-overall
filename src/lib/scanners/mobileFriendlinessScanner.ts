import axios from "axios";
import * as cheerio from "cheerio";

interface MobileFriendlinessResult {
  hasViewportMeta: boolean;
  isMobileFriendly: boolean | null;
  mobileFriendlyTestUrl: string | null;
  errors: string[];
}

export async function scanMobileFriendliness(
  url: string
): Promise<MobileFriendlinessResult> {
  const result: MobileFriendlinessResult = {
    hasViewportMeta: false,
    isMobileFriendly: null,
    mobileFriendlyTestUrl: null,
    errors: [],
  };

  // Check for viewport meta tag
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    result.hasViewportMeta = $('head meta[name="viewport"]').length > 0;
  } catch (error: any) {
    result.errors.push(
      `Error fetching page for viewport check (${url}): ${error.message}`
    );
  }

  // Use Google Mobile-Friendly Test API
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY; // Reusing the same API key
  if (!apiKey) {
    result.errors.push(
      "Google PageSpeed Insights API key is not configured. Please set GOOGLE_PAGESPEED_API_KEY in your environment variables."
    );
    return result;
  }

  const apiUrl = `https://www.googleapis.com/webmasters/v3/urlTestingTools/mobileFriendlyTest:run?key=${apiKey}`;

  try {
    const apiResponse = await axios.post(
      apiUrl,
      {
        url: url,
        requestScreenshot: false,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    const data = apiResponse.data;
    if (data && data.testStatus && data.testStatus.status === "COMPLETE") {
      result.isMobileFriendly = data.mobileFriendlyStatus === "MOBILE_FRIENDLY";
      result.mobileFriendlyTestUrl = data.resourceIssues
        ? data.resourceIssues[0].blockedResource.url
        : null; // Example, adjust as needed
    } else if (data && data.testStatus && data.testStatus.details) {
      result.errors.push(
        `Google Mobile-Friendly Test API Error: ${data.testStatus.details}`
      );
    } else {
      result.errors.push(
        "Unexpected response from Google Mobile-Friendly Test API."
      );
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `Mobile-Friendly Test API Error: ${error.response.status} - ${error.response.statusText}. Check your API key and URL.`
        );
      } else if (error.request) {
        result.errors.push(
          "No response received from Mobile-Friendly Test API server."
        );
      } else {
        result.errors.push(
          `Mobile-Friendly Test API Request Error: ${error.message}`
        );
      }
    } else {
      result.errors.push(
        `Mobile-Friendly Test API Unknown Error: ${error.message}`
      );
    }
  }

  return result;
}
