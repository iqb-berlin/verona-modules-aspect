import { Section, SectionProperties } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject, UIElementProperties, UIElementType } from 'common/interfaces';
import { TableElement } from './table';

describe('TableElement', () => {
  const createDropListValues = (listID: string, valuePrefix: string): DragNDropValueObject[] => [
    {
      text: 'Option A',
      imgSrc: null,
      imgFileName: '',
      imgPosition: 'above',
      id: `${valuePrefix}_1`,
      alias: `${valuePrefix}_1`,
      originListID: listID,
      originListIndex: 0,
      audioSrc: null,
      audioFileName: ''
    },
    {
      text: 'Option B',
      imgSrc: null,
      imgFileName: '',
      imgPosition: 'above',
      id: `${valuePrefix}_2`,
      alias: `${valuePrefix}_2`,
      originListID: listID,
      originListIndex: 1,
      audioSrc: null,
      audioFileName: ''
    }
  ];

  const dropListProperties = {
    type: 'drop-list' as UIElementType,
    id: 'drop-list_1',
    alias: 'drop-list_1',
    isRelevantForPresentationComplete: true,
    value: createDropListValues('drop-list_1', 'value')
  };

  const tableProperties = {
    type: 'table' as UIElementType,
    id: 'table_1',
    alias: 'table_1',
    isRelevantForPresentationComplete: true,
    elements: [dropListProperties as UIElementProperties],
    gridColumnSizes: [{ value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }],
    tableEdgesEnabled: false
  };

  const createSectionProperties = (elements: UIElementProperties[]): SectionProperties => ({
    elements,
    height: 400,
    backgroundColor: '#ffffff',
    dynamicPositioning: true,
    autoColumnSize: true,
    autoRowSize: true,
    gridColumnSizes: [{ value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }],
    visibilityDelay: 0,
    animatedVisibility: false,
    enableReHide: false,
    logicalConnectiveOfRules: 'disjunction',
    visibilityRules: [],
    ignoreNumbering: false
  });

  const getSectionVariableInfos = (section: Section) => {
    const dropLists = section.getAllElements('drop-list') as DropListElement[];
    return section.getVariableInfos(dropLists);
  };

  it('should instantiate its child elements', () => {
    const table = new TableElement(tableProperties);
    expect(table.getChildElements().length).toBe(1);
    expect(table.getChildElements()[0]).toBeInstanceOf(DropListElement);
  });

  describe('header row (#864)', () => {
    const twoColumnTableProperties = {
      ...tableProperties,
      elements: [],
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
    };

    it('should fall back to disabled header for definitions without header properties', () => {
      const table = new TableElement(tableProperties);
      expect(table.headerEnabled).toBe(false);
      expect(table.headerRows).toEqual([]);
      expect(table.stickyHeader).toBe(false);
    });

    it('should apply given header properties', () => {
      const table = new TableElement({
        ...twoColumnTableProperties,
        headerEnabled: true,
        headerRows: [[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]],
        stickyHeader: true
      });
      expect(table.headerEnabled).toBe(true);
      expect(table.headerRows).toEqual([[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]]);
      expect(table.stickyHeader).toBe(true);
    });

    it('should copy header cells instead of keeping blueprint references', () => {
      const headerRows: { text: string; alignment: 'left' | 'center' | 'right' }[][] =
        [[{ text: 'A', alignment: 'left' }]];
      const table = new TableElement({ ...tableProperties, headerEnabled: true, headerRows });
      headerRows[0][0].text = 'changed';
      expect(table.headerRows[0][0].text).toBe('A');
    });

    it('should create a header row matching the column count when the header gets enabled', () => {
      const table = new TableElement(twoColumnTableProperties);
      table.setProperty('headerEnabled', true);
      expect(table.headerRows).toEqual([
        [{ text: '', alignment: 'left' }, { text: '', alignment: 'left' }]
      ]);
    });

    it('should keep existing header rows when the header gets re-enabled', () => {
      const table = new TableElement({
        ...tableProperties,
        headerRows: [[{ text: 'A', alignment: 'center' }]]
      });
      table.setProperty('headerEnabled', true);
      expect(table.headerRows).toEqual([[{ text: 'A', alignment: 'center' }]]);
    });

    it('should extend header rows when columns are added', () => {
      const table = new TableElement({
        ...tableProperties,
        headerEnabled: true,
        headerRows: [[{ text: 'A', alignment: 'center' }]]
      });
      table.setProperty('gridColumnSizes', [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]);
      expect(table.headerRows).toEqual([
        [{ text: 'A', alignment: 'center' }, { text: '', alignment: 'left' }]
      ]);
    });

    it('should shrink header rows when columns are removed', () => {
      const table = new TableElement({
        ...twoColumnTableProperties,
        headerEnabled: true,
        headerRows: [[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]]
      });
      table.setProperty('gridColumnSizes', [{ value: 1, unit: 'fr' }]);
      expect(table.headerRows).toEqual([[{ text: 'A', alignment: 'left' }]]);
    });

    it('should replace header row arrays on setProperty, so components get updated', () => {
      const table = new TableElement(twoColumnTableProperties);
      const originalHeaderRows = table.headerRows;
      table.setProperty('headerRows', [[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'left' }]]);
      expect(table.headerRows).not.toBe(originalHeaderRows);
      expect(table.headerRows[0][0]).toEqual({ text: 'A', alignment: 'left' });
    });

    it('should append an empty header row matching the column count on addHeaderRow', () => {
      const table = new TableElement({
        ...twoColumnTableProperties,
        headerEnabled: true,
        headerRows: [[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]]
      });
      const originalHeaderRows = table.headerRows;
      table.addHeaderRow();
      expect(table.headerRows).toEqual([
        [{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }],
        [{ text: '', alignment: 'left' }, { text: '', alignment: 'left' }]
      ]);
      expect(table.headerRows).not.toBe(originalHeaderRows);
    });

    it('should remove the header row at the given index on removeHeaderRow', () => {
      const table = new TableElement({
        ...tableProperties,
        headerEnabled: true,
        headerRows: [
          [{ text: 'A', alignment: 'left' }],
          [{ text: 'B', alignment: 'center' }]
        ]
      });
      table.removeHeaderRow(0);
      expect(table.headerRows).toEqual([[{ text: 'B', alignment: 'center' }]]);
    });

    it('should keep header properties in the blueprint', () => {
      const table = new TableElement({
        ...twoColumnTableProperties,
        headerEnabled: true,
        headerRows: [[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]],
        stickyHeader: true
      });
      const blueprint = table.getBlueprint();
      expect(blueprint.headerEnabled).toBe(true);
      expect(blueprint.headerRows).toEqual([[{ text: 'A', alignment: 'left' }, { text: 'B', alignment: 'right' }]]);
      expect(blueprint.stickyHeader).toBe(true);
    });
  });

  describe('getVariableInfos of a section with a drop list inside a table (#1087)', () => {
    it('should not throw', () => {
      const section = new Section(createSectionProperties([tableProperties as UIElementProperties]));
      const dropLists = section.getAllElements('drop-list') as DropListElement[];
      expect(() => section.getVariableInfos(dropLists)).not.toThrow();
    });

    it('should return the variable info of the drop list with its values', () => {
      const section = new Section(createSectionProperties([tableProperties as UIElementProperties]));
      const dropListInfos = getSectionVariableInfos(section).filter(info => info.id === 'drop-list_1');
      expect(dropListInfos.length).toBe(1);
      expect(dropListInfos[0].values).toEqual([
        { value: 'value_1', label: 'Option A' },
        { value: 'value_2', label: 'Option B' }
      ]);
    });

    it('should not return duplicate variable infos for table child elements', () => {
      const section = new Section(createSectionProperties([tableProperties as UIElementProperties]));
      const ids = getSectionVariableInfos(section).map(info => info.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getVariableInfos of surrounding elements (regression)', () => {
    it('should keep reporting standalone and connected drop lists outside of tables', () => {
      const sourceListProperties = {
        type: 'drop-list' as UIElementType,
        id: 'drop-list_source',
        alias: 'drop-list_source',
        isRelevantForPresentationComplete: true,
        value: createDropListValues('drop-list_source', 'source-value'),
        connectedTo: ['drop-list_target']
      };
      const targetListProperties = {
        type: 'drop-list' as UIElementType,
        id: 'drop-list_target',
        alias: 'drop-list_target',
        isRelevantForPresentationComplete: true,
        value: []
      };
      const section = new Section(createSectionProperties([
        sourceListProperties as UIElementProperties,
        targetListProperties as UIElementProperties
      ]));
      const variableInfos = getSectionVariableInfos(section);
      const targetInfos = variableInfos.filter(info => info.id === 'drop-list_target');
      expect(targetInfos.length).toBe(1);
      expect(targetInfos[0].values).toEqual([
        { value: 'source-value_1', label: 'Option A' },
        { value: 'source-value_2', label: 'Option B' }
      ]);
      expect(variableInfos.filter(info => info.id === 'drop-list_source').length).toBe(1);
    });

    it('should keep reporting other input elements inside a table exactly once', () => {
      const checkboxProperties = {
        type: 'checkbox' as UIElementType,
        id: 'checkbox_1',
        alias: 'checkbox_1',
        isRelevantForPresentationComplete: true,
        label: 'Check mich'
      };
      const tableWithCheckbox = {
        ...tableProperties,
        elements: [checkboxProperties as UIElementProperties]
      };
      const section = new Section(createSectionProperties([tableWithCheckbox as UIElementProperties]));
      const checkboxInfos = getSectionVariableInfos(section).filter(info => info.id === 'checkbox_1');
      expect(checkboxInfos.length).toBe(1);
      expect(checkboxInfos[0].type).toBe('boolean');
    });

    it('should keep reporting drop lists inside a cloze element', () => {
      const clozeDropListProperties = {
        type: 'drop-list' as UIElementType,
        id: 'drop-list_cloze',
        alias: 'drop-list_cloze',
        isRelevantForPresentationComplete: true,
        value: createDropListValues('drop-list_cloze', 'cloze-value')
      };
      const clozeProperties = {
        type: 'cloze' as UIElementType,
        id: 'cloze_1',
        alias: 'cloze_1',
        isRelevantForPresentationComplete: true,
        columnCount: 1,
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            attrs: {},
            content: [{
              type: 'DropList',
              attrs: { model: clozeDropListProperties }
            }]
          }]
        }
      };
      const section = new Section(createSectionProperties([clozeProperties as UIElementProperties]));
      const dropListInfos = getSectionVariableInfos(section).filter(info => info.id === 'drop-list_cloze');
      expect(dropListInfos.length).toBe(1);
      expect(dropListInfos[0].values).toEqual([
        { value: 'cloze-value_1', label: 'Option A' },
        { value: 'cloze-value_2', label: 'Option B' }
      ]);
    });
  });
});
