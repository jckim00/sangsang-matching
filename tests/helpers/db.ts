import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yabnzaijcujfidsrzkxc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYm56YWlqY3VqZmlkc3J6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDIwMjksImV4cCI6MjA5MzY3ODAyOX0.m5MIbnw0MtXihhc8taSvZVQt7aUpwH4UrqIxp8WiZdc";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function resetDb() {
  // matches must be deleted first (FK → seniors, jobs)
  await db.from("matches").delete().not("id", "is", null);
  await db.from("seniors").delete().not("id", "is", null);
  await db.from("jobs").delete().not("id", "is", null);
}

export async function insertJob(job: {
  title: string;
  region: string;
  job_type: string;
  required_career: number;
}) {
  const { error } = await db.from("jobs").insert(job);
  if (error) throw new Error(`insertJob failed: ${error.message}`);
}

export async function getLatestSenior(): Promise<{ id: string; name: string }> {
  const { data, error } = await db
    .from("seniors")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(`getLatestSenior failed: ${error.message}`);
  return data;
}

export async function countSeniors(): Promise<number> {
  const { count, error } = await db
    .from("seniors")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`countSeniors failed: ${error.message}`);
  return count ?? 0;
}
