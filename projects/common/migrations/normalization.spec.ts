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
    expect(element.styling).toBeDefined();
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
    expect(childModel.styling).toBeDefined();
  });
});
