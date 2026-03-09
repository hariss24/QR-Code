"use client";
import { useEffect, useState } from "react";

export function useQrCodes() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetch('/api/qrcodes').then((r) => r.json()).then((d) => setData(d.items ?? [])); }, []);
  return data;
}
