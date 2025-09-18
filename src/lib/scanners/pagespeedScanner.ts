import axios from "axios";

interface PageSpeedResult {
  overallScore: number | null;
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  tbt: number | null; // Total Blocking Time
  si: number | null; // Speed Index
  errors: string[];
}

export async function scanPagespeed(url: string): Promise<PageSpeedResult> {
  const result: PageSpeedResult = {
    overallScore: null,
    fcp: null,
    lcp: null,
    cls: null,
    tbt: null,
    si: null,
    errors: [],
  };

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    result.errors.push(
      "Google PageSpeed Insights API key is not configured. Please set GOOGLE_PAGESPEED_API_KEY in your environment variables."
    );
    return result;
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${apiKey}&strategy=mobile`;

  try {
    const response = await axios.get(apiUrl, { timeout: 30000 }); // Increased timeout for PageSpeed
    const data = response.data;

    if (data.lighthouseResult) {
      const categories = data.lighthouseResult.categories.performance;
      result.overallScore = categories ? categories.score * 100 : null;

      const audits = data.lighthouseResult.audits;
      result.fcp = audits["first-contentful-paint"]?.numericValue || null;
      result.lcp = audits["largest-contentful-paint"]?.numericValue || null;
      result.cls = audits["cumulative-layout-shift"]?.numericValue || null;
      result.tbt = audits["total-blocking-time"]?.numericValue || null;
      result.si = audits["speed-index"]?.numericValue || null;
    } else {
      result.errors.push(
        "No Lighthouse results found in PageSpeed API response."
      );
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `PageSpeed API Error: ${error.response.status} - ${error.response.statusText}. Check your API key and URL.`
        );
      } else if (error.request) {
        result.errors.push("No response received from PageSpeed API server.");
      } else {
        result.errors.push(`PageSpeed API Request Error: ${error.message}`);
      }
    } else {
      result.errors.push(`PageSpeed API Unknown Error: ${error.message}`);
    }
  }

  return result;
}
