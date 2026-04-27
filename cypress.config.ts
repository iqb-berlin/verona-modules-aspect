// @ts-ignore
import { defineConfig } from 'cypress';
import { writeFileSync } from 'fs';
import coverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      coverageTask(on, config);
      on('task', {
        writeTextFile({ filepath, content }: { filepath: string; content: string }) {
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
