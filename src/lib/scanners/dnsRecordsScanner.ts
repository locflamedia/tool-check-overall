import { promises as dns } from "dns";
import { URL } from "url";

interface DnsRecordsResult {
  a: string[] | null;
  aaaa: string[] | null;
  cname: string[] | null;
  ns: string[] | null;
  mx: string[] | null;
  txt: string[] | null;
  errors: string[];
}

export async function scanDnsRecords(url: string): Promise<DnsRecordsResult> {
  const result: DnsRecordsResult = {
    a: null,
    aaaa: null,
    cname: null,
    ns: null,
    mx: null,
    txt: null,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Look up A records
    try {
      const aRecords = await dns.resolve4(hostname);
      result.a = aRecords;
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`A record lookup failed: ${err.message}`);
      }
    }

    // Look up AAAA records
    try {
      const aaaaRecords = await dns.resolve6(hostname);
      result.aaaa = aaaaRecords;
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`AAAA record lookup failed: ${err.message}`);
      }
    }

    // Look up CNAME records
    try {
      const cnameRecords = await dns.resolveCname(hostname);
      result.cname = cnameRecords;
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`CNAME record lookup failed: ${err.message}`);
      }
    }

    // Look up NS records
    try {
      const nsRecords = await dns.resolveNs(hostname);
      result.ns = nsRecords;
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`NS record lookup failed: ${err.message}`);
      }
    }

    // Look up MX records
    try {
      const mxRecords = await dns.resolveMx(hostname);
      result.mx = mxRecords.map((mx) => mx.exchange);
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`MX record lookup failed: ${err.message}`);
      }
    }

    // Look up TXT records
    try {
      const txtRecords = await dns.resolveTxt(hostname);
      result.txt = txtRecords.map((txt) => txt.join(" "));
    } catch (err: any) {
      if (err.code !== "ENODATA" && err.code !== "NOTFOUND") {
        result.errors.push(`TXT record lookup failed: ${err.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`DNS Records scan failed: ${error.message}`);
  }

  return result;
}
