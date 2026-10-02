import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { ElementFactory } from 'common/utils/element-factory';
import { StateVariable } from 'common/models/state-variable';
import { UIElement } from 'common/models/elements/element';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { VariableInfoOrigins } from 'editor/src/app/utils/variable-info-origins';

describe('VariableInfoOrigins', () => {
  const idService = {
    getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
    register: (): void => {},
    unregister: (): void => {},
    isAliasAvailable: (): boolean => true,
    changeAlias: (): void => {}
  } as unknown as AbstractIDService;

  const create = (properties: Record<string, unknown>): PositionedUIElement => ElementFactory
    .createElement(properties as unknown as UIElementProperties, idService) as PositionedUIElement;

  let unit: EditorUnit;
  let text: PositionedUIElement;
  let geometry: PositionedUIElement;
  let likert: PositionedUIElement;
  let table: PositionedUIElement;

  beforeEach(() => {
    unit = new EditorUnit(undefined, idService);
    unit.pages.push(new EditorPage(undefined, idService));
    unit.stateVariables = [new StateVariable('state_1', 'März', '')];
    text = create({ type: 'text-field', id: 'text-field_1', alias: 'answer' });
    geometry = create({
      type: 'geometry',
      id: 'geometry_1',
      alias: 'ggb01',
      trackedVariables: [{ id: 'A', value: '' }, { id: 'fistgewählt', value: '' }],
      trackedExpectedVariables: [{ id: 'b', value: '' }]
    });
    likert = create({
      type: 'likert',
      id: 'likert_1',
      alias: 'likert',
      options: [],
      rows: [{ type: 'likert-row', id: 'likert-row_1', alias: 'row-one' }]
    });
    table = create({
      type: 'table',
      id: 'table_1',
      alias: 'table',
      elements: [{ type: 'text-field', id: 'text-field_2', alias: 'cell' }]
    });
    unit.pages[0].sections[0].elements.push(text);
    unit.pages[1].sections[0].elements.push(geometry, likert, table);
  });

  const originOf = (id: string) => VariableInfoOrigins.collect(unit).find(origin => origin.info.id === id);

  it('should return exactly the variables the unit reports, in the same order', () => {
    expect(VariableInfoOrigins.collect(unit).map(origin => origin.info)).toEqual(unit.getVariableInfos());
  });

  it('should place a state variable at the unit, without a page', () => {
    const origin = originOf('state_1');

    expect(origin?.stateVariable).toBe(unit.stateVariables[0]);
    expect(origin?.location).toBeUndefined();
  });

  it('should give an element its page and section', () => {
    expect(originOf('text-field_1')?.location).toEqual({
      pageIndex: 0, sectionIndex: 0, element: text, navigationElement: text
    });
    expect(originOf('text-field_1')?.property).toBe('alias');
  });

  it('should navigate to the parent of a compound child', () => {
    const location = originOf('text-field_2')?.location;

    expect(location?.element.alias).toBe('cell');
    expect(location?.navigationElement).toBe(table);
  });

  it('should attribute a likert row variable to the row, reached through the likert', () => {
    const location = originOf('likert-row_1')?.location;

    expect(location?.element.alias).toBe('row-one');
    expect(location?.navigationElement).toBe(likert);
    expect(location?.pageIndex).toBe(1);
  });

  it('should name the GeoGebra object a geometry variable comes from, and the list it was taken into', () => {
    expect(originOf('geometry_1_fistgewählt')).toEqual(expect.objectContaining({
      property: 'trackedVariables', subValue: 'fistgewählt'
    }));
    expect(originOf('geometry_1_b')).toEqual(expect.objectContaining({
      property: 'trackedExpectedVariables', subValue: 'b'
    }));
    expect(originOf('geometry_1')?.property).toBe('alias');
    expect(originOf('geometry_1')?.subValue).toBeUndefined();
  });

  /* The walk repeats the one in `Unit.getVariableInfos`, and what it collects is what the host receives. Every
     element type is asked here, so a type that comes to report differently -- or a section that comes to walk its
     elements differently -- shows up as a difference in this one comparison. */
  it('should return exactly what the unit reports for every element type', () => {
    (Object.keys(ELEMENT_DEFAULTS) as UIElementType[]).forEach(type => {
      unit.pages[0].sections[0].elements.push(create({
        type,
        id: `${type}_sweep`,
        alias: `${type}_sweep`,
        ...(type === 'likert' ? { rows: [{ type: 'likert-row', id: 'likert-row_sweep', alias: 'row_sweep' }] } : {})
      }));
    });

    expect(VariableInfoOrigins.collect(unit).map(origin => origin.info)).toEqual(unit.getVariableInfos());
  });

  it('should follow the unit when an element is added', () => {
    unit.pages[0].sections[0].elements.push(create({ type: 'checkbox', id: 'checkbox_1', alias: 'box' }));

    expect(VariableInfoOrigins.collect(unit).map(origin => origin.info)).toEqual(unit.getVariableInfos());
    expect((originOf('checkbox_1')?.location?.element as UIElement).alias).toBe('box');
  });
});
