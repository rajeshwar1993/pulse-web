import type { Meta, StoryObj } from "@storybook/react";
import { FormInput } from "./form-input";

const meta = {
  title: "UI/FormInput",
  component: FormInput,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text displayed above the input",
    },
    htmlFor: {
      control: "text",
      description: "HTML for attribute linking the label to the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when the input is empty",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    readOnly: {
      control: "boolean",
      description: "Whether the input is read-only",
    },
  },
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
