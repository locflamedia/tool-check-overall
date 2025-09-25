import axios from "axios";

interface SecurityResult {
  hsts: boolean;
  csp: boolean;
  xContentTypeOptions: boolean;
  xFrameOptions: boolean;
  referrerPolicy: boolean;
  errors: string[];
}

export async function scanSecurityHeaders(
  url: string,
): Promise<SecurityResult> {
  const result: SecurityResult = {
    hsts: false,
    csp: false,
    xContentTypeOptions: false,
    xFrameOptions: false,
    referrerPolicy: false,
    errors: [],
  };

  try {
    const response = await axios.head(url, { timeout: 5000 });
    const headers = response.headers;

    result.hsts = "strict-transport-security" in headers;
    result.csp = "content-security-policy" in headers;
    result.xContentTypeOptions = "x-content-type-options" in headers;
    result.xFrameOptions = "x-frame-options" in headers;
    result.referrerPolicy = "referrer-policy" in headers;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `HTTP Error fetching headers (${url}): ${error.response.status} - ${error.response.statusText}`,
        );
      } else if (error.request) {
        result.errors.push(
          `No response received when fetching headers (${url}).`,
        );
      } else {
        result.errors.push(
          `Request Error fetching headers (${url}): ${error.message}`,
        );
      }
    } else {
      result.errors.push(
        `Unknown Error fetching headers (${url}): ${error.message}`,
      );
    }
  }

  return result;
}
