import { NextRequest, NextResponse } from "next/server";
import { scanShareSocial } from "@/lib/scanners/shareSocialScanner";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scanShareSocial(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in share social scan API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
