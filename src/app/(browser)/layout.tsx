import { NavHeader } from "@/components/browser/nav-header";
import { ToastProvider } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/server";

export default async function BrowserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <>
      <NavHeader
        user={
          user && profile
            ? {
                id: user.id,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
              }
            : null
        }
      />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </>
  );
}
