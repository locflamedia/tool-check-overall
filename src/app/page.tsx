"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import axios from "axios";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define individual result interfaces for type safety and clarity
interface RobotsTxtResult {
  rawContent: string | null;
  sitemaps: string[];
  disallows: string[];
  allows: string[];
  host: string | null;
  errors: string[];
}

interface SitemapResult {
  sitemapUrls: string[];
  urls: string[];
  errors: string[];
}

interface SeoResult {
  title: string | null;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  h1s: string[];
  h2s: string[];
  imgAltTagsMissing: string[];
  schemaMarkups: string[];
  errors: string[];
}

interface PageSpeedResult {
  overallScore: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  si: number | null;
  errors: string[];
}

interface SecurityResult {
  hsts: boolean;
  csp: boolean;
  xContentTypeOptions: boolean;
  xFrameOptions: boolean;
  referrerPolicy: boolean;
  errors: string[];
}

interface MobileFriendlinessResult {
  hasViewportMeta: boolean;
  isMobileFriendly: boolean | null;
  mobileFriendlyTestUrl: string | null;
  errors: string[];
}

interface AccessibilityResult {
  imgAltTagsMissing: string[];
  futureEnhancements: string;
}

interface SslCertificateResult {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  asn1Curve: string | undefined;
  nistCurve: string | undefined;
  expires: string | null;
  renewed: string | null;
  serialNum: string;
  fingerprint: string;
  extendedKeyUsage: string[] | undefined;
  tlsWebServerAuthentication: boolean;
  errors: string[];
}

interface DomainWhoisResult {
  domainName: string | null;
  registrar: string | null;
  whoisServer: string | null;
  creationDate: string | null;
  updatedDate: string | null;
  expirationDate: string | null;
  nameServers: string[] | null;
  status: string | null;
  emails: string[] | null;
  registrantName: string | null;
  registrantOrganization: string | null;
  registrantStreet: string | null;
  registrantCity: string | null;
  registrantState: string | null;
  registrantPostalCode: string | null;
  registrantCountry: string | null;
  rawWhois: string | null;
  errors: string[];
}

interface HeadersResult {
  server: string | null;
  date: string | null;
  contentType: string | null;
  transferEncoding: string | null;
  connection: string | null;
  vary: string | null;
  xPoweredBy: string | null;
  xFrameOptions: string | null;
  xXssProtection: string | null;
  xContentTypeOptions: string | null;
  referrerPolicy: string | null;
  contentSecurityPolicy: string | null;
  strictTransportSecurity: string | null;
  errors: string[];
}

interface DnsRecordsResult {
  a: string[] | null;
  aaaa: string[] | null;
  cname: string[] | null;
  ns: string[] | null;
  mx: string[] | null;
  txt: string[] | null;
  errors: string[];
}

interface SecurityTxtResult {
  exists: boolean;
  content: string | null;
  errors: string[];
}

interface ThreatsResult {
  phishingStatus: "No Phishing Found" | "Phishing Detected" | "N/A";
  errors: string[];
}

interface DnssecResult {
  dnskeyPresent: boolean | null;
  dsPresent: boolean | null;
  rrsigPresent: boolean | null;
  errors: string[];
}

interface HstsCheckResult {
  hstsEnabled: boolean;
  errors: string[];
}

interface TlsSecurityIssuesResult {
  issuesFound: boolean;
  details: string[] | null;
  errors: string[];
}

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

interface GlobalRankingResult {
  globalRank: number | null;
  changeSinceYesterday: string | null;
  historicalAverageRank: number | null;
  errors: string[];
}

interface TlsCipherSuitesResult {
  cipherSuites: string[];
  errors: string[];
}

interface RedirectInfo {
  from: string;
  to: string;
  status: number;
}

interface LinkedPage {
  url: string;
  isInternal: boolean;
  text: string;
  type: string; // Add this missing property as it's used in the JSX
}

interface TlsHandshakeSimulationResult {
  tlsVersion: string | null;
  cipherSuite: string | null;
  kexStrength: string | null;
  errors: string[];
}

interface RedirectsResult {
  hasRedirects: boolean;
  redirectCount: number;
  redirectChain: RedirectInfo[];
  finalUrl: string;
  errors: string[];
}

interface LinkedPagesResult {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  sampleLinks: LinkedPage[];
  errors: string[];
}

interface CarbonFootprintResult {
  estimatedCarbonKg: number | null;
  comparisonToAverage: string | null;
  greenEnergyUsage: boolean | null;
  errors: string[];
}

interface BlockListEntry {
  provider: string;
  status: "Listed" | "Not Listed" | "N/A";
  details: string | null;
}

interface BlockListsResult {
  blockListed: boolean;
  providersChecked: BlockListEntry[];
  errors: string[];
}

// Function to calculate score (simple example)
const calculateScore = (
  errors: string[],
  value: boolean | number | null = null,
  threshold: number = 1
) => {
  if (errors.length > 0) return 0; // Failed scan
  if (typeof value === "boolean") {
    return value ? 100 : 0;
  }
  if (value !== null && threshold !== undefined) {
    return value >= threshold ? 100 : 50; // Pass/Warn based on threshold
  }
  return 100; // Passed with no specific value check
};

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  // Derived state for a URL that is always valid for the URL constructor
  const displayUrlForTools = url.startsWith("http") ? url : `https://${url}`;

  // Individual loading states and results for each scanner
  const [robotsTxtLoading, setRobotsTxtLoading] = useState<boolean>(false);
  const [robotsTxtResult, setRobotsTxtResult] =
    useState<RobotsTxtResult | null>(null);
  const [robotsTxtError, setRobotsTxtError] = useState<string | null>(null);

  const [sitemapLoading, setSitemapLoading] = useState<boolean>(false);
  const [sitemapResult, setSitemapResult] = useState<SitemapResult | null>(
    null
  );
  const [sitemapError, setSitemapError] = useState<string | null>(null);

  const [seoLoading, setSeoLoading] = useState<boolean>(false);
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

  const [pagespeedLoading, setPagespeedLoading] = useState<boolean>(false);
  const [pagespeedResult, setPagespeedResult] =
    useState<PageSpeedResult | null>(null);
  const [pagespeedError, setPagespeedError] = useState<string | null>(null);

  const [securityLoading, setSecurityLoading] = useState<boolean>(false);
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(
    null
  );
  const [securityError, setSecurityError] = useState<string | null>(null);

  const [mobileFriendlinessLoading, setMobileFriendlinessLoading] =
    useState<boolean>(false);
  const [mobileFriendlinessResult, setMobileFriendlinessResult] =
    useState<MobileFriendlinessResult | null>(null);
  const [mobileFriendlinessError, setMobileFriendlinessError] = useState<
    string | null
  >(null);

  const [accessibilityResult, setAccessibilityResult] =
    useState<AccessibilityResult | null>(null);
  const [accessibilityError, setAccessibilityError] = useState<string | null>(
    null
  );

  // New scanner states and results
  const [sslCertificateLoading, setSslCertificateLoading] =
    useState<boolean>(false);
  const [sslCertificateResult, setSslCertificateResult] =
    useState<SslCertificateResult | null>(null);
  const [sslCertificateError, setSslCertificateError] = useState<string | null>(
    null
  );

  const [domainWhoisLoading, setDomainWhoisLoading] = useState<boolean>(false);
  const [domainWhoisResult, setDomainWhoisResult] =
    useState<DomainWhoisResult | null>(null);
  const [domainWhoisError, setDomainWhoisError] = useState<string | null>(null);

  const [headersLoading, setHeadersLoading] = useState<boolean>(false);
  const [headersResult, setHeadersResult] = useState<HeadersResult | null>(
    null
  );
  const [headersError, setHeadersError] = useState<string | null>(null);

  // New scanner states and results (Batch 2)
  const [dnsRecordsLoading, setDnsRecordsLoading] = useState<boolean>(false);
  const [dnsRecordsResult, setDnsRecordsResult] =
    useState<DnsRecordsResult | null>(null);
  const [dnsRecordsError, setDnsRecordsError] = useState<string | null>(null);

  const [securityTxtLoading, setSecurityTxtLoading] = useState<boolean>(false);
  const [securityTxtResult, setSecurityTxtResult] =
    useState<SecurityTxtResult | null>(null);
  const [securityTxtError, setSecurityTxtError] = useState<string | null>(null);

  const [threatsLoading, setThreatsLoading] = useState<boolean>(false);
  const [threatsResult, setThreatsResult] = useState<ThreatsResult | null>(
    null
  );
  const [threatsError, setThreatsError] = useState<string | null>(null);

  // New scanner states and results (Batch 3)
  const [dnssecLoading, setDnssecLoading] = useState<boolean>(false);
  const [dnssecResult, setDnssecResult] = useState<DnssecResult | null>(null);
  const [dnssecError, setDnssecError] = useState<string | null>(null);

  const [hstsCheckLoading, setHstsCheckLoading] = useState<boolean>(false);
  const [hstsCheckResult, setHstsCheckResult] =
    useState<HstsCheckResult | null>(null);
  const [hstsCheckError, setHstsCheckError] = useState<string | null>(null);

  const [tlsSecurityIssuesLoading, setTlsSecurityIssuesLoading] =
    useState<boolean>(false);
  const [tlsSecurityIssuesResult, setTlsSecurityIssuesResult] =
    useState<TlsSecurityIssuesResult | null>(null);
  const [tlsSecurityIssuesError, setTlsSecurityIssuesError] = useState<
    string | null
  >(null);

  // New scanner states and results (Batch 4)
  const [archiveHistoryLoading, setArchiveHistoryLoading] =
    useState<boolean>(false);
  const [archiveHistoryResult, setArchiveHistoryResult] =
    useState<ArchiveHistoryResult | null>(null);
  const [archiveHistoryError, setArchiveHistoryError] = useState<string | null>(
    null
  );

  const [globalRankingLoading, setGlobalRankingLoading] =
    useState<boolean>(false);
  const [globalRankingResult, setGlobalRankingResult] =
    useState<GlobalRankingResult | null>(null);
  const [globalRankingError, setGlobalRankingError] = useState<string | null>(
    null
  );

  const [tlsCipherSuitesLoading, setTlsCipherSuitesLoading] =
    useState<boolean>(false);
  const [tlsCipherSuitesResult, setTlsCipherSuitesResult] =
    useState<TlsCipherSuitesResult | null>(null);
  const [tlsCipherSuitesError, setTlsCipherSuitesError] = useState<
    string | null
  >(null);

  // New scanner states and results (Batch 5)
  const [tlsHandshakeSimulationLoading, setTlsHandshakeSimulationLoading] =
    useState<boolean>(false);
  const [tlsHandshakeSimulationResult, setTlsHandshakeSimulationResult] =
    useState<TlsHandshakeSimulationResult | null>(null);
  const [tlsHandshakeSimulationError, setTlsHandshakeSimulationError] =
    useState<string | null>(null);

  const [redirectsLoading, setRedirectsLoading] = useState<boolean>(false);
  const [redirectsResult, setRedirectsResult] =
    useState<RedirectsResult | null>(null);
  const [redirectsError, setRedirectsError] = useState<string | null>(null);

  const [linkedPagesLoading, setLinkedPagesLoading] = useState<boolean>(false);
  const [linkedPagesResult, setLinkedPagesResult] =
    useState<LinkedPagesResult | null>(null);
  const [linkedPagesError, setLinkedPagesError] = useState<string | null>(null);

  // New scanner states and results (Batch 6)
  const [carbonFootprintLoading, setCarbonFootprintLoading] =
    useState<boolean>(false);
  const [carbonFootprintResult, setCarbonFootprintResult] =
    useState<CarbonFootprintResult | null>(null);
  const [carbonFootprintError, setCarbonFootprintError] = useState<
    string | null
  >(null);

  const [blockListsLoading, setBlockListsLoading] = useState<boolean>(false);
  const [blockListsResult, setBlockListsResult] =
    useState<BlockListsResult | null>(null);
  const [blockListsError, setBlockListsError] = useState<string | null>(null);

  // State for raw data dialog
  const [showRawDataDialog, setShowRawDataDialog] = useState<boolean>(false);
  const [rawDataTitle, setRawDataTitle] = useState<string>("");
  const [rawDataContent, setRawDataContent] = useState<string>("");

  const openRawDataDialog = useCallback((title: string, data: any) => {
    setRawDataTitle(title);
    setRawDataContent(JSON.stringify(data, null, 2));
    setShowRawDataDialog(true);
  }, []);

  const closeRawDataDialog = useCallback(() => {
    setShowRawDataDialog(false);
    setRawDataTitle("");
    setRawDataContent("");
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(rawDataContent);
    // Optionally, add a toast notification here
  }, [rawDataContent]);

  const handleScan = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    setRobotsTxtResult(null);
    setRobotsTxtError(null);
    setSitemapResult(null);
    setSitemapError(null);
    setSeoResult(null);
    setSeoError(null);
    setPagespeedResult(null);
    setPagespeedError(null);
    setSecurityResult(null);
    setSecurityError(null);
    setMobileFriendlinessResult(null);
    setMobileFriendlinessError(null);
    setAccessibilityResult(null);
    setAccessibilityError(null);

    // Reset new scanner states and results
    setSslCertificateResult(null);
    setSslCertificateError(null);
    setDomainWhoisResult(null);
    setDomainWhoisError(null);
    setHeadersResult(null);
    setHeadersError(null);
    setDnsRecordsResult(null);
    setDnsRecordsError(null);
    setSecurityTxtResult(null);
    setSecurityTxtError(null);
    setThreatsResult(null);
    setThreatsError(null);
    setDnssecResult(null);
    setDnssecError(null);
    setHstsCheckResult(null);
    setHstsCheckError(null);
    setTlsSecurityIssuesResult(null);
    setTlsSecurityIssuesError(null);
    setArchiveHistoryResult(null);
    setArchiveHistoryError(null);
    setGlobalRankingResult(null);
    setGlobalRankingError(null);
    setTlsCipherSuitesResult(null);
    setTlsCipherSuitesError(null);
    setTlsHandshakeSimulationResult(null);
    setTlsHandshakeSimulationError(null);
    setRedirectsResult(null);
    setRedirectsError(null);
    setLinkedPagesResult(null);
    setLinkedPagesError(null);

    // Reset new scanner states and results (Batch 6)
    setCarbonFootprintResult(null);
    setCarbonFootprintError(null);
    setBlockListsResult(null);
    setBlockListsError(null);

    const baseUrl = url.startsWith("http") ? url : `https://${url}`;

    const runScan = async (
      scannerName: string,
      setLoading: Function,
      setError: Function,
      setResult: Function,
      payload: any = { url: baseUrl }
    ) => {
      setLoading(true);
      try {
        const response = await axios.post(`/api/scan/${scannerName}`, payload);
        setResult(response.data);
        return { status: "fulfilled", value: response.data };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || `Failed to scan ${scannerName}`;
        setError(errorMessage);
        return { status: "rejected", reason: errorMessage };
      } finally {
        setLoading(false);
      }
    };

    // Run independent scans in parallel
    const [
      robotsTxtPromise,
      seoPromise,
      pagespeedPromise,
      securityPromise,
      mobileFriendlinessPromise,
      // New scanners
      sslCertificatePromise,
      domainWhoisPromise,
      headersPromise,
      dnsRecordsPromise,
      securityTxtPromise,
      threatsPromise,
      dnssecPromise,
      hstsCheckPromise,
      tlsSecurityIssuesPromise,
      archiveHistoryPromise,
      globalRankingPromise,
      tlsCipherSuitesPromise,
      tlsHandshakeSimulationPromise,
      redirectsPromise,
      linkedPagesPromise,
      // New scanners (Batch 6)
      carbonFootprintPromise,
      blockListsPromise,
    ] = await Promise.allSettled([
      runScan(
        "robotsTxt",
        setRobotsTxtLoading,
        setRobotsTxtError,
        setRobotsTxtResult
      ),
      runScan("seo", setSeoLoading, setSeoError, setSeoResult),
      runScan(
        "pagespeed",
        setPagespeedLoading,
        setPagespeedError,
        setPagespeedResult
      ),
      runScan(
        "security",
        setSecurityLoading,
        setSecurityError,
        setSecurityResult
      ),
      runScan(
        "mobileFriendliness",
        setMobileFriendlinessLoading,
        setMobileFriendlinessError,
        setMobileFriendlinessResult
      ),
      runScan(
        "sslCertificate",
        setSslCertificateLoading,
        setSslCertificateError,
        setSslCertificateResult
      ),
      runScan(
        "domainWhois",
        setDomainWhoisLoading,
        setDomainWhoisError,
        setDomainWhoisResult
      ),
      runScan("headers", setHeadersLoading, setHeadersError, setHeadersResult),
      runScan(
        "dnsRecords",
        setDnsRecordsLoading,
        setDnsRecordsError,
        setDnsRecordsResult
      ),
      runScan(
        "securityTxt",
        setSecurityTxtLoading,
        setSecurityTxtError,
        setSecurityTxtResult
      ),
      runScan("threats", setThreatsLoading, setThreatsError, setThreatsResult),
      runScan("dnssec", setDnssecLoading, setDnssecError, setDnssecResult),
      runScan(
        "hstsCheck",
        setHstsCheckLoading,
        setHstsCheckError,
        setHstsCheckResult
      ),
      runScan(
        "tlsSecurityIssues",
        setTlsSecurityIssuesLoading,
        setTlsSecurityIssuesError,
        setTlsSecurityIssuesResult
      ),
      runScan(
        "archiveHistory",
        setArchiveHistoryLoading,
        setArchiveHistoryError,
        setArchiveHistoryResult
      ),
      runScan(
        "globalRanking",
        setGlobalRankingLoading,
        setGlobalRankingError,
        setGlobalRankingResult
      ),
      runScan(
        "tlsCipherSuites",
        setTlsCipherSuitesLoading,
        setTlsCipherSuitesError,
        setTlsCipherSuitesResult
      ),
      runScan(
        "tlsHandshakeSimulation",
        setTlsHandshakeSimulationLoading,
        setTlsHandshakeSimulationError,
        setTlsHandshakeSimulationResult
      ),
      runScan(
        "redirects",
        setRedirectsLoading,
        setRedirectsError,
        setRedirectsResult
      ),
      runScan(
        "linkedPages",
        setLinkedPagesLoading,
        setLinkedPagesError,
        setLinkedPagesResult
      ),
      // New scanners (Batch 6)
      runScan(
        "carbonFootprint",
        setCarbonFootprintLoading,
        setCarbonFootprintError,
        setCarbonFootprintResult
      ),
      runScan(
        "blockLists",
        setBlockListsLoading,
        setBlockListsError,
        setBlockListsResult
      ),
    ]);

    // Handle dependent scans
    let currentRobotsTxtResult: RobotsTxtResult | null = null;
    if (robotsTxtPromise.status === "fulfilled") {
      currentRobotsTxtResult =
        robotsTxtPromise.value as unknown as RobotsTxtResult;
    } else {
      setRobotsTxtError(
        robotsTxtPromise.reason ||
          "Failed to get robots.txt data for sitemap scan dependency"
      );
    }

    // Sitemap Scan (depends on robotsTxtResult)
    setSitemapLoading(true);
    try {
      const response = await axios.post("/api/scan/sitemap", {
        url: baseUrl,
        robotsTxtSitemaps: currentRobotsTxtResult?.sitemaps || [],
      });
      setSitemapResult(response.data);
    } catch (err: any) {
      setSitemapError(err.response?.data?.error || "Failed to scan sitemap");
    } finally {
      setSitemapLoading(false);
    }

    let currentSeoResult: SeoResult | null = null;
    if (seoPromise.status === "fulfilled") {
      currentSeoResult = seoPromise.value as unknown as SeoResult;
      setAccessibilityResult({
        imgAltTagsMissing: currentSeoResult.imgAltTagsMissing,
        futureEnhancements:
          "Full accessibility audit with tools like axe-core requires a headless browser and is a future enhancement.",
      });
    } else {
      setSeoError(
        seoPromise.reason ||
          "Failed to get SEO data for accessibility scan dependency"
      );
      setAccessibilityError(
        "Failed to get basic accessibility info from SEO scan"
      );
    }

    setGlobalLoading(false);
  }, [url]); // Removed robotsTxtResult?.sitemaps from dependency array as it's handled internally

  const renderMetric = (
    label: string,
    value: string | number | null | undefined,
    unit: string = ""
  ) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {value !== null && value !== undefined ? `${value}${unit}` : "N/A"}
      </span>
    </div>
  );

  const renderStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">N/A</Badge>;
    return status ? (
      <Badge variant="default">Present</Badge>
    ) : (
      <Badge variant="destructive">Missing</Badge>
    );
  };

  const renderScoreBadge = (score: number) => {
    if (score >= 90)
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          Score: {score}
        </Badge>
      );
    if (score >= 50)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          Score: {score}
        </Badge>
      );
    return <Badge variant="destructive">Score: {score}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-[1440px] shadow-lg mt-8 mb-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Website Auditor
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
            />
            <Button
              onClick={handleScan}
              disabled={globalLoading || !url}
              className="sm:w-auto"
            >
              {globalLoading ? "Scanning..." : "Scan Website"}
            </Button>
          </div>

          {globalError && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4 text-red-700 dark:text-red-300">
                <h3 className="font-semibold text-lg mb-2">Global Error:</h3>
                <p className="text-base">{globalError}</p>
              </CardContent>
            </Card>
          )}

          {(globalLoading ||
            robotsTxtResult ||
            sitemapResult ||
            seoResult ||
            pagespeedResult ||
            securityResult ||
            mobileFriendlinessResult ||
            accessibilityResult ||
            // New scanner results
            sslCertificateResult ||
            domainWhoisResult ||
            headersResult ||
            dnsRecordsResult ||
            securityTxtResult ||
            threatsResult ||
            dnssecResult ||
            hstsCheckResult ||
            tlsSecurityIssuesResult ||
            archiveHistoryResult ||
            globalRankingResult ||
            tlsCipherSuitesResult ||
            tlsHandshakeSimulationResult ||
            redirectsResult ||
            linkedPagesResult ||
            // New scanner results (Batch 6)
            carbonFootprintResult ||
            blockListsResult) /* Ensure visibility when there's an error after loading as well. */ && (
            <div className="space-y-4 mt-6 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Results for {url}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Robots.txt */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Robots.txt</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Robots.txt", robotsTxtResult)
                        }
                        disabled={!robotsTxtResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {robotsTxtLoading && <Skeleton className="h-5 w-20" />}
                      {!robotsTxtLoading &&
                        robotsTxtResult &&
                        renderScoreBadge(
                          calculateScore(robotsTxtResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {robotsTxtError ? (
                        <p className="text-red-500">Error: {robotsTxtError}</p>
                      ) : robotsTxtResult ? (
                        <>
                          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm ">
                            {robotsTxtResult.rawContent ||
                              "No robots.txt found or empty."}
                          </pre>
                          {robotsTxtResult.sitemaps.length > 0 && (
                            <div>
                              <p className="font-medium mt-2 text-sm">
                                Sitemaps Found:
                              </p>
                              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                                {robotsTxtResult.sitemaps.map(
                                  (s: string, idx: number) => (
                                    <li key={idx}>
                                      <a
                                        href={s}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        {s}
                                      </a>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : robotsTxtLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-40 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze robots.txt.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* SSL Certificate */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">SSL Certificate</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "SSL Certificate",
                            sslCertificateResult
                          )
                        }
                        disabled={!sslCertificateResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {sslCertificateLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!sslCertificateLoading &&
                        sslCertificateResult &&
                        renderScoreBadge(
                          calculateScore(sslCertificateResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {sslCertificateError ? (
                        <p className="text-red-500">
                          Error: {sslCertificateError}
                        </p>
                      ) : sslCertificateResult ? (
                        <>
                          {renderMetric(
                            "Subject",
                            sslCertificateResult.subject.CN ||
                              Object.values(sslCertificateResult.subject).join(
                                ", "
                              )
                          )}
                          {renderMetric(
                            "Issuer",
                            sslCertificateResult.issuer.O ||
                              Object.values(sslCertificateResult.issuer).join(
                                ", "
                              )
                          )}
                          {renderMetric(
                            "Expires",
                            sslCertificateResult.expires
                          )}
                          {renderMetric(
                            "Renewed",
                            sslCertificateResult.renewed
                          )}
                          {renderMetric(
                            "Serial Num",
                            sslCertificateResult.serialNum
                          )}
                          {renderMetric(
                            "Fingerprint",
                            sslCertificateResult.fingerprint
                          )}
                          {renderMetric(
                            "ASN1 Curve",
                            sslCertificateResult.asn1Curve
                          )}
                          {renderMetric(
                            "Nist Curve",
                            sslCertificateResult.nistCurve
                          )}
                          {renderMetric(
                            "Extended Key Usage",
                            sslCertificateResult.extendedKeyUsage?.join(", ")
                          )}
                          {renderMetric(
                            "TLS Web Server Authentication",
                            sslCertificateResult.tlsWebServerAuthentication
                              ? "Yes"
                              : "No"
                          )}
                        </>
                      ) : sslCertificateLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze SSL certificate.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Domain Whois */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Domain Whois</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Domain Whois", domainWhoisResult)
                        }
                        disabled={!domainWhoisResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {domainWhoisLoading && <Skeleton className="h-5 w-20" />}
                      {!domainWhoisLoading &&
                        domainWhoisResult &&
                        renderScoreBadge(
                          calculateScore(domainWhoisResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {domainWhoisError ? (
                        <p className="text-red-500">
                          Error: {domainWhoisError}
                        </p>
                      ) : domainWhoisResult ? (
                        <>
                          {renderMetric(
                            "Domain Name",
                            domainWhoisResult.domainName
                          )}
                          {renderMetric(
                            "Registrar",
                            domainWhoisResult.registrar
                          )}
                          {renderMetric(
                            "Whois Server",
                            domainWhoisResult.whoisServer
                          )}
                          {renderMetric(
                            "Creation Date",
                            domainWhoisResult.creationDate
                          )}
                          {renderMetric(
                            "Updated Date",
                            domainWhoisResult.updatedDate
                          )}
                          {renderMetric(
                            "Expiration Date",
                            domainWhoisResult.expirationDate
                          )}
                          {renderMetric(
                            "Name Servers",
                            domainWhoisResult.nameServers?.join(", ")
                          )}
                          {renderMetric("Status", domainWhoisResult.status)}
                          {renderMetric(
                            "Emails",
                            domainWhoisResult.emails?.join(", ")
                          )}
                          {renderMetric(
                            "Registrant Name",
                            domainWhoisResult.registrantName
                          )}
                          {renderMetric(
                            "Registrant Organization",
                            domainWhoisResult.registrantOrganization
                          )}
                          {renderMetric(
                            "Registrant Country",
                            domainWhoisResult.registrantCountry
                          )}
                        </>
                      ) : domainWhoisLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze domain Whois.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Headers */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Headers</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Headers", headersResult)
                        }
                        disabled={!headersResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {headersLoading && <Skeleton className="h-5 w-20" />}
                      {!headersLoading &&
                        headersResult &&
                        renderScoreBadge(calculateScore(headersResult.errors))}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {headersError ? (
                        <p className="text-red-500">Error: {headersError}</p>
                      ) : headersResult ? (
                        <>
                          {renderMetric("Server", headersResult.server)}
                          {renderMetric("Date", headersResult.date)}
                          {renderMetric(
                            "Content-Type",
                            headersResult.contentType
                          )}
                          {renderMetric(
                            "Transfer-Encoding",
                            headersResult.transferEncoding
                          )}
                          {renderMetric("Connection", headersResult.connection)}
                          {renderMetric("Vary", headersResult.vary)}
                          {renderMetric(
                            "X-Powered-By",
                            headersResult.xPoweredBy
                          )}
                          {renderMetric(
                            "X-Frame-Options",
                            headersResult.xFrameOptions
                          )}
                          {renderMetric(
                            "X-XSS-Protection",
                            headersResult.xXssProtection
                          )}
                          {renderMetric(
                            "X-Content-Type-Options",
                            headersResult.xContentTypeOptions
                          )}
                          {renderMetric(
                            "Referrer-Policy",
                            headersResult.referrerPolicy
                          )}
                          {renderMetric(
                            "Content-Security-Policy",
                            headersResult.contentSecurityPolicy
                          )}
                          {renderMetric(
                            "Strict-Transport-Security",
                            headersResult.strictTransportSecurity
                          )}
                        </>
                      ) : headersLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze headers.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sitemap */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Sitemap</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Sitemap", sitemapResult)
                        }
                        disabled={!sitemapResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {sitemapLoading && <Skeleton className="h-5 w-20" />}
                      {!sitemapLoading &&
                        sitemapResult &&
                        renderScoreBadge(
                          calculateScore(
                            sitemapResult.errors,
                            sitemapResult.urls.length,
                            1
                          )
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {sitemapError ? (
                        <p className="text-red-500 text-sm">
                          Error: {sitemapError}
                        </p>
                      ) : sitemapResult ? (
                        sitemapResult.urls.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
                            <p className="font-medium text-sm">
                              Found {sitemapResult.urls.length} URLs across{" "}
                              {sitemapResult.sitemapUrls.length} sitemap(s):
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                              {sitemapResult.urls
                                .slice(0, 10)
                                .map((u: string, idx: number) => (
                                  <li key={idx}>
                                    <a
                                      href={u}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {u}
                                    </a>
                                  </li>
                                ))}
                              {sitemapResult.urls.length > 10 && (
                                <li className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                                  ...and {sitemapResult.urls.length - 10} more.
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            No sitemap URLs found.
                          </p>
                        )
                      ) : sitemapLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-40 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze sitemap.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* SEO Details */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">SEO Details</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("SEO Details", seoResult)
                        }
                        disabled={!seoResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {seoLoading && <Skeleton className="h-5 w-20" />}
                      {!seoLoading &&
                        seoResult &&
                        renderScoreBadge(
                          calculateScore(
                            seoResult.errors,
                            seoResult.imgAltTagsMissing.length === 0
                          )
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {seoError ? (
                        <p className="text-red-500 text-sm">
                          Error: {seoError}
                        </p>
                      ) : seoResult ? (
                        <>
                          {renderMetric("Title", seoResult.title || null)}
                          {renderMetric(
                            "Description",
                            seoResult.description || null
                          )}
                          {renderMetric(
                            "Robots Meta",
                            seoResult.robots || null
                          )}
                          {renderMetric(
                            "Canonical",
                            seoResult.canonical || null
                          )}
                          {seoResult.h1s.length > 0 &&
                            renderMetric(
                              "H1s",
                              seoResult.h1s.join(", ") || null
                            )}
                          {seoResult.h2s.length > 0 &&
                            renderMetric(
                              "H2s",
                              seoResult.h2s.join(", ") || null
                            )}

                          {seoResult.imgAltTagsMissing.length > 0 && (
                            <Collapsible className="space-y-2">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="link"
                                  className="!p-0 flex justify-between items-center w-full"
                                >
                                  <span className="font-medium text-yellow-600 dark:text-yellow-400 text-sm">
                                    Missing Image Alt Tags:
                                  </span>
                                  <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                                    {seoResult.imgAltTagsMissing.length} found
                                    <ChevronDown className="h-4 w-4 inline-block ml-2" />
                                  </span>
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                                  {seoResult.imgAltTagsMissing.map(
                                    (src: string, idx: number) => (
                                      <li key={idx}>{src}</li>
                                    )
                                  )}
                                </ul>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {seoResult.schemaMarkups.length > 0 && (
                            <Collapsible className="space-y-2 mt-2">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="link"
                                  className="!p-0 flex justify-between items-center w-full"
                                >
                                  <span className="font-medium mt-2 text-sm">
                                    Schema Markups Found (
                                    {seoResult.schemaMarkups.length}):
                                  </span>
                                  <ChevronDown className="h-4 w-4 inline-block ml-2" />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-y-auto whitespace-pre-wrap text-sm">
                                  {seoResult.schemaMarkups.map(
                                    (s: string, idx: number) => (
                                      <span key={idx} className="block mb-2">
                                        {s}
                                      </span>
                                    )
                                  )}
                                </pre>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </>
                      ) : seoLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze SEO details.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Performance (PageSpeed) */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        Performance (PageSpeed)
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Performance (PageSpeed)",
                            pagespeedResult
                          )
                        }
                        disabled={!pagespeedResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {pagespeedLoading && <Skeleton className="h-5 w-20" />}
                      {!pagespeedLoading &&
                        pagespeedResult &&
                        renderScoreBadge(pagespeedResult.overallScore || 0)}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {pagespeedError ? (
                        <p className="text-red-500 text-sm">
                          Error: {pagespeedError}
                        </p>
                      ) : pagespeedResult ? (
                        pagespeedResult.overallScore !== null ? (
                          <div className="space-y-2">
                            {renderMetric(
                              "Overall Score",
                              pagespeedResult.overallScore
                            )}
                            {renderMetric(
                              "FCP",
                              pagespeedResult.fcp?.toFixed(2),
                              "s"
                            )}
                            {renderMetric(
                              "LCP",
                              pagespeedResult.lcp?.toFixed(2),
                              "s"
                            )}
                            {renderMetric(
                              "CLS",
                              pagespeedResult.cls?.toFixed(3)
                            )}
                            {renderMetric(
                              "TBT",
                              pagespeedResult.tbt?.toFixed(2),
                              "ms"
                            )}
                            {renderMetric(
                              "Speed Index",
                              pagespeedResult.si?.toFixed(2),
                              "s"
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            No performance data available.
                          </p>
                        )
                      ) : pagespeedLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze performance.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security Headers */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        Security Headers
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Security Headers", securityResult)
                        }
                        disabled={!securityResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {securityLoading && <Skeleton className="h-5 w-20" />}
                      {!securityLoading &&
                        securityResult &&
                        renderScoreBadge(
                          calculateScore(
                            securityResult.errors,
                            (Object.values(securityResult).filter(
                              (v) => typeof v === "boolean" && v === true
                            ).length /
                              5) *
                              100,
                            100
                          )
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {securityError ? (
                        <p className="text-red-500 text-sm">
                          Error: {securityError}
                        </p>
                      ) : securityResult ? (
                        <div className="grid grid-cols-2 gap-y-2 items-center">
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            HSTS:
                          </p>
                          {renderStatusBadge(securityResult.hsts)}
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            CSP:
                          </p>
                          {renderStatusBadge(securityResult.csp)}
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            X-Content-Type-Options:
                          </p>
                          {renderStatusBadge(
                            securityResult.xContentTypeOptions
                          )}
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            X-Frame-Options:
                          </p>
                          {renderStatusBadge(securityResult.xFrameOptions)}
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Referrer-Policy:
                          </p>
                          {renderStatusBadge(securityResult.referrerPolicy)}
                        </div>
                      ) : securityLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze security headers.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mobile Friendliness */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        Mobile Friendliness
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Mobile Friendliness",
                            mobileFriendlinessResult
                          )
                        }
                        disabled={!mobileFriendlinessResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {mobileFriendlinessLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!mobileFriendlinessLoading &&
                        mobileFriendlinessResult &&
                        renderScoreBadge(
                          calculateScore(
                            mobileFriendlinessResult.errors,
                            mobileFriendlinessResult.isMobileFriendly
                          )
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {mobileFriendlinessError ? (
                        <p className="text-red-500 text-sm">
                          Error: {mobileFriendlinessError}
                        </p>
                      ) : mobileFriendlinessResult ? (
                        <>
                          {renderMetric(
                            "Has Viewport Meta Tag",
                            mobileFriendlinessResult.hasViewportMeta
                              ? "Yes"
                              : "No"
                          )}
                          {mobileFriendlinessResult.isMobileFriendly !==
                          null ? (
                            renderMetric(
                              "Is Mobile Friendly (Google Test)",
                              mobileFriendlinessResult.isMobileFriendly
                                ? "Yes"
                                : "No"
                            )
                          ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Mobile friendly test data not available.
                            </p>
                          )}
                          {mobileFriendlinessResult.mobileFriendlyTestUrl && (
                            <div className="flex justify-between items-center py-1">
                              <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Mobile-Friendly Test URL:
                              </span>
                              <a
                                href={
                                  mobileFriendlinessResult.mobileFriendlyTestUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                              >
                                Link
                              </a>
                            </div>
                          )}
                        </>
                      ) : mobileFriendlinessLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze mobile friendliness.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Accessibility Placeholder */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Accessibility</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Accessibility",
                            accessibilityResult
                          )
                        }
                        disabled={!accessibilityResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {globalLoading && <Skeleton className="h-5 w-20" />}
                      {!globalLoading &&
                        accessibilityResult &&
                        accessibilityResult.imgAltTagsMissing && // Add this check
                        renderScoreBadge(
                          calculateScore(
                            accessibilityResult.imgAltTagsMissing,
                            accessibilityResult.imgAltTagsMissing.length === 0
                          )
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {accessibilityError ? (
                        <p className="text-red-500 text-sm">
                          Error: {accessibilityError}
                        </p>
                      ) : accessibilityResult ? (
                        <>
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Missing Image Alt Tags (from SEO scan):
                          </p>
                          {accessibilityResult.imgAltTagsMissing &&
                          accessibilityResult.imgAltTagsMissing.length > 0 ? (
                            <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                              {accessibilityResult.imgAltTagsMissing.map(
                                (src: string, idx: number) => (
                                  <li key={idx}>{src}</li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              No missing image alt tags found.
                            </p>
                          )}
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            {accessibilityResult.futureEnhancements}
                          </p>
                        </>
                      ) : globalLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-40 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze accessibility.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* DNS Records */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">DNS Records</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("DNS Records", dnsRecordsResult)
                        }
                        disabled={!dnsRecordsResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {dnsRecordsLoading && <Skeleton className="h-5 w-20" />}
                      {!dnsRecordsLoading &&
                        dnsRecordsResult &&
                        renderScoreBadge(
                          calculateScore(dnsRecordsResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {dnsRecordsError ? (
                        <p className="text-red-500">Error: {dnsRecordsError}</p>
                      ) : dnsRecordsResult ? (
                        <>
                          {renderMetric(
                            "A Records",
                            dnsRecordsResult.a?.join(", ")
                          )}
                          {renderMetric(
                            "AAAA Records",
                            dnsRecordsResult.aaaa?.join(", ")
                          )}
                          {renderMetric(
                            "CNAME Records",
                            dnsRecordsResult.cname?.join(", ")
                          )}
                          {renderMetric(
                            "NS Records",
                            dnsRecordsResult.ns?.join(", ")
                          )}
                          {renderMetric(
                            "MX Records",
                            dnsRecordsResult.mx?.join(", ")
                          )}
                          {renderMetric(
                            "TXT Records",
                            dnsRecordsResult.txt?.join(", ")
                          )}
                        </>
                      ) : dnsRecordsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze DNS records.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security.txt */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Security.txt</CardTitle>
                      {securityTxtLoading && <Skeleton className="h-5 w-20" />}
                      {!securityTxtLoading &&
                        securityTxtResult &&
                        renderScoreBadge(
                          calculateScore(securityTxtResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {securityTxtError ? (
                        <p className="text-red-500">
                          Error: {securityTxtError}
                        </p>
                      ) : securityTxtResult ? (
                        <>
                          {renderMetric(
                            "Security.txt Exists",
                            securityTxtResult.exists ? "Yes" : "No"
                          )}
                          {securityTxtResult.content && (
                            <div>
                              <p className="font-medium text-sm">Content:</p>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
                                {securityTxtResult.content}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : securityTxtLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze Security.txt.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Threats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Threats</CardTitle>
                      {threatsLoading && <Skeleton className="h-5 w-20" />}
                      {!threatsLoading &&
                        threatsResult &&
                        renderScoreBadge(calculateScore(threatsResult.errors))}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {threatsError ? (
                        <p className="text-red-500">Error: {threatsError}</p>
                      ) : threatsResult ? (
                        <>
                          {renderMetric(
                            "Phishing Status",
                            threatsResult.phishingStatus
                          )}
                        </>
                      ) : threatsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze threats.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* DNSSEC */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">DNSSEC</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("DNSSEC", dnssecResult)
                        }
                        disabled={!dnssecResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {dnssecLoading && <Skeleton className="h-5 w-20" />}
                      {!dnssecLoading &&
                        dnssecResult &&
                        renderScoreBadge(calculateScore(dnssecResult.errors))}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {dnssecError ? (
                        <p className="text-red-500">Error: {dnssecError}</p>
                      ) : dnssecResult ? (
                        <>
                          {renderMetric(
                            "DNSKEY Present",
                            dnssecResult.dnskeyPresent ? "Yes" : "No"
                          )}
                          {renderMetric(
                            "DS Present",
                            dnssecResult.dsPresent ? "Yes" : "No"
                          )}
                          {renderMetric(
                            "RRSIG Present",
                            dnssecResult.rrsigPresent ? "Yes" : "No"
                          )}
                        </>
                      ) : dnssecLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze DNSSEC.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* HSTS Check */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">HSTS Check</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("HSTS Check", hstsCheckResult)
                        }
                        disabled={!hstsCheckResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {hstsCheckLoading && <Skeleton className="h-5 w-20" />}
                      {!hstsCheckLoading &&
                        hstsCheckResult &&
                        renderScoreBadge(
                          calculateScore(hstsCheckResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {hstsCheckError ? (
                        <p className="text-red-500">Error: {hstsCheckError}</p>
                      ) : hstsCheckResult ? (
                        <>
                          {renderMetric(
                            "HSTS Enabled",
                            hstsCheckResult.hstsEnabled ? "Yes" : "No"
                          )}
                        </>
                      ) : hstsCheckLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze HSTS.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TLS Security Issues */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        TLS Security Issues
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "TLS Security Issues",
                            tlsSecurityIssuesResult
                          )
                        }
                        disabled={!tlsSecurityIssuesResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {tlsSecurityIssuesLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!tlsSecurityIssuesLoading &&
                        tlsSecurityIssuesResult &&
                        renderScoreBadge(
                          calculateScore(tlsSecurityIssuesResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {tlsSecurityIssuesError ? (
                        <p className="text-red-500">
                          Error: {tlsSecurityIssuesError}
                        </p>
                      ) : tlsSecurityIssuesResult ? (
                        <>
                          {renderMetric(
                            "Issues Found",
                            tlsSecurityIssuesResult.issuesFound ? "Yes" : "No"
                          )}
                          {tlsSecurityIssuesResult.details &&
                            tlsSecurityIssuesResult.details.length > 0 && (
                              <div>
                                <p className="font-medium text-sm">Details:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                  {tlsSecurityIssuesResult.details.map(
                                    (detail, idx) => (
                                      <li key={idx}>{detail}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </>
                      ) : tlsSecurityIssuesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze TLS security issues.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Archive History */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Archive History</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Archive History",
                            archiveHistoryResult
                          )
                        }
                        disabled={!archiveHistoryResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {archiveHistoryLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!archiveHistoryLoading &&
                        archiveHistoryResult &&
                        renderScoreBadge(
                          calculateScore(archiveHistoryResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {archiveHistoryError ? (
                        <p className="text-red-500">
                          Error: {archiveHistoryError}
                        </p>
                      ) : archiveHistoryResult ? (
                        <>
                          {renderMetric(
                            "First Scan",
                            archiveHistoryResult.firstScan
                          )}
                          {renderMetric(
                            "Last Scan",
                            archiveHistoryResult.lastScan
                          )}
                          {renderMetric(
                            "Total Scans",
                            archiveHistoryResult.totalScans
                          )}
                          {renderMetric(
                            "Change Count",
                            archiveHistoryResult.changeCount
                          )}
                          {renderMetric(
                            "Average Size",
                            archiveHistoryResult.avgSize
                          )}
                          {renderMetric(
                            "Average Days Between Scans",
                            archiveHistoryResult.avgDaysBetweenScans
                          )}
                          {renderMetric(
                            "Internet Archive URL",
                            archiveHistoryResult.internetArchiveUrl
                          )}
                        </>
                      ) : archiveHistoryLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze archive history.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Global Ranking */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Global Ranking</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Global Ranking",
                            globalRankingResult
                          )
                        }
                        disabled={!globalRankingResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {globalRankingLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!globalRankingLoading &&
                        globalRankingResult &&
                        renderScoreBadge(
                          calculateScore(globalRankingResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {globalRankingError ? (
                        <p className="text-red-500">
                          Error: {globalRankingError}
                        </p>
                      ) : globalRankingResult ? (
                        <>
                          {renderMetric(
                            "Global Rank",
                            globalRankingResult.globalRank
                          )}
                          {renderMetric(
                            "Change Since Yesterday",
                            globalRankingResult.changeSinceYesterday
                          )}
                          {renderMetric(
                            "Historical Average Rank",
                            globalRankingResult.historicalAverageRank
                          )}
                        </>
                      ) : globalRankingLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze global ranking.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TLS Cipher Suites */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        TLS Cipher Suites
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "TLS Cipher Suites",
                            tlsCipherSuitesResult
                          )
                        }
                        disabled={!tlsCipherSuitesResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {tlsCipherSuitesLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!tlsCipherSuitesLoading &&
                        tlsCipherSuitesResult &&
                        renderScoreBadge(
                          calculateScore(tlsCipherSuitesResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {tlsCipherSuitesError ? (
                        <p className="text-red-500">
                          Error: {tlsCipherSuitesError}
                        </p>
                      ) : tlsCipherSuitesResult ? (
                        <>
                          {renderMetric(
                            "Cipher Suites",
                            tlsCipherSuitesResult.cipherSuites.join(", ")
                          )}
                        </>
                      ) : tlsCipherSuitesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze TLS cipher suites.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TLS Handshake Simulation */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        TLS Handshake Simulation
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "TLS Handshake Simulation",
                            tlsHandshakeSimulationResult
                          )
                        }
                        disabled={!tlsHandshakeSimulationResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {tlsHandshakeSimulationLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!tlsHandshakeSimulationLoading &&
                        tlsHandshakeSimulationResult &&
                        renderScoreBadge(
                          calculateScore(tlsHandshakeSimulationResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {tlsHandshakeSimulationError ? (
                        <p className="text-red-500">
                          Error: {tlsHandshakeSimulationError}
                        </p>
                      ) : tlsHandshakeSimulationResult ? (
                        <>
                          {renderMetric(
                            "TLS Version",
                            tlsHandshakeSimulationResult.tlsVersion
                          )}
                          {renderMetric(
                            "Cipher Suite",
                            tlsHandshakeSimulationResult.cipherSuite
                          )}
                          {renderMetric(
                            "Key Exchange Strength",
                            tlsHandshakeSimulationResult.kexStrength
                          )}
                        </>
                      ) : tlsHandshakeSimulationLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze TLS handshake
                          simulation.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Redirects */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Redirects</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Redirects", redirectsResult)
                        }
                        disabled={!redirectsResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {redirectsLoading && <Skeleton className="h-5 w-20" />}
                      {!redirectsLoading &&
                        redirectsResult &&
                        renderScoreBadge(
                          calculateScore(redirectsResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {redirectsError ? (
                        <p className="text-red-500">Error: {redirectsError}</p>
                      ) : redirectsResult ? (
                        <>
                          {renderMetric(
                            "Has Redirects",
                            redirectsResult.hasRedirects ? "Yes" : "No"
                          )}
                          {renderMetric(
                            "Redirect Count",
                            redirectsResult.redirectCount
                          )}
                          {redirectsResult.redirectChain.length > 0 && (
                            <div>
                              <p className="font-medium text-sm">
                                Redirect Chain:
                              </p>
                              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {redirectsResult.redirectChain.map((r, idx) => (
                                  <li key={idx}>
                                    {r.from} ({r.status})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {redirectsResult.finalUrl && (
                            <div className="flex justify-between items-center py-1">
                              <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Final URL:
                              </span>
                              <a
                                href={redirectsResult.finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                              >
                                {redirectsResult.finalUrl}
                              </a>
                            </div>
                          )}
                        </>
                      ) : redirectsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze redirects.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Linked Pages */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Linked Pages</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Linked Pages", linkedPagesResult)
                        }
                        disabled={!linkedPagesResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {linkedPagesLoading && <Skeleton className="h-5 w-20" />}
                      {!linkedPagesLoading &&
                        linkedPagesResult &&
                        renderScoreBadge(
                          calculateScore(linkedPagesResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {linkedPagesError ? (
                        <p className="text-red-500">
                          Error: {linkedPagesError}
                        </p>
                      ) : linkedPagesResult ? (
                        <>
                          {renderMetric(
                            "Total Links",
                            linkedPagesResult.totalLinks
                          )}
                          {renderMetric(
                            "Internal Links",
                            linkedPagesResult.internalLinks
                          )}
                          {renderMetric(
                            "External Links",
                            linkedPagesResult.externalLinks
                          )}
                          {linkedPagesResult.sampleLinks.length > 0 && (
                            <div>
                              <p className="font-medium text-sm">
                                Sample Links:
                              </p>
                              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {linkedPagesResult.sampleLinks.map((l, idx) => (
                                  <li key={idx}>
                                    {l.url} (Type: {l.type})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : linkedPagesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze linked pages.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Carbon Footprint */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        Carbon Footprint
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog(
                            "Carbon Footprint",
                            carbonFootprintResult
                          )
                        }
                        disabled={!carbonFootprintResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {carbonFootprintLoading && (
                        <Skeleton className="h-5 w-20" />
                      )}
                      {!carbonFootprintLoading &&
                        carbonFootprintResult &&
                        renderScoreBadge(
                          calculateScore(carbonFootprintResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {carbonFootprintError ? (
                        <p className="text-red-500">
                          Error: {carbonFootprintError}
                        </p>
                      ) : carbonFootprintResult ? (
                        <>
                          {renderMetric(
                            "Estimated Carbon (kg)",
                            carbonFootprintResult.estimatedCarbonKg
                          )}
                          {renderMetric(
                            "Comparison to Average",
                            carbonFootprintResult.comparisonToAverage
                          )}
                          {renderMetric(
                            "Green Energy Usage",
                            carbonFootprintResult.greenEnergyUsage
                              ? "Yes"
                              : "No"
                          )}
                        </>
                      ) : carbonFootprintLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze carbon footprint.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Block Lists */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Block Lists</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openRawDataDialog("Block Lists", blockListsResult)
                        }
                        disabled={!blockListsResult}
                        className="ml-auto"
                      >
                        View Raw Data
                      </Button>
                      {blockListsLoading && <Skeleton className="h-5 w-20" />}
                      {!blockListsLoading &&
                        blockListsResult &&
                        renderScoreBadge(
                          calculateScore(blockListsResult.errors)
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {blockListsError ? (
                        <p className="text-red-500">Error: {blockListsError}</p>
                      ) : blockListsResult ? (
                        <>
                          {renderMetric(
                            "Block Listed",
                            blockListsResult.blockListed ? "Yes" : "No"
                          )}
                          {blockListsResult.providersChecked.length > 0 && (
                            <div>
                              <p className="font-medium text-sm">
                                Providers Checked:
                              </p>
                              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {blockListsResult.providersChecked.map(
                                  (p, idx) => (
                                    <li key={idx}>
                                      {p.provider} - {p.status}
                                      {p.details && (
                                        <span className="text-gray-500 dark:text-gray-500">
                                          ({p.details})
                                        </span>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : blockListsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze block lists.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Data Dialog */}
      <AlertDialog open={showRawDataDialog} onOpenChange={setShowRawDataDialog}>
        <AlertDialogContent className="sm:max-w-[800px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{rawDataTitle} - Raw Data</AlertDialogTitle>
            <AlertDialogDescription>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto max-h-[60vh]">
                {rawDataContent}
              </pre>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
            <Button onClick={closeRawDataDialog}>Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* External Tools Section */}
      <Card className="w-full max-w-[1440px] shadow-lg mt-8 mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            External Tools for Further Research
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "SSL Labs",
              url: `https://www.ssllabs.com/ssltest/analyze.html?d=${url}`,
            },
            {
              name: "Google PageSpeed Insights",
              url: `https://pagespeed.web.dev/report?url=${url}`,
            },
            {
              name: "Google Mobile-Friendly Test",
              url: `https://search.google.com/test/mobile-friendly?url=${url}`,
            },
            {
              name: "Internet Archive Wayback Machine",
              url: `https://web.archive.org/web/*/${url}`,
            },
            {
              name: "Whois Lookup",
              url: `https://whois.domaintools.com/${
                url ? new URL(displayUrlForTools).hostname : ""
              }`,
            },
            {
              name: "DNS Checker",
              url: `https://dnschecker.org/#A/${
                url ? new URL(displayUrlForTools).hostname : ""
              }`,
            },
            {
              name: "SecurityHeaders.com",
              url: `https://securityheaders.com/?q=${url}`,
            },
            {
              name: "VirusTotal",
              url: `https://www.virustotal.com/gui/url/${url}`,
            },
            {
              name: "Google Search Console",
              url: `https://search.google.com/search-console/about`,
            },
            {
              name: "Bing Webmaster Tools",
              url: `https://www.bing.com/webmasters/about`,
            },
          ].map((tool, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                <h3 className="font-semibold text-lg">{tool.name}</h3>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Analyze with {tool.name}
                </a>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
