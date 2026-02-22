import type { Preview } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../src/messages/en.json";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: {
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
        },
        mobile: {
          name: "Mobile",
          styles: { width: "390px", height: "844px" },
        },
      },
      defaultViewport: "desktop",
    },
    docs: {
      toc: true,
    },
    controls: {
      expanded: true,
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
