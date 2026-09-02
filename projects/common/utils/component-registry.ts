import { Type } from '@angular/core';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';

/**
 * Which component draws an element of a given type. Filled at startup -- `registerComponents`
 * (`component-registration.ts`) for the element types, the two `AppModule`s for `marking-panel` -- and
 * read wherever an element is rendered from its model alone.
 */
export abstract class ComponentRegistry {
  private static components: { [type in UIElementType]?: Type<ElementComponent> } = {};

  /** Registers one type, replacing whatever was registered for it before. */
  static registerComponent(type: UIElementType, component: Type<ElementComponent>): void {
    ComponentRegistry.components[type] = component;
  }

  /** Registers a whole table of types; entries without a component are skipped, not stored as empty. */
  static registerComponents(components: { [type in UIElementType]?: Type<ElementComponent> }): void {
    Object.entries(components).forEach(([type, component]) => {
      if (component) {
        ComponentRegistry.registerComponent(type as UIElementType, component);
      }
    });
  }

  /**
   * The component for a type; throws if none is registered -- an unrendered element would be a silently
   * empty spot in the unit, so this fails loudly instead of returning undefined.
   */
  static getComponent(type: UIElementType): Type<ElementComponent> {
    const component = ComponentRegistry.components[type];
    if (!component) {
      throw new Error(`Component for type ${type} not found in ComponentRegistry. ` +
      'Make sure it is registered (e.g., in SharedModule constructor).');
    }
    return component;
  }
}
