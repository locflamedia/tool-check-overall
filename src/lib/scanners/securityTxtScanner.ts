import axios from "axios";
import { URL } from "url";

interface SecurityTxtResult {
  exists: boolean;
  content: string | null;
  errors: string[];
}

export async function scanSecurityTxt(url: string): Promise<SecurityTxtResult> {
  const result: SecurityTxtResult = {
    exists: false,
    content: null,
    errors: [],
  };

  try {
    const parsedUrl = new URL(url);
    const securityTxtUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}/.well-known/security.txt`;

    const response = await axios.get(securityTxtUrl, {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 404,
    });

    if (response.status === 200) {
      result.exists = true;
      result.content = response.data;
    } else if (response.status === 404) {
      result.exists = false;
      result.content = null;
    } else {
      result.errors.push(
        `Failed to fetch security.txt: HTTP status ${response.status}`
      );
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      result.errors.push(
        `Failed to fetch security.txt: HTTP status ${error.response.status}`
      );
    } else {
      result.errors.push(`Security.txt scan failed: ${error.message}`);
    }
  }

  return result;
}
