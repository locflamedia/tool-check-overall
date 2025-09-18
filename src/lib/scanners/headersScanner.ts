import axios from "axios";
import { URL } from "url";

interface HeadersResult {
  server: string | null;
  date: string | null;
  contentType: string | null;
  transferEncoding: string | null;
  connection: string | null;
  vary: string | null;
  xPoweredBy: string | null;
  xFrameOptions: string | null;
  xXssProtection: string | null;
  xContentTypeOptions: string | null;
  referrerPolicy: string | null;
  contentSecurityPolicy: string | null;
  strictTransportSecurity: string | null;
  errors: string[];
}

export async function scanHeaders(url: string): Promise<HeadersResult> {
  const result: HeadersResult = {
    server: null,
    date: null,
    contentType: null,
    transferEncoding: null,
    connection: null,
    vary: null,
    xPoweredBy: null,
    xFrameOptions: null,
    xXssProtection: null,
    xContentTypeOptions: null,
    referrerPolicy: null,
    contentSecurityPolicy: null,
    strictTransportSecurity: null,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    const response = await axios.head(url, { maxRedirects: 5 }); // Use HEAD request to get headers without downloading body

    const headers = response.headers;

    result.server = headers.server || null;
    result.date = headers.date || null;
    result.contentType = headers["content-type"] || null;
    result.transferEncoding = headers["transfer-encoding"] || null;
    result.connection = headers.connection || null;
    result.vary = headers.vary || null;
    result.xPoweredBy = headers["x-powered-by"] || null;
    result.xFrameOptions = headers["x-frame-options"] || null;
    result.xXssProtection = headers["x-xss-protection"] || null;
    result.xContentTypeOptions = headers["x-content-type-options"] || null;
    result.referrerPolicy = headers["referrer-policy"] || null;
    result.contentSecurityPolicy = headers["content-security-policy"] || null;
    result.strictTransportSecurity =
      headers["strict-transport-security"] || null;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      result.errors.push(
        `HTTP status ${error.response.status} when fetching headers.`
      );
      const headers = error.response.headers;
      result.server = headers.server || null;
      result.date = headers.date || null;
      result.contentType = headers["content-type"] || null;
      result.transferEncoding = headers["transfer-encoding"] || null;
      result.connection = headers.connection || null;
      result.vary = headers.vary || null;
      result.xPoweredBy = headers["x-powered-by"] || null;
      result.xFrameOptions = headers["x-frame-options"] || null;
      result.xXssProtection = headers["x-xss-protection"] || null;
      result.xContentTypeOptions = headers["x-content-type-options"] || null;
      result.referrerPolicy = headers["referrer-policy"] || null;
      result.contentSecurityPolicy = headers["content-security-policy"] || null;
      result.strictTransportSecurity =
        headers["strict-transport-security"] || null;
    } else if (error.request) {
      // The request was made but no response was received
      result.errors.push(
        `No response received for headers scan: ${error.message}`
      );
    } else {
      // Something else happened in setting up the request that triggered an Error
      result.errors.push(`Headers scan failed: ${error.message}`);
    }
  }

  return result;
}
