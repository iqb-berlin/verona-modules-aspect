import { defineConfig } from 'cypress';
import coverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      coverageTask(on, config);
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
