import { Unit } from 'common/models/unit';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { Dependency, UnitDependencies } from 'editor/src/app/models/dependency';

/**
 * Works out what a unit needs beyond player and editor, for the host to store, export and check (#1709).
 *
 * Only what the unit actually contains is named, each entry once: GeoGebra for a geometry element, which the editor
 * loads as well, and the widget of a periodic table or a molecule editor, which only the player calls.
 */
export class UnitDependencyCollector {
  /** The resource package GeoGebra is delivered in. The host unpacks it before handing it to player or editor. */
  static readonly GEOGEBRA: Dependency = { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' };

  /** The widget each widget element calls, named as the player names it in `vopWidgetCall`. */
  static readonly WIDGETS: Partial<Record<UIElementType, string>> = {
    'widget-periodic-table': 'PERIODIC_TABLE',
    'widget-molecule-editor': 'MOLECULE_EDITOR'
  };

  static collect(unit: Unit): UnitDependencies {
    const types = new Set(unit.getAllElements().map(element => element.type));
    const geoGebra = types.has('geometry') ? [{ ...UnitDependencyCollector.GEOGEBRA }] : [];
    const widgets = Object.entries(UnitDependencyCollector.WIDGETS)
      .filter(([elementType]) => types.has(elementType as UIElementType))
      .map(([, widgetType]): Dependency => ({ id: widgetType as string, type: 'WIDGET' }));
    return {
      dependenciesToPlay: [...geoGebra, ...widgets],
      dependenciesToEdit: geoGebra.map(dependency => ({ ...dependency }))
    };
  }
}
