import {
  InputElement
} from 'common/models/elements/element';
import { environment } from 'common/environment';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { TextImageLabel } from 'common/models/label-interfaces';
import { UIElementType, FirstColumnRatioProperties } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class LikertRowElement extends InputElement implements LikertRowProperties {
  type: UIElementType = 'likert-row';
  rowLabel: TextImageLabel = ELEMENT_DEFAULTS['likert-row'].rowLabel;
  columnCount: number = ELEMENT_DEFAULTS['likert-row'].columnCount;
  firstColumnSizeRatio: number = ELEMENT_DEFAULTS['likert-row'].firstColumnSizeRatio;
  verticalButtonAlignment: 'auto' | 'center' =
    ELEMENT_DEFAULTS['likert-row'].verticalButtonAlignment;

  /* No styling at all: not one of this element's templates reads a styling value, and the group it
     used to get came from the base class rather than from any declaration (#1226). Declared here so
     the merge in the constructor keeps nothing and the inspector offers nothing.

     Deleting this field compiles: the inherited `styling: Stylings` is assignable to the interface's
     optional empty group, because every object is. What holds the emptiness is the spec in
     element.spec.ts, not the type. */
  styling: Record<never, never> = {};

  constructor(element?: Partial<LikertRowProperties>, idService?: AbstractIDService) {
    super({ type: 'likert-row', ...element }, idService);
    if (isLikertRowProperties(element)) {
      if (element.rowLabel !== undefined) this.rowLabel = element.rowLabel;
      if (element.columnCount !== undefined) this.columnCount = element.columnCount;
      if (element.firstColumnSizeRatio !== undefined) this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      if (element.verticalButtonAlignment !== undefined) this.verticalButtonAlignment = element.verticalButtonAlignment;
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Likert-Row instantiation', element);
    }
    /* The row renders `rowLabel`; the label the base class hands to every input element is deleted
       rather than blanked, so the inspector shows no field for it -- see HotspotImage (#1233). */
    delete (this as Partial<InputElement>).label;
  }

  // eslint-disable-next-line class-methods-use-this
  getVariableInfos(): VariableInfo[] {
    return [];
  }

  getVariableInfoOfRow(options: TextImageLabel[]): VariableInfo {
    return {
      id: this.id,
      alias: this.alias,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getVariableInfoValues(options),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getVariableInfoValues(options: TextImageLabel[]): VariableValue[] {
    return options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }
}

export interface LikertRowProperties extends InputElementProperties, FirstColumnRatioProperties {
  /** No styling: see the class field (#1226). */
  styling?: Record<never, never>;
  rowLabel: TextImageLabel;
  columnCount: number;
  verticalButtonAlignment: 'auto' | 'center';
}

function isLikertRowProperties(blueprint?: Partial<LikertRowProperties>): blueprint is LikertRowProperties {
  if (!blueprint) return false;
  return blueprint.type === 'likert-row';
}
