import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    fixturesFolder: 'e2e/fixtures',
    supportFile: 'e2e/support/e2e.ts',
    specPattern: 'e2e/tests/**/*.spec.cy.ts',
    screenshotsFolder: 'e2e/screenshots',
    downloadsFolder: 'e2e/downloads',
    screenshotOnRunFailure: true
  }
});
