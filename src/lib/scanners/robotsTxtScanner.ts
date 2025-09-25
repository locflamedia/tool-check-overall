import axios from "axios";

interface RobotsTxtResult {
  rawContent: string | null;
  sitemaps: string[];
  disallows: string[];
  allows: string[];
  host: string | null;
  errors: string[];
}

export async function scanRobotsTxt(url: string): Promise<RobotsTxtResult> {
  const robotsTxtUrl = new URL("/robots.txt", url).toString();
  const result: RobotsTxtResult = {
    rawContent: null,
    sitemaps: [],
    disallows: [],
    allows: [],
    host: null,
    errors: [],
  };

  try {
    const response = await axios.get(robotsTxtUrl, { timeout: 5000 });
    result.rawContent = response.data;

    const lines = response.data.split("\n");
    let currentUserAgent: string | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      const [key, ...valueParts] = trimmedLine.split(":");
      const keyTrimmed = key.trim().toLowerCase();
      const value = valueParts.join(":").trim();

      if (keyTrimmed && value) {
        if (keyTrimmed === "user-agent") {
          currentUserAgent = value;
        } else if (keyTrimmed === "sitemap") {
          result.sitemaps.push(value);
        } else if (keyTrimmed === "disallow" && currentUserAgent === "*") {
          result.disallows.push(value);
        } else if (keyTrimmed === "allow" && currentUserAgent === "*") {
          result.allows.push(value);
        } else if (keyTrimmed === "host") {
          result.host = value;
        }
      }
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `HTTP Error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        result.errors.push("No response received from robots.txt server.");
      } else {
        result.errors.push(`Request Error: ${error.message}`);
      }
    } else {
      result.errors.push(`Unknown Error: ${error.message}`);
    }
  }

  return result;
}
