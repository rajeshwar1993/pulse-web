import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AuthError() {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-[var(--rose)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--slate-900)] mb-2">
            {t("error.title")}
          </h1>
          <p className="text-[var(--slate-600)]">{t("error.message")}</p>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--teal)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          {tCommon("backToHome")}
        </Link>
      </div>
    </div>
  );
}
