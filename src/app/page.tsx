import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FeatureItem } from "@/components/landing/feature-item";
import { StepCard } from "@/components/landing/step-card";
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
    <main className="min-h-screen bg-[var(--off-white)]">
      {/* Hero */}
      <section className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-2xl mx-auto text-center">
          <PulseLogo className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-8" />
          <Heading as="h1" size="xl" className="text-[var(--teal)] mb-4">
            {tCommon("appName")}
          </Heading>
          <p className="text-xl sm:text-2xl text-[var(--slate-700)] font-medium mb-3">
            {tCommon("tagline")}
          </p>
          <p className="text-[var(--slate-500)] text-lg mb-10 max-w-md mx-auto">
            {tLanding("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className={buttonVariants({ size: "md" })}
            >
              {tLanding("getStarted")}
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              {tLanding("logIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <Heading
            as="h2"
            size="lg"
            className="text-center text-[var(--slate-800)] mb-12"
          >
            {tLanding("howItWorks")}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <StepCard
              number={1}
              title={tLanding("step1Title")}
              description={tLanding("step1Desc")}
            />
            <StepCard
              number={2}
              title={tLanding("step2Title")}
              description={tLanding("step2Desc")}
            />
            <StepCard
              number={3}
              title={tLanding("step3Title")}
              description={tLanding("step3Desc")}
            />
          </div>
        </div>
      </section>

      {/* Why Pulse */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <Heading
            as="h2"
            size="lg"
            className="text-center text-[var(--slate-800)] mb-4"
          >
            {tLanding("whyPulse")}
          </Heading>
          <p className="text-center text-[var(--slate-500)] mb-10 max-w-lg mx-auto">
            {tLanding("whyDesc")}
          </p>
          <ul className="space-y-4 max-w-md mx-auto">
            <FeatureItem text={tLanding("featureSimple")} />
            <FeatureItem text={tLanding("featurePrivate")} />
            <FeatureItem text={tLanding("featureFamily")} />
            <FeatureItem text={tLanding("featureFree")} />
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-16 sm:py-20 bg-[var(--teal-50)]">
        <div className="max-w-xl mx-auto text-center">
          <Heading as="h2" size="lg" className="text-[var(--slate-800)] mb-3">
            {tLanding("ctaTitle")}
          </Heading>
          <p className="text-[var(--slate-500)] mb-8">
            {tLanding("ctaSubtitle")}
          </p>
          <Link href="/auth/signup" className={buttonVariants({ size: "md" })}>
            {tLanding("getStarted")}
          </Link>
        </div>
      </section>
    </main>
  );
}
