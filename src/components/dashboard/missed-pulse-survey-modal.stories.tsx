import type { Meta, StoryObj } from "@storybook/react";
import { MissedPulseSurveyModal } from "./missed-pulse-survey-modal";

const meta = {
  title: "Dashboard/MissedPulseSurveyModal",
  component: MissedPulseSurveyModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MissedPulseSurveyModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    missedDate: "2026-02-21",
    onComplete: () => console.log("Survey completed"),
  },
};
