import UAParser from "ua-parser-js";

export async function parseScan(headers: Headers) {
  const parser = new UAParser(headers.get("user-agent") ?? "");
  const result = parser.getResult();
  return {
    device: result.device.type ?? "desktop",
    os: result.os.name ?? "Unknown",
    browser: result.browser.name ?? "Unknown"
  };
}
