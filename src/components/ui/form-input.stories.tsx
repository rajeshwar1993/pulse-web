import type { Meta, StoryObj } from "@storybook/react";
import { FormInput } from "./form-input";

const meta = {
  title: "UI/FormInput",
  component: FormInput,
  tags: ["autodocs"],
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Display Name",
    htmlFor: "display-name",
    placeholder: "Enter your name",
  },
};

export const WithValue: Story = {
  args: {
    label: "Display Name",
    htmlFor: "display-name",
    value: "Alexandra",
  },
};

export const Disabled: Story = {
  args: {
    label: "Display Name",
    htmlFor: "display-name",
    value: "Alexandra",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    value: "PULSE-ABC123",
    readOnly: true,
    className:
      "bg-[var(--slate-50)] font-mono text-lg text-center tracking-wider",
  },
};
