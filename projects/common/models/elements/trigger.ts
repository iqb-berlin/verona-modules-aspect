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

  /** No styling at all: not one of this element's templates reads a styling value, and the group it
     used to get came from the base class rather than from any declaration (#1226). Declared here so
     the merge in the constructor keeps nothing and the inspector offers nothing.

     Deleting this field compiles: the inherited `styling: Stylings` is assignable to the interface's
     optional empty group, because every object is. What holds the emptiness is the spec in
     element.spec.ts, not the type. */
  styling: Record<never, never> = {};

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

/** A trigger is an element with an action and nothing else — hence the one declaration below. */
export interface TriggerProperties
  extends UIElementProperties, ActionProperties<TriggerAction, string | StateVariable> {
  /** No styling: see the class field (#1226). */
  styling?: Record<never, never>;
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
