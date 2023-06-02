import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4202',
    fixturesFolder: 'e2e/fixtures',
    supportFile: 'e2e/support/e2e.ts',
    specPattern: 'e2e/tests/*.spec.cy.ts'
  }
});
