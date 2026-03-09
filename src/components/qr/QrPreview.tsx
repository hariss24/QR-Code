"use client";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
  fg: string;
  bg: string;
  size?: number;
}

export function QrPreview({ value, fg, bg, size = 220 }: Props) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border bg-white p-6">
      <QRCodeSVG
        value={value || "https://example.com"}
        fgColor={fg}
        bgColor={bg}
        size={size}
        level="M"
      />
    </div>
  );
}
