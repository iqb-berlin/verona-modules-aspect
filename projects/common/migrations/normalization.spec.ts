import { ModelNormalizer } from 'common/utils/model-normalizer';
import { NormalizationMigration } from './normalization';

describe('NormalizationMigration', () => {
  let migration: NormalizationMigration;

  beforeEach(() => {
    migration = new NormalizationMigration();
  });

  it('should preserve the original version of the unit', () => {
    const unit = {
      version: '4.5.0',
      pages: []
    };
    const result = migration.execute(unit);
    expect(result.version).toBe('4.5.0');
  });

  /* The normalizer walks an element's children itself, so this step must not take the traversal's tree
     as well -- a child would be normalized twice, a likert row three times. Nothing goes wrong today
     because normalizing twice changes nothing; the count is held so that a repair case added to the
     normalizer cannot quietly run twice on a child (#1196). */
  it('should hand every element to the normalizer once', () => {
    const normalizeElement = vi.spyOn(ModelNormalizer, 'normalizeElement');
    migration.execute({
      version: '4.5.0',
      pages: [{
        sections: [{
          elements: [{
            type: 'likert',
            id: 'likert_1',
            rows: [{ type: 'likert-row', id: 'row_1' }],
            elements: [{ type: 'radio', id: 'cell_1' }]
          }]
        }]
      }]
    });

    const idsSeen = normalizeElement.mock.calls
      .map(([element]) => (element as Record<string, unknown>).id);
    expect(idsSeen.filter(id => id === 'likert_1').length).toBe(1);
    expect(idsSeen.filter(id => id === 'cell_1').length).toBe(1);
    /* Twice, and not because of the traversal: `normalizeElement` walks a likert's rows in two places
       of its own -- once to stamp the row type, once with the other compound children. Older than
       this change and harmless while normalizing twice changes nothing. */
    expect(idsSeen.filter(id => id === 'row_1').length).toBe(2);
    vi.restoreAllMocks();
  });

  it('should normalize elements within pages and sections', () => {
    const unit = {
      version: '4.5.0',
      pages: [{
        sections: [{
          elements: [{
            type: 'button',
            label: 'Test Button'
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const element = elements[0];
    const dimensions = element.dimensions as Record<string, unknown>;

    expect(element.label).toBe('Test Button');
    // Verify that ModelNormalizer was called (e.g., dimensions added)
    expect(dimensions).toBeDefined();
    expect(dimensions.width).toBeDefined();
    expect(element.position).toBeDefined();
    /* Styling is deliberately NOT part of what normalization fills: the element's own class builds
       that group from its declared type, which the compiler checks (#1187). An element stored without
       one therefore stays without one until it is instantiated. */
    expect(element.styling).toBeUndefined();
  });

  it('should recursively normalize elements within cloze documents', () => {
    const unit = {
      version: '4.5.0',
      pages: [{
        sections: [{
          elements: [{
            type: 'cloze',
            document: {
              type: 'doc',
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: 'Text with '
                }, {
                  type: 'text-field-simple',
                  attrs: {
                    model: {
                      type: 'text-field-simple',
                      id: 'child-1'
                    }
                  }
                }]
              }]
            }
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const cloze = elements[0] as Record<string, unknown>;
    const document = cloze.document as Record<string, unknown>;
    const docContent = document.content as Record<string, unknown>[];
    const paragraph = docContent[0] as Record<string, unknown>;
    const paraContent = paragraph.content as Record<string, unknown>[];
    const textField = paraContent[1] as Record<string, unknown>;
    const attrs = textField.attrs as Record<string, unknown>;
    const childModel = attrs.model as Record<string, unknown>;

    expect(childModel.id).toBe('child-1');
    // Verify child element was normalized
    expect(childModel.dimensions).toBeDefined();
    expect(childModel.styling).toBeUndefined(); // built by the element class, not here (#1187)
  });
});
