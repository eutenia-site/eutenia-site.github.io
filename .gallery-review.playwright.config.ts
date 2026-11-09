import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  workers: 2,
  projects: config.projects?.map((project) => ({
    ...project,
    use: { ...project.use, channel: 'chrome' },
  })),
});
