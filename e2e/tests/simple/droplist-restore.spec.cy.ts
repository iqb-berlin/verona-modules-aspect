import { dragTo } from '../helpers/droplist-util';
import legacyUnit from '../../fixtures/legacy-drop-list.json';

function checkRestoredPage(): void {
  cy.getByAlias('target').find('.drop-list-item').should('have.length', 1)
    .and('contain.text', 'Karte A');
  cy.getByAlias('source').find('.drop-list-item').should('not.exist');
  cy.getElementByAlias('name').find('input').should('be.visible')
    .and('have.value', 'Milo');
}

describe('Restoring a moved drop-list option (#1729)', () => {
  const modernUnit = structuredClone(legacyUnit);
  modernUnit.version = '4.14.0';
  Object.assign(modernUnit.pages[0].sections[0].elements[0], {
    value: [{ id: 'internal_1', alias: 'public_A', text: 'Karte A' }]
  });

  [
    { title: 'uses the legacy option ID', unit: legacyUnit, expected: 'value_1' },
    { title: 'keeps an explicit alias distinct from the internal ID', unit: modernUnit, expected: 'public_A' }
  ].forEach(({ title, unit, expected }) => {
    it(title, () => {
      const unitDefinition = JSON.stringify(unit);
      const unitState = { dataParts: {} as Record<string, string> };
      cy.openPlayer();
      cy.window().then(win => {
        const collect = ({ source, data }: MessageEvent): void => {
          if (source !== win || data?.type !== 'vopStateChangedNotification' || !data.unitState) return;
          const dataParts = { ...unitState.dataParts, ...data.unitState.dataParts };
          Object.assign(unitState, data.unitState, { dataParts });
        };
        win.parent.addEventListener('message', collect);
        win.addEventListener('pagehide', () => win.parent.removeEventListener('message', collect));
      });
      cy.sendStartCommand({ unitDefinition });
      cy.getElementByAlias('name').find('input').type('Milo').blur();
      dragTo('source', 'Karte A', 'target');
      cy.wrap(unitState).should(state => {
        expect(state.dataParts.elementCodes).to.be.a('string');
        const codes: { id: string }[] = JSON.parse(state.dataParts.elementCodes);
        expect(codes.find(code => code.id === 'target')).to.deep.equal({
          id: 'target', status: 'VALUE_CHANGED', value: [expected]
        });
      }).then(state => {
        const saved = structuredClone(state);
        cy.openPlayer();
        cy.sendStartCommand({ unitDefinition, unitState: saved });
      });
      checkRestoredPage();
    });
  });

  it('reads a state written before options had aliases', () => {
    cy.openPlayer();
    cy.sendStartCommand({
      unitDefinition: JSON.stringify(legacyUnit),
      unitState: {
        dataParts: {
          elementCodes: JSON.stringify([
            { id: 'source', status: 'VALUE_CHANGED', value: [] },
            { id: 'target', status: 'VALUE_CHANGED', value: ['value_1'] },
            { id: 'name', status: 'VALUE_CHANGED', value: 'Milo' }
          ])
        }
      }
    });
    checkRestoredPage();
  });
});
