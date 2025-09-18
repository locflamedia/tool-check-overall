import { NextRequest, NextResponse } from "next/server";
import { scanSeo } from "@/lib/scanners/seoScanner";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const result = await scanSeo(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SEO scanning error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
