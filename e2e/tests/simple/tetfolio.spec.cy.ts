// 'fflate/browser', not 'fflate': see docs/tetfolio-element.md.
import { zipSync } from 'fflate/browser';
import { addElement, addPostMessageStub, setID } from '../util';

/**
 * A stand-in for a tet.folio export, built like the IBE-Logger ones where it matters: the entry
 * page names its pageId in `tetfoliopage`, logs every interaction under `ibe_logger-<pageId>` in
 * sessionStorage and registers `ibe_logger_restore` after load, which it then calls itself (the
 * logger's autoRestore). The restore writes what it found into #log, so the test can see it.
 */
const EXPERIMENT_HTML = `<!doctype html><html><head><title>e2e experiment</title></head><body>
  <div id="mainPane" tetfoliopage="tf_42">
    <p>tetfolio-e2e-marker</p>
    <button id="step" type="button">Schritt</button>
    <div id="log"></div>
  </div>
  <script>
    var key = 'ibe_logger-42';
    document.getElementById('step').addEventListener('click', function () {
      var lines = sessionStorage.getItem(key);
      sessionStorage.setItem(key, lines ? lines + '\\nstep' : 'step');
    });
    window.addEventListener('load', function () {
      window.ibe_logger_restore = function () {
        document.getElementById('log').textContent = 'restored: ' + (sessionStorage.getItem(key) || '');
      };
      window.ibe_logger_restore();
    });
  </script>
</body></html>`;

function experimentZip(): Cypress.FileReferenceObject {
  const encode = (text: string) => new TextEncoder().encode(text);
  const zip = zipSync({
    'index.html': encode('<META http-equiv="refresh" content="0;URL=tetfolio.fu-berlin.de/web/42.html">'),
    'tetfolio.fu-berlin.de/web/42.html': encode(EXPERIMENT_HTML)
  });
  return { contents: Cypress.Buffer.from(zip), fileName: 'experiment.zip', mimeType: 'application/zip' };
}

/**
 * An element inside the experiment. Queries only, no `then`: a start command arrives twice and
 * rebuilds the iframe, and a query chain is re-run against the new document where a wrapped body
 * would stay the detached one.
 */
function inExperiment(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-tetfolio iframe', { timeout: 10000 })
    .its('0.contentDocument.body')
    .find(selector, { timeout: 10000 });
}

/** The element codes of every state report so far, parsed. */
function reportedElementCodes(stub: unknown): { id: string; status: string; value: unknown }[][] {
  return (stub as { args: { unitState?: { dataParts?: { elementCodes?: string } } }[][] }).args
    .map(call => call[0]?.unitState?.dataParts?.elementCodes)
    .filter((codes): codes is string => typeof codes === 'string')
    .map(codes => JSON.parse(codes));
}

describe('Tetfolio element', { testIsolation: false }, () => {
  let storedElementCodes: string;

  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('packs an uploaded export and shows it on the canvas', () => {
      addElement('Tetfolio', 'Experimentell');
      cy.get('aspect-tetfolio-properties legend').should('have.text', 'Tetfolio');
      setID('tetfolio_e2e');
      cy.get('aspect-tetfolio-properties input[type=file]')
        .selectFile(experimentZip(), { action: 'select', force: true });
      cy.get('aspect-tetfolio-properties').should('contain.text', 'HTML geladen');
      inExperiment('#step').should('exist');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/tetfolio.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnit('../downloads/tetfolio.json');
    });

    it('reports the state the experiment logs as the value of the element', () => {
      inExperiment('#step').click();
      const isStepReport = (codes: { id: string; status: string; value: unknown }[]) => codes
        .some(code => code.id === 'tetfolio_e2e' && code.status === 'VALUE_CHANGED' &&
          JSON.parse(code.value as string)['ibe_logger-42'] === 'step');
      cy.get('@postMessage').should(stub => {
        expect(reportedElementCodes(stub).filter(isStepReport)).to.have.length.of.at.least(1);
      }).then(stub => {
        // The very report that was checked, so the restore below starts from exactly that state.
        storedElementCodes = JSON.stringify(reportedElementCodes(stub).filter(isStepReport)[0]);
      });
    });

    it('restores the reported state when the unit is started again with it', () => {
      cy.openPlayer();
      cy.fixture('../downloads/tetfolio.json').then(unit => {
        cy.get('aspect-unit', { timeout: 10000 }).should('exist');
        cy.window().then(window => {
          const startCommand = {
            type: 'vopStartCommand',
            unitDefinition: JSON.stringify(unit),
            unitState: { dataParts: { elementCodes: storedElementCodes } }
          };
          window.postMessage(startCommand, '*');
          return Cypress.Promise.delay(150).then(() => window.postMessage(startCommand, '*'));
        });
      });
      inExperiment('#log').should('have.text', 'restored: step');
      cy.get('.tetfolio-restore-overlay', { timeout: 10000 }).should('not.exist');
    });
  });
});
