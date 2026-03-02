import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { PulseLogo } from "@/components/ui/pulse-logo";

export default async function AppViewNotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <PulseLogo className="w-20 h-20 mx-auto mb-6 opacity-30" />
        <Heading as="h2" size="base" className="mb-2">
          {t("title")}
        </Heading>
        <p className="text-[var(--slate-600)] mb-6">{t("message")}</p>
        <Link href="/appview/dashboard" className={buttonVariants()}>
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
