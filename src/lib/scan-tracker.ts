import UAParser from "ua-parser-js";

export function parseScan(headers: Headers) {
  const parser = new UAParser(headers.get("user-agent") ?? "");
  const result = parser.getResult();
  return {
    device: result.device.type ?? "desktop",
    os: result.os.name ?? "Unknown",
    browser: result.browser.name ?? "Unknown",
    country: headers.get("x-vercel-ip-country") ?? null,
    city: headers.get("x-vercel-ip-city") ?? null,
    referer: headers.get("referer") ?? null,
  };
}
