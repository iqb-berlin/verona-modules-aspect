import {
  InputElement,
  isUIElementProperties
} from 'common/models/elements/element';
import { environment } from 'common/environment';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  AbstractIDService,
  InputElementProperties,
  TextImageLabel, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class LikertRowElement extends InputElement implements LikertRowProperties {
  type: UIElementType = 'likert-row';
  rowLabel: TextImageLabel = ELEMENT_DEFAULTS['likert-row'].rowLabel as TextImageLabel;
  columnCount: number = ELEMENT_DEFAULTS['likert-row'].columnCount as number;
  firstColumnSizeRatio: number = ELEMENT_DEFAULTS['likert-row'].firstColumnSizeRatio as number;
  verticalButtonAlignment: 'auto' | 'center' =
    ELEMENT_DEFAULTS['likert-row'].verticalButtonAlignment as 'auto' | 'center';

  constructor(element?: Partial<LikertRowProperties>, idService?: AbstractIDService) {
    super({ type: 'likert-row', ...element }, idService);
    if (isLikertRowProperties(element)) {
      this.rowLabel = element.rowLabel;
      this.columnCount = element.columnCount;
      this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      this.verticalButtonAlignment = element.verticalButtonAlignment;
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Likert-Row instantiation', element);
    }
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

export interface LikertRowProperties extends InputElementProperties {
  rowLabel: TextImageLabel;
  columnCount: number;
  firstColumnSizeRatio: number;
  verticalButtonAlignment: 'auto' | 'center';
}

function isLikertRowProperties(blueprint?: Partial<LikertRowProperties>): blueprint is LikertRowProperties {
  if (!blueprint) return false;
  return blueprint.rowLabel !== undefined &&
    blueprint.columnCount !== undefined &&
    blueprint.firstColumnSizeRatio !== undefined &&
    blueprint.verticalButtonAlignment !== undefined &&
    isUIElementProperties(blueprint);
}
