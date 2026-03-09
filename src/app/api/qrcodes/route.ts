import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/short-code";
import { checkRateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  foregroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#FFFFFF"),
});

export async function GET() {
  const items = await prisma.qrCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { scans: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let owner = await prisma.user.findFirst();
  if (!owner) {
    owner = await prisma.user.create({
      data: { email: "owner@qrgen.local", name: "Owner" },
    });
  }

  const { name, url, foregroundColor, backgroundColor } = parsed.data;

  const created = await prisma.qrCode.create({
    data: {
      name,
      type: "DYNAMIC_URL",
      isDynamic: true,
      shortCode: generateShortCode(),
      content: { url },
      foregroundColor,
      backgroundColor,
      userId: owner.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
