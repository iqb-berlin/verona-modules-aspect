import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';

describe('WidgetPeriodicTableElement', () => {
  /* The player stores the widget's state -- the selected symbols -- as the element's value, so the
     variable reported to the host has to be one that carries a string. Inherited from `UIElement`, it
     said `no-value`, and the answer was not available for coding (#1463). */
  it('should report its answer as one string variable', () => {
    const element = new WidgetPeriodicTableElement({
      id: 'widget-periodic-table_1', alias: 'pse_1', type: 'widget-periodic-table'
    });

    expect(element.getVariableInfos()).toEqual([{
      id: 'widget-periodic-table_1',
      alias: 'pse_1',
      type: 'string',
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
     by the default and written back on the next save (#1420). */
  it('should keep every stored widget setting', () => {
    const stored = {
      showInfoOrder: false,
      showInfoName: false,
      showInfoSymbol: false,
      showInfoENeg: true,
      showInfoAMass: false,
      showInfoLabels: false,
      highlightBlocks: true,
      fieldTextColor: '#000000',
      fieldBackgroundColor: '#123456',
      closeOnSelection: true,
      maxNumberOfSelections: 4
    };

    const element = new WidgetPeriodicTableElement({ id: 'p1', type: 'widget-periodic-table', ...stored });

    expect(element).toEqual(expect.objectContaining(stored));
  });
});
