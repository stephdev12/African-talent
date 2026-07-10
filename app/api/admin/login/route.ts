import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD non configuré côté serveur." }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
