import axios from "axios";

export interface ShareSocialResult {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  errors: string[];
}

export async function scanShareSocial(url: string): Promise<ShareSocialResult> {
  const result: ShareSocialResult = {
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    errors: [],
  };

  try {
    const response = await axios.get(url);
    const html = response.data;

    const getMetaContent = (
      htmlString: string,
      property: string,
    ): string | null => {
      const regex = new RegExp(
        `<meta[^>]*?property="${property}"[^>]*?content="([^"]*?)"`,
        "i",
      );
      const match = htmlString.match(regex);
      return match && match[1] ? match[1] : null;
    };

    const getTwitterMetaContent = (
      htmlString: string,
      name: string,
    ): string | null => {
      const regex = new RegExp(
        `<meta[^>]*?name="${name}"[^>]*?content="([^"]*?)"`,
        "i",
      );
      const match = htmlString.match(regex);
      return match && match[1] ? match[1] : null;
    };

    result.ogTitle = getMetaContent(html, "og:title");
    result.ogDescription = getMetaContent(html, "og:description");
    result.ogImage = getMetaContent(html, "og:image");

    result.twitterTitle = getTwitterMetaContent(html, "twitter:title");
    result.twitterDescription = getTwitterMetaContent(
      html,
      "twitter:description",
    );
    result.twitterImage = getTwitterMetaContent(html, "twitter:image");
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      result.errors.push(
        `Error fetching URL for share social scan: ${error.message}`,
      );
    } else {
      result.errors.push(
        `Unknown error during share social scan: ${error.message}`,
      );
    }
  }

  return result;
}
