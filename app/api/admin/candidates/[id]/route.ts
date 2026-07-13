import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ["full_name", "category", "photo_url", "bio", "is_active", "foreign_payment_url"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("candidates")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidate: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from("candidates").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
