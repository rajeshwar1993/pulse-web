import type { Meta, StoryObj } from "@storybook/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";

function AuthErrorPage() {
  const t = useTranslations("auth.error");
  const tCommon = useTranslations("common");

  return (
    <AuthLayout>
      <div className="text-center space-y-4">
        <IconBadge color="rose" size="md">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </IconBadge>
        <Heading as="h1" size="md">
          {t("title")}
        </Heading>
        <p className="text-[var(--slate-500)]">{t("message")}</p>
        <div className="flex flex-col gap-3 pt-2">
          <Link href="/auth/login" className={buttonVariants()}>
            Try again
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--teal)] hover:text-[var(--teal-400)] transition-colors"
          >
            {tCommon("backToHome")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

const meta = {
  title: "Pages/Browser/AuthError",
  component: AuthErrorPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AuthErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
