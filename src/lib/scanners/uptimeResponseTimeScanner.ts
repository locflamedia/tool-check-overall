import axios from "axios";

export interface UptimeResponseTimeResult {
  responseTimeMs: number | null;
  isUp: boolean;
  errors: string[];
}

export async function scanUptimeResponseTime(
  url: string
): Promise<UptimeResponseTimeResult> {
  const result: UptimeResponseTimeResult = {
    responseTimeMs: null,
    isUp: false,
    errors: [],
  };

  try {
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 10000 }); // 10-second timeout
    const endTime = Date.now();

    result.responseTimeMs = endTime - startTime;
    result.isUp = response.status >= 200 && response.status < 300;
  } catch (error: any) {
    result.isUp = false; // If there's an error, the site is considered down or unreachable
    if (axios.isAxiosError(error)) {
      if (error.response) {
        result.errors.push(
          `HTTP status ${error.response.status} when checking domain.`
        );
      } else if (error.request) {
        result.errors.push(`No response received: ${error.message}`);
      } else {
        result.errors.push(`Request failed: ${error.message}`);
      }
    } else {
      result.errors.push(`Unknown error: ${error.message}`);
    }
  }

  return result;
}
