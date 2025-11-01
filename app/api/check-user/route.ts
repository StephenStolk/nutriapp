import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { email } = await req.json();

  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const userExists = data.users.some((u) => u.email === email);

  return Response.json({ exists: userExists });
}
