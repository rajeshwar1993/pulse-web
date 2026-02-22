import type { Preview } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../src/messages/en.json";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
