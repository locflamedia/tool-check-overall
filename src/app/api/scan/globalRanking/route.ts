import { NextResponse } from "next/server";
import { scanGlobalRanking } from "@/lib/scanners/globalRankingScanner";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scanGlobalRanking(url);

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: result.errors.join(", ") },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Global Ranking scan failed: ${error.message}` },
      { status: 500 }
    );
  }
}
