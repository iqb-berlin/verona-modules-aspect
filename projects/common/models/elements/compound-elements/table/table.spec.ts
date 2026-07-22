import { Section, SectionProperties } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject, UIElementProperties, UIElementType } from 'common/interfaces';
import { TableElement } from './table';

describe('TableElement', () => {
  const dropListValues: DragNDropValueObject[] = [
    {
      text: 'Option A',
      imgSrc: null,
      imgFileName: '',
      imgPosition: 'above',
      id: 'value_1',
      alias: 'value_1',
      originListID: 'drop-list_1',
      originListIndex: 0,
      audioSrc: null,
      audioFileName: ''
    },
    {
      text: 'Option B',
      imgSrc: null,
      imgFileName: '',
      imgPosition: 'above',
      id: 'value_2',
      alias: 'value_2',
      originListID: 'drop-list_1',
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
    value: dropListValues
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

  const sectionProperties: SectionProperties = {
    elements: [tableProperties as UIElementProperties],
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
  };

  it('should instantiate its child elements', () => {
    const table = new TableElement(tableProperties);
    expect(table.getChildElements().length).toBe(1);
    expect(table.getChildElements()[0]).toBeInstanceOf(DropListElement);
  });

  describe('getVariableInfos of a section with a drop list inside a table (#1087)', () => {
    it('should not throw', () => {
      const section = new Section(sectionProperties);
      const dropLists = section.getAllElements('drop-list') as DropListElement[];
      expect(() => section.getVariableInfos(dropLists)).not.toThrow();
    });

    it('should return the variable info of the drop list with its values', () => {
      const section = new Section(sectionProperties);
      const dropLists = section.getAllElements('drop-list') as DropListElement[];
      const variableInfos = section.getVariableInfos(dropLists);
      const dropListInfos = variableInfos.filter(info => info.id === 'drop-list_1');
      expect(dropListInfos.length).toBe(1);
      expect(dropListInfos[0].values).toEqual([
        { value: 'value_1', label: 'Option A' },
        { value: 'value_2', label: 'Option B' }
      ]);
    });

    it('should not return duplicate variable infos for table child elements', () => {
      const section = new Section(sectionProperties);
      const dropLists = section.getAllElements('drop-list') as DropListElement[];
      const variableInfos = section.getVariableInfos(dropLists);
      const ids = variableInfos.map(info => info.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
