import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const candidates = (data || []).map((c: any) => ({
    ...c,
    total_votes: (c.paid_votes || 0) + (c.manual_votes || 0),
  }));
  return NextResponse.json({ candidates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, category, photoUrl, bio } = body as {
    fullName: string;
    category: "gospel" | "moderne_urbain";
    photoUrl?: string;
    bio?: string;
  };

  if (!fullName?.trim() || !category) {
    return NextResponse.json({ error: "Nom et catégorie requis." }, { status: 400 });
  }

  let baseSlug = slugify(fullName);
  let slug = baseSlug;
  let attempt = 1;
  // Assure l'unicité du slug (utilisé dans le lien direct)
  while (true) {
    const { data: existing } = await supabaseAdmin.from("candidates").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data, error } = await supabaseAdmin
    .from("candidates")
    .insert({
      full_name: fullName.trim(),
      category,
      slug,
      photo_url: photoUrl || null,
      bio: bio || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidate: data });
}
