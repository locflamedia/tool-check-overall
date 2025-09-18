import { URL } from "url";

interface ArchiveHistoryResult {
  firstScan: string | null;
  lastScan: string | null;
  totalScans: number | null;
  changeCount: number | null;
  avgSize: string | null;
  avgDaysBetweenScans: number | null;
  internetArchiveUrl: string;
  errors: string[];
}

export async function scanArchiveHistory(
  url: string
): Promise<ArchiveHistoryResult> {
  const result: ArchiveHistoryResult = {
    firstScan: null,
    lastScan: null,
    totalScans: null,
    changeCount: null,
    avgSize: null,
    avgDaysBetweenScans: null,
    internetArchiveUrl: `https://web.archive.org/web/*/${url}`,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // In a real-world scenario, this would involve calling the Internet Archive's CDX API
    // or a similar service to fetch historical data.
    // For this mock implementation, we'll simulate some data.

    const now = new Date();
    const tenMonthsAgo = new Date(now.setMonth(now.getMonth() - 10))
      .toISOString()
      .split("T")[0];
    const fiveMonthsAgo = new Date(now.setMonth(now.getMonth() + 5))
      .toISOString()
      .split("T")[0];

    result.firstScan = tenMonthsAgo;
    result.lastScan = fiveMonthsAgo;
    result.totalScans = Math.floor(Math.random() * 100) + 10; // Random between 10 and 109
    result.changeCount = Math.floor(Math.random() * 20) + 5; // Random between 5 and 24
    result.avgSize = `${(Math.random() * 500 + 100).toFixed(0)} KB`; // Random between 100 and 600 KB
    result.avgDaysBetweenScans = parseFloat(
      (Math.random() * 30 + 10).toFixed(2)
    ); // Random between 10 and 40 days

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
  } catch (error: any) {
    result.errors.push(`Archive History scan failed: ${error.message}`);
  }

  return result;
}
