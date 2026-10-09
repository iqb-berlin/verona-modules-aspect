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
      type: 'STRING',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      valuesComplete: false
    }]);
  });

  /* With a maximum of 0 the periodic table is only there to look at and never gives an answer
     (#1488), so there is no value to code. */
  it('should report no value when nothing can be selected', () => {
    const element = new WidgetPeriodicTableElement({
      id: 'widget-periodic-table_1', alias: 'pse_1', type: 'widget-periodic-table', maxNumberOfSelections: 0
    });

    expect(element.getVariableInfos()).toEqual([expect.objectContaining({
      id: 'widget-periodic-table_1', alias: 'pse_1', type: 'NO_VALUE'
    })]);
  });

  /* The editor loads a unit without the normalizer, so a maximum stored as a string reaches the model
     as one. */
  it('should be view only with a maximum of 0 or below, however it is stored', () => {
    const viewOnly = (max: unknown): boolean => new WidgetPeriodicTableElement({
      id: 'p1', type: 'widget-periodic-table', maxNumberOfSelections: max as number
    }).isViewOnly();

    expect([0, '0', -1].map(viewOnly)).toEqual([true, true, true]);
    expect([1, '3', 118].map(viewOnly)).toEqual([false, false, false]);
  });

  /* The editor loads a unit without the normalizer, so what the constructor does not copy is replaced
     by the default and written back on the next save. */
  it('should keep every stored widget setting', () => {
    const stored = {
      showInfoOrder: false,
      showInfoENeg: true,
      showInfoAMass: false,
      closeOnSelection: true,
      maxNumberOfSelections: 4
    };

    const element = new WidgetPeriodicTableElement({ id: 'p1', type: 'widget-periodic-table', ...stored });

    expect(element).toEqual(expect.objectContaining(stored));
  });
});
