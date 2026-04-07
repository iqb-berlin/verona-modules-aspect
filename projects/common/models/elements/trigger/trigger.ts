import {
  UIElement
} from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TriggerElement extends UIElement implements TriggerProperties {
  type: UIElementType = 'trigger';
  action: null | TriggerAction = ELEMENT_DEFAULTS.trigger.action as TriggerAction | null;
  actionParam: null | string | StateVariable = ELEMENT_DEFAULTS.trigger.actionParam as any;

  static title: string = 'Auslöser';
  static icon: string = 'bolt';

  constructor(element?: Partial<TriggerProperties>, idService?: AbstractIDService) {
    super({ type: 'trigger', ...element }, idService);
    if (isTriggerProperties(element)) {
      this.action = element.action;
      this.actionParam = element.actionParam;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Trigger instantiation', element);
    }
  }
}

export interface TriggerProperties extends UIElementProperties {
  action: null | TriggerAction;
  actionParam: null | string | StateVariable ;
}

function isTriggerProperties(blueprint?: Partial<TriggerProperties>): blueprint is TriggerProperties {
  if (!blueprint) return false;
  return blueprint.action !== undefined &&
    blueprint.actionParam !== undefined;
}

export interface TriggerActionEvent {
  action: TriggerAction;
  param: null | string | StateVariable;
}

export type TriggerAction = 'highlightText' | 'stateVariableChange' | 'removeHighlights';
