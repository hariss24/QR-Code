import { NextResponse } from "next/server";
import { z } from "zod";

const row = z.object({ name: z.string(), url: z.string().url() });

export async function POST(request: Request) {
  const body = z.array(row).safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  return NextResponse.json({ accepted: body.data.length });
}
