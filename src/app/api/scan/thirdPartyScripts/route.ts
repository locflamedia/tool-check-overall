import { NextRequest, NextResponse } from "next/server";
import { scanThirdPartyScripts } from "@/lib/scanners/thirdPartyScriptsScanner";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scanThirdPartyScripts(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in third-party scripts scan API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
