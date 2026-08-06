import {
  UIElement
} from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { ActionProperties, UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TriggerElement extends UIElement implements TriggerProperties {
  type: UIElementType = 'trigger';
  action: null | TriggerAction = ELEMENT_DEFAULTS.trigger.action;

  actionParam: null | string | StateVariable = ELEMENT_DEFAULTS.trigger.actionParam;

  static title: string = 'Auslöser';
  static icon: string = 'bolt';

  constructor(element?: Partial<TriggerProperties>, idService?: AbstractIDService) {
    super({ type: 'trigger', ...element }, idService);
    if (isTriggerProperties(element)) {
      this.action = element.action;
      this.actionParam = element.actionParam;
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Trigger instantiation', element);
    }
  }
}

/** A trigger is an element with an action and nothing else — hence the empty body. */
export interface TriggerProperties
  extends UIElementProperties, ActionProperties<TriggerAction, string | StateVariable> {
}

function isTriggerProperties(blueprint?: Partial<TriggerProperties>): blueprint is TriggerProperties {
  if (!blueprint) return false;
  return blueprint.action !== undefined &&
    blueprint.type === 'trigger';
}

export interface TriggerActionEvent {
  action: TriggerAction;
  param: null | string | StateVariable;
}

export type TriggerAction = 'highlightText' | 'stateVariableChange' | 'removeHighlights';
