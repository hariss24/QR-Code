import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ name: z.string().optional(), content: z.record(z.any()).optional(), foregroundColor: z.string().optional(), backgroundColor: z.string().optional() });

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.qrCode.findUnique({ where: { id: params.id } });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.qrCode.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.qrCode.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
