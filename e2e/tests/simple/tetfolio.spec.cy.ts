// 'fflate/browser', not 'fflate': see docs/tetfolio-element.md.
import { zipSync } from 'fflate/browser';
import { addElement, addPostMessageStub, setID } from '../util';

/**
 * A stand-in for a tet.folio export, built like the IBE-Logger ones where it matters: the entry
 * page names its pageId in `tetfoliopage`, logs every interaction under `ibe_logger-<pageId>` in
 * sessionStorage and registers `ibe_logger_restore` after load, which it then calls itself (the
 * logger's autoRestore). The restore writes what it found into #log, so the test can see it.
 * Like a real export it is a page of fixed width, centred by auto margins - wider than the element,
 * so the element has to scale it down, and with #step at its right edge, where a page cut to the
 * element's width would lose it.
 */
const EXPERIMENT_HTML = `<!doctype html><html><head><title>e2e experiment</title></head><body>
  <div id="mainPane" tetfoliopage="tf_42" style="position: relative; width: 1400px; height: 300px; margin: 0 auto">
    <p>tetfolio-e2e-marker</p>
    <button id="step" type="button" style="position: absolute; top: 20px; right: 0">Schritt</button>
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

/**
 * A real mouse click at the place on screen where #step is shown, through the DevTools protocol: the
 * browser itself then decides what is under the pointer and maps it through the element's scaling
 * into the experiment. Cypress' own `click()` would hand the event to the button directly, in the
 * experiment's coordinates, and could not tell a scaled experiment from a cut one.
 * Chromium only (the DevTools protocol), which is what the pipeline runs: Electron.
 */
function clickStepWhereShown(): void {
  cy.get('aspect-tetfolio iframe').then(frame => {
    const iframe = frame[0] as HTMLIFrameElement;
    const step = (iframe.contentDocument as Document).getElementById('step') as HTMLElement;
    const frameRect = iframe.getBoundingClientRect();
    const scale = frameRect.width / iframe.offsetWidth;
    const stepRect = step.getBoundingClientRect();
    const x = frameRect.left + (stepRect.left + stepRect.width / 2) * scale;
    const y = frameRect.top + (stepRect.top + stepRect.height / 2) * scale;
    const containerRect = (iframe.parentElement as HTMLElement).getBoundingClientRect();
    expect(x, 'button shown inside the element').to.be.within(containerRect.left, containerRect.right);
    expect(y, 'button shown inside the element').to.be.within(containerRect.top, containerRect.bottom);
    const autFrame = window.top?.document.querySelector<HTMLIFrameElement>('.aut-iframe');
    if (!autFrame?.contentWindow) throw new Error('The frame Cypress runs the player in was not found');
    const autRect = autFrame.getBoundingClientRect();
    // Cypress scales the application frame down to fit its runner
    const autScale = autRect.width / autFrame.contentWindow.innerWidth;
    const mouse = (type: 'mousePressed' | 'mouseReleased') => Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchMouseEvent',
      params: {
        type, x: autRect.left + x * autScale, y: autRect.top + y * autScale, button: 'left', clickCount: 1
      }
    });
    cy.then(() => mouse('mousePressed').then(() => mouse('mouseReleased')));
  });
}

/** Waits until the experiment is laid out at the width its page needs and shown at the element's. */
function scaledFrame(): void {
  cy.get('aspect-tetfolio iframe', { timeout: 10000 }).should(frame => {
    const iframe = frame[0] as HTMLIFrameElement;
    const shown = iframe.getBoundingClientRect().width;
    const element = (iframe.parentElement as HTMLElement).getBoundingClientRect().width;
    expect(iframe.offsetWidth, 'laid out at the width the page needs').to.be.greaterThan(1400);
    expect(shown, 'shown at the width of the element').to.be.closeTo(element, 1);
  });
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
        cy.sendStartCommand({
          unitDefinition: JSON.stringify(unit),
          unitState: { dataParts: { elementCodes: storedElementCodes } }
        });
      });
      inExperiment('#log').should('have.text', 'restored: step');
      cy.get('.tetfolio-restore-overlay', { timeout: 10000 }).should('not.exist');
    });
  });

  context('player, experiment wider than the element (#1598)', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnit('../downloads/tetfolio.json');
    });

    // First in its context: the stub's alias from `before` lives for the first test only.
    it('takes a real click at the button where it is shown', () => {
      inExperiment('#step').should('exist');
      scaledFrame();
      clickStepWhereShown();
      cy.get('@postMessage').should(stub => {
        expect(reportedElementCodes(stub).some(codes => codes
          .some(code => code.id === 'tetfolio_e2e' && code.status === 'VALUE_CHANGED' &&
            JSON.parse(code.value as string)['ibe_logger-42'] === 'step'))).to.equal(true);
      });
    });

    it('scales the experiment down to the width of the element', () => {
      scaledFrame();
    });
  });
});
