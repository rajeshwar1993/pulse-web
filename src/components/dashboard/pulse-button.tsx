"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PulseButtonProps {
  onPulse: () => Promise<void>;
}

export function PulseButton({ onPulse }: PulseButtonProps) {
  const t = useTranslations("pulse");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onPulse();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="lg" loading={loading} onClick={handleClick}>
      {loading ? t("sending") : t("sendPulse")}
    </Button>
  );
}
