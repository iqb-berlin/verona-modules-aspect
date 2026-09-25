import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor';

describe('WidgetMoleculeEditorElement', () => {
  /* The player stores the widget's state -- the drawn molecule as a JSON string -- as the element's
     value, so the variable reported to the host has to be one that carries it. Inherited from
     `UIElement`, it said `no-value`, and the answer was not available for coding (#1463). */
  it('should report its answer as one json variable', () => {
    const element = new WidgetMoleculeEditorElement({
      id: 'widget-molecule-editor_1', alias: 'molecule_1', type: 'widget-molecule-editor'
    });

    expect(element.getVariableInfos()).toEqual([{
      id: 'widget-molecule-editor_1',
      alias: 'molecule_1',
      type: 'json',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }]);
  });

  /* The editor loads a unit without the normalizer, so what the constructor does not copy is replaced
     by the default and written back on the next save. */
  it('should keep the stored bonding type', () => {
    const element = new WidgetMoleculeEditorElement({
      id: 'm1', type: 'widget-molecule-editor', bondingType: 'ELECTRONS'
    });

    expect(element.bondingType).toBe('ELECTRONS');
  });
});
