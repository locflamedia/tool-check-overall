"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import axios from "axios";

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
            accessibilityResult) && (
            <div className="space-y-4 mt-6 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Results for {url}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  {/* Robots.txt */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Robots.txt</CardTitle>
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
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze robots.txt.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sitemap */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">Sitemap</CardTitle>
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
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
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
                            <div className="flex justify-between items-center py-1">
                              <span className="font-medium text-yellow-600 dark:text-yellow-400 text-sm">
                                Missing Image Alt Tags:
                              </span>
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                                {seoResult.imgAltTagsMissing.length} found
                              </span>
                            </div>
                          )}
                          {seoResult.imgAltTagsMissing.length > 0 && (
                            <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                              {seoResult.imgAltTagsMissing.map(
                                (src: string, idx: number) => (
                                  <li key={idx}>{src}</li>
                                )
                              )}
                            </ul>
                          )}

                          {seoResult.schemaMarkups.length > 0 && (
                            <div>
                              <p className="font-medium mt-2 text-sm">
                                Schema Markups Found (
                                {seoResult.schemaMarkups.length}):
                              </p>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-y-auto whitespace-pre-wrap text-sm">
                                {seoResult.schemaMarkups.map(
                                  (s: string, idx: number) => (
                                    <span key={idx} className="block mb-2">
                                      {s}
                                    </span>
                                  )
                                )}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
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
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
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
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
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
                      ) : globalLoading ? (
                        <Skeleton className="h-40 w-full" />
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
                        <Skeleton className="h-40 w-full" />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Click 'Scan Website' to analyze accessibility.
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
    </div>
  );
}
