"use client";
import { useEffect, useState, useCallback } from "react";

interface QrCodeItem {
  id: string;
  name: string;
  shortCode: string;
  foregroundColor: string;
  backgroundColor: string;
  content: { url?: string };
  createdAt: string;
  _count: { scans: number };
}

export function useQrCodes() {
  const [data, setData] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/qrcodes")
      .then((r) => r.json())
      .then((d) => setData(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}
