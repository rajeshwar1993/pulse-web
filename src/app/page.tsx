import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { PulseLogo } from "@/components/ui/pulse-logo";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();

    if (profile) {
      redirect("/dashboard");
    } else {
      redirect("/profile-setup");
    }
  }

  const tCommon = await getTranslations("common");
  const tLanding = await getTranslations("landing");

  return (
    <main className="min-h-screen bg-[var(--off-white)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PulseLogo className="w-32 h-32 mx-auto mb-6" />
        <Heading as="h1" size="xl" className="text-[var(--teal)] mb-4">
          {tCommon("appName")}
        </Heading>
        <p className="text-xl text-[var(--slate-600)] mb-2">
          {tCommon("tagline")}
        </p>
        <p className="text-[var(--slate-500)] mb-8">
          {tLanding("heroSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className={buttonVariants({ size: "md" })}>
            {tLanding("getStarted")}
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            {tLanding("logIn")}
          </Link>
        </div>
      </div>
    </main>
  );
}
