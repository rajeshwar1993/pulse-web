"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { MISSED_PULSE_RESPONSES } from "@/lib/constants";
import { submitMissedPulseSurvey } from "@/lib/services/missed-pulse-service";
import type { MissedPulseResponse } from "@/lib/types/missed-pulse";

interface MissedPulseSurveyModalProps {
  missedDate: string;
  onComplete: () => void;
}

export function MissedPulseSurveyModal({
  missedDate,
  onComplete,
}: MissedPulseSurveyModalProps) {
  const t = useTranslations("dashboard.missedPulseSurvey");
  const [submitting, setSubmitting] = useState(false);

  const handleResponse = useCallback(
    async (response: MissedPulseResponse) => {
      setSubmitting(true);
      await submitMissedPulseSurvey(missedDate, response);
      onComplete();
    },
    [missedDate, onComplete],
  );

  const handleSkip = useCallback(() => {
    handleResponse("skipped");
  }, [handleResponse]);

  return (
    <Modal
      open={true}
      onClose={handleSkip}
      maxWidth="sm"
      padding="lg"
      ariaLabelledBy="missed-pulse-survey-title"
    >
      <div className="text-center space-y-4">
        <Heading as="h2" size="md" id="missed-pulse-survey-title">
          {t("title")}
        </Heading>
        <p className="text-[var(--slate-600)]">{t("subtitle")}</p>

        <div className="space-y-3 pt-2">
          {MISSED_PULSE_RESPONSES.map((key) => (
            <Button
              key={key}
              variant="secondary"
              size="lg"
              disabled={submitting}
              onClick={() => handleResponse(key)}
            >
              {t(`responses.${key}`)}
            </Button>
          ))}
        </div>

        <button
          type="button"
          className="text-sm text-[var(--slate-500)] hover:text-[var(--slate-700)] transition-colors pt-1"
          disabled={submitting}
          onClick={handleSkip}
        >
          {t("skip")}
        </button>
      </div>
    </Modal>
  );
}
