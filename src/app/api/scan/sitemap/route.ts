import { NextRequest, NextResponse } from "next/server";
import { scanSitemap } from "@/lib/scanners/sitemapScanner";

export async function POST(req: NextRequest) {
  const { url, robotsTxtSitemaps } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const result = await scanSitemap(url, robotsTxtSitemaps || []);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sitemap scanning error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
