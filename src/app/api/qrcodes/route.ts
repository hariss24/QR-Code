import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/short-code";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({ name: z.string().min(2), type: z.string(), isDynamic: z.boolean(), content: z.record(z.any()) });

export async function GET() {
  const items = await prisma.qrCode.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!checkRateLimit(request.headers.get("x-forwarded-for") ?? "local")) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "User missing" }, { status: 400 });
  const created = await prisma.qrCode.create({ data: { ...parsed.data, shortCode: generateShortCode(), userId: user.id } });
  return NextResponse.json(created, { status: 201 });
}
