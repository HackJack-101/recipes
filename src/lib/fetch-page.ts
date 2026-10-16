import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 5 * 1024 * 1024;

export class ImportError extends Error {
  constructor(
    public code: "invalidUrl" | "blockedUrl" | "fetchFailed" | "tooLarge" | "noRecipe" | "aiFailed" | "notConfigured",
  ) {
    super(code);
  }
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const l = ip.toLowerCase();
  if (l.startsWith("::ffff:")) return isPrivateIp(l.slice(7));
  return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80");
}

async function assertPublicHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new ImportError("blockedUrl");
}

/** Downloads a web page server-side, blocking internal addresses (SSRF), redirects included. */
export async function fetchPage(rawUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ImportError("invalidUrl");
  }
  for (let hop = 0; hop < 5; hop++) {
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new ImportError("invalidUrl");
    await assertPublicHost(url.hostname);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; RecipesBot/1.0)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      throw new ImportError("fetchFailed");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    if (!res.ok || !res.body) throw new ImportError("fetchFailed");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      size += chunk.length;
      if (size > MAX_BYTES) throw new ImportError("tooLarge");
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new ImportError("fetchFailed");
}
