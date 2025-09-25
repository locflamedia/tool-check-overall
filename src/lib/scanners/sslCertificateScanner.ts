import tls from "tls";
import { URL } from "url";

interface SslCertificateResult {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  asn1Curve: string | undefined;
  nistCurve: string | undefined;
  expires: string | null;
  renewed: string | null; // This might be complex to determine, can be a placeholder.
  serialNum: string;
  fingerprint: string;
  extendedKeyUsage: string[] | undefined;
  tlsWebServerAuthentication: boolean;
  errors: string[];
}

export async function scanSslCertificate(
  url: string,
): Promise<SslCertificateResult> {
  const result: SslCertificateResult = {
    subject: {},
    issuer: {},
    asn1Curve: undefined,
    nistCurve: undefined,
    expires: null,
    renewed: null,
    serialNum: "",
    fingerprint: "",
    extendedKeyUsage: undefined,
    tlsWebServerAuthentication: false,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port ? parseInt(parsedUrl.port) : 443;

    await new Promise<void>((resolve, reject) => {
      const socket = tls.connect(
        {
          host: hostname,
          port: port,
          servername: hostname,
          rejectUnauthorized: false, // Set to true in production for proper validation
        },
        () => {
          const peerCertificate = socket.getPeerCertificate(true);
          if (peerCertificate) {
            result.subject = peerCertificate.subject;
            result.issuer = peerCertificate.issuer;
            result.expires = peerCertificate.valid_to;
            result.renewed = peerCertificate.valid_from; // Using valid_from as renewed date
            result.serialNum = peerCertificate.serialNumber;
            result.fingerprint = peerCertificate.fingerprint;
            result.asn1Curve = (peerCertificate as any).asn1Curve;
            result.nistCurve = (peerCertificate as any).nistCurve;

            if (peerCertificate.ext_key_usage) {
              result.extendedKeyUsage = peerCertificate.ext_key_usage;
              result.tlsWebServerAuthentication =
                peerCertificate.ext_key_usage.includes("1.3.6.1.5.5.7.3.1"); // OID for TLS Web Server Authentication
            }
          } else {
            result.errors.push("No peer certificate found.");
          }
          socket.destroy();
          resolve();
        },
      );

      socket.on("error", (err) => {
        result.errors.push(`TLS connection error: ${err.message}`);
        reject(err);
      });

      socket.on("timeout", () => {
        result.errors.push("TLS connection timed out.");
        socket.destroy();
        reject(new Error("TLS connection timed out."));
      });
    });
  } catch (error: any) {
    result.errors.push(`SSL Certificate scan failed: ${error.message}`);
  }

  return result;
}
