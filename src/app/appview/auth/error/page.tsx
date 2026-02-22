import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";

export default async function AuthError() {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <IconBadge color="rose" size="lg" className="mx-auto mb-4">
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
          </IconBadge>
          <Heading as="h1" size="lg" className="mb-2">
            {t("error.title")}
          </Heading>
          <p className="text-[var(--slate-600)]">{t("error.message")}</p>
        </div>

        <Link href="/" className={buttonVariants()}>
          {tCommon("backToHome")}
        </Link>
      </div>
    </div>
  );
}
