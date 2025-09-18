import whois from "whois-json";
import { URL } from "url";

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

export async function scanDomainWhois(url: string): Promise<DomainWhoisResult> {
  const result: DomainWhoisResult = {
    domainName: null,
    registrar: null,
    whoisServer: null,
    creationDate: null,
    updatedDate: null,
    expirationDate: null,
    nameServers: null,
    status: null,
    emails: null,
    registrantName: null,
    registrantOrganization: null,
    registrantStreet: null,
    registrantCity: null,
    registrantState: null,
    registrantPostalCode: null,
    registrantCountry: null,
    rawWhois: null,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    const whoisData = await whois(hostname);

    if (whoisData) {
      result.domainName = whoisData.domainName || null;
      result.registrar = whoisData.registrar || null;
      result.whoisServer = whoisData.whoisServer || null;
      result.creationDate = whoisData.creationDate || null;
      result.updatedDate = whoisData.updatedDate || null;
      result.expirationDate = whoisData.expirationDate || null;
      result.nameServers = whoisData.nameServer
        ? Array.isArray(whoisData.nameServer)
          ? whoisData.nameServer
          : [whoisData.nameServer]
        : null;
      result.status = whoisData.status || null;
      result.emails = whoisData.emails
        ? Array.isArray(whoisData.emails)
          ? whoisData.emails
          : [whoisData.emails]
        : null;
      result.registrantName = whoisData.registrantName || null;
      result.registrantOrganization = whoisData.registrantOrganization || null;
      result.registrantStreet = whoisData.registrantStreet || null;
      result.registrantCity = whoisData.registrantCity || null;
      result.registrantState = whoisData.registrantState || null;
      result.registrantPostalCode = whoisData.registrantPostalCode || null;
      result.registrantCountry = whoisData.registrantCountry || null;
      result.rawWhois = JSON.stringify(whoisData, null, 2);
    } else {
      result.errors.push("No WHOIS data found for this domain.");
    }
  } catch (error: any) {
    result.errors.push(`Domain Whois scan failed: ${error.message}`);
  }

  return result;
}
