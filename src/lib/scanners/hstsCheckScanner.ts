import axios from "axios";
import { URL } from "url";

interface HstsCheckResult {
  hstsEnabled: boolean;
  errors: string[];
}

export async function scanHstsCheck(url: string): Promise<HstsCheckResult> {
  const result: HstsCheckResult = {
    hstsEnabled: false,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);

    const response = await axios.head(url, { maxRedirects: 5 });

    if (response.headers["strict-transport-security"]) {
      result.hstsEnabled = true;
    } else {
      result.hstsEnabled = false;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      result.errors.push(
        `HTTP status ${error.response.status} when fetching headers for HSTS check.`
      );
    } else if (axios.isAxiosError(error) && error.request) {
      result.errors.push(
        `No response received for HSTS check: ${error.message}`
      );
    } else {
      result.errors.push(`HSTS Check scan failed: ${error.message}`);
    }
  }

  return result;
}
