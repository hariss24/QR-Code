"use client";
import { QRCodeSVG } from "qrcode.react";

type Props = { value: string; fg: string; bg: string };

export function QrPreview({ value, fg, bg }: Props) {
  return <QRCodeSVG value={value || "https://example.com"} fgColor={fg} bgColor={bg} size={220} />;
}
