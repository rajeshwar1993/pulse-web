"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Heading } from "@/components/ui/heading";
import { revalidateProfilePages } from "@/lib/actions/profile";
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import {
  DISPLAY_NAME_MAX_LENGTH,
  sanitizeDisplayName,
  validateDisplayName,
} from "@/lib/utils/validation";

const AVATAR_SEEDS = [
  "felix",
  "aneka",
  "sam",
  "charlie",
  "alex",
  "jordan",
  "taylor",
  "morgan",
  "casey",
  "riley",
  "avery",
  "quinn",
  "sage",
  "river",
  "skyler",
];

export default function ProfileSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const t = useTranslations("profileSetup");
  const tCommon = useTranslations("common");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const avatarUrls = AVATAR_SEEDS.map(
    (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  );

  // Prefill profile data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;
        if (profile) {
          setDisplayName(profile.display_name ?? "");
          setSelectedAvatar(profile.avatar_url ?? null);
        }
      } catch (err) {
        logger.error("Error loading profile", err);
        setError(err instanceof Error ? err.message : t("error.loadFailed"));
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [isEditMode, t]);

  const isValid = validateDisplayName(displayName) === null && selectedAvatar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const sanitizedName = sanitizeDisplayName(displayName);
      const nameError = validateDisplayName(sanitizedName);
      if (nameError) {
        setError(nameError);
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(t("error.noUser"));

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            display_name: sanitizedName,
            avatar_url: selectedAvatar,
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
        await revalidateProfilePages();
        router.push("/appview/settings");
      } else {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email ?? "",
          display_name: sanitizedName,
          avatar_url: selectedAvatar,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        if (insertError) throw insertError;
        await revalidateProfilePages();
        router.push("/appview/dashboard");
      }
    } catch (err) {
      logger.error(
        isEditMode ? "Error updating profile" : "Error creating profile",
        err,
      );
      setError(
        err instanceof Error
          ? err.message
          : t(isEditMode ? "error.updateFailed" : "error.createFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <Heading as="h1" size="lg" className="text-black mb-8">
          {isEditMode ? t("editTitle") : t("title")}
        </Heading>

        {isLoadingProfile ? (
          <div className="text-center py-8 text-[var(--slate-500)]">
            {tCommon("loading")}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <Alert variant="error" className="mb-6">
                {error}
              </Alert>
            )}

            {/* Display Name */}
            <div className="mb-6">
              <FormInput
                label={t("displayNameLabel")}
                htmlFor="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={DISPLAY_NAME_MAX_LENGTH}
                placeholder={t("displayNamePlaceholder")}
                disabled={isLoading}
              />
              <div className="text-sm text-[var(--slate-500)] mt-1">
                {t("displayNameCount", { count: displayName.length })}
              </div>
            </div>

            {/* Avatar Gallery */}
            <div className="mb-6">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes the avatar gallery grid, not a single control */}
              <label className="block text-[var(--slate-700)] font-semibold mb-2">
                {t("chooseAvatar")}
              </label>
              <div className="grid grid-cols-5 gap-3">
                {avatarUrls.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    disabled={isLoading}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedAvatar === url
                        ? "border-[var(--teal)] ring-2 ring-[var(--teal)] ring-opacity-50"
                        : "border-[var(--slate-200)] hover:border-[var(--slate-400)]"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={t("avatarAlt")}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Avatar Preview */}
            {selectedAvatar && (
              <div className="mb-6">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: presentational label for avatar preview */}
                <label className="block text-[var(--slate-700)] font-semibold mb-2">
                  {t("selectedAvatar")}
                </label>
                <div className="w-32 h-32 mx-auto border-4 border-[var(--teal)] rounded-xl overflow-hidden">
                  <Image
                    src={selectedAvatar}
                    alt={t("selectedAlt")}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={!isValid || isLoading}
            >
              {isLoading
                ? isEditMode
                  ? t("saving")
                  : t("creating")
                : isEditMode
                  ? tCommon("save")
                  : t("continue")}
            </Button>
          </form>
        )}
      </div>
  );
}
