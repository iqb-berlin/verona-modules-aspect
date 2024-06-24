import { Type } from '@angular/core';
import {
  UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import { TriggerComponent } from 'common/components/trigger/trigger.component';

export class TriggerElement extends UIElement implements TriggerProperties {
  type: UIElementType = 'trigger';
  action: null | TriggerAction = null;
  actionParam: null | string | StateVariable = null;

  static title: string = 'Auslöser';
  static icon: string = 'bolt';

  constructor(element?: TriggerProperties) {
    super(element);
    if (element && isValid(element)) {
      this.action = element.action;
      this.actionParam = element.actionParam;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Trigger instantiation', element);
      }
      if (element?.action !== undefined) this.action = element.action;
      if (element?.actionParam !== undefined) this.actionParam = element.actionParam;
    }
  }

  getDuplicate(): TriggerElement {
    return new TriggerElement(this);
  }

  getElementComponent(): Type<ElementComponent> {
    return TriggerComponent;
  }
}

export interface TriggerProperties extends UIElementProperties {
  action: null | TriggerAction;
  actionParam: null | string | StateVariable ;
}

function isValid(blueprint?: TriggerProperties): boolean {
  if (!blueprint) return false;
  return blueprint.action !== undefined &&
    blueprint.actionParam !== undefined;
}

export interface TriggerActionEvent {
  action: TriggerAction;
  param: null | string | StateVariable;
}

export type TriggerAction = 'highlightText' | 'stateVariableChange' | 'removeHighlights';
