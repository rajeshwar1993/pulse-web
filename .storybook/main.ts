import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: "@storybook/nextjs-vite",
  docs: {
    autodocs: true,
  },
};

export default config;
