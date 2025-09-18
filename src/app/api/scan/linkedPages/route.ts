import { NextResponse } from "next/server";
import { scanLinkedPages } from "@/lib/scanners/linkedPagesScanner";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scanLinkedPages(url);

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: result.errors.join(", ") },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Linked Pages scan failed: ${error.message}` },
      { status: 500 }
    );
  }
}
