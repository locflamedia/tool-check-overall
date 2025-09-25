import { NextResponse } from "next/server";
import { scanDnsRecords } from "@/lib/scanners/dnsRecordsScanner";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scanDnsRecords(url);

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: result.errors.join(", ") },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: `DNS Records scan failed: ${error.message}` },
      { status: 500 },
    );
  }
}
