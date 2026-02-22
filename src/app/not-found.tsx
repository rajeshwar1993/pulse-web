import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { PulseLogo } from "@/components/ui/pulse-logo";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="min-h-screen bg-[var(--off-white)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PulseLogo className="w-24 h-24 mx-auto mb-6 opacity-30" />
        <Heading as="h1" size="xl" className="text-[var(--teal)] mb-4">
          404
        </Heading>
        <Heading as="h2" size="base" className="mb-2">
          {t("title")}
        </Heading>
        <p className="text-[var(--slate-600)] mb-8">{t("message")}</p>
        <Link href="/" className={buttonVariants()}>
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}
