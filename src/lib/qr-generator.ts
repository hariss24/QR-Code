import QRCode from "qrcode";

export async function generateQrBuffer(text: string) {
  return QRCode.toBuffer(text, { errorCorrectionLevel: "H", margin: 1, width: 1024 });
}
