import QRCode from "qrcode";

interface QrOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  width?: number;
}

export async function generateQrPng(text: string, opts: QrOptions = {}): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: opts.width ?? 1024,
    color: {
      dark: opts.foregroundColor ?? "#000000",
      light: opts.backgroundColor ?? "#FFFFFF",
    },
  });
}

export async function generateQrSvg(text: string, opts: QrOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: opts.width ?? 1024,
    color: {
      dark: opts.foregroundColor ?? "#000000",
      light: opts.backgroundColor ?? "#FFFFFF",
    },
  });
}
