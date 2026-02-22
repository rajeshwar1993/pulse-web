import { createBrowserClient } from "@supabase/ssr";

// biome-ignore lint/style/noNonNullAssertion: env vars validated on next line
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// biome-ignore lint/style/noNonNullAssertion: env vars validated on next line
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create browser client that reads from cookies
// This will automatically pick up the session injected by Flutter
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
