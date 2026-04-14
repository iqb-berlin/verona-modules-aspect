import { defineConfig } from 'cypress';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        writeTextFile({ filepath, content }: { filepath: string, content: string }) {
          mkdirSync(dirname(filepath), { recursive: true });
          writeFileSync(filepath, content, 'utf8');
          return null;
        }
      });
      return config;
    },
    fixturesFolder: 'e2e/fixtures',
    supportFile: 'e2e/support/e2e.ts',
    specPattern: 'e2e/tests/**/*.spec.cy.ts',
    screenshotsFolder: 'e2e/screenshots',
    videosFolder: 'e2e/videos',
    downloadsFolder: 'e2e/downloads',
    screenshotOnRunFailure: true,
    video: false
  }
});
