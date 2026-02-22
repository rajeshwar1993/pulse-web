import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PulseLogo } from "@/components/ui/pulse-logo";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="min-h-screen bg-[var(--off-white)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PulseLogo className="w-24 h-24 mx-auto mb-6 opacity-30" />
        <h1 className="text-5xl font-bold text-[var(--teal)] mb-4">404</h1>
        <h2 className="text-xl font-semibold text-[var(--slate-900)] mb-2">
          {t("title")}
        </h2>
        <p className="text-[var(--slate-600)] mb-8">{t("message")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--teal)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}
