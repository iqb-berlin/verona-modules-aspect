import { Type } from '@angular/core';
import { UIElementType } from 'common/interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';

export abstract class ComponentRegistry {
  private static components: { [type in UIElementType]?: Type<ElementComponent> } = {};

  static registerComponent(type: UIElementType, component: Type<ElementComponent>): void {
    ComponentRegistry.components[type] = component;
  }

  static registerComponents(components: { [type in UIElementType]?: Type<ElementComponent> }): void {
    Object.entries(components).forEach(([type, component]) => {
      if (component) {
        ComponentRegistry.registerComponent(type as UIElementType, component);
      }
    });
  }

  static getComponent(type: UIElementType): Type<ElementComponent> {
    const component = ComponentRegistry.components[type];
    if (!component) {
      throw new Error(`Component for type ${type} not found in ComponentRegistry. Make sure it is registered (e.g., in SharedModule constructor).`);
    }
    return component;
  }
}
