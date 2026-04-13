import {
  CompoundElement, UIElement
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { VariableInfo } from '@iqb/responses';
import {
  AbstractIDService,
  OptionElement,
  TextImageLabel,
  UIElementProperties,
  UIElementType,
  UIElementValue
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { ModelNormalizer } from 'common/utils/model-normalizer';

export class LikertElement extends CompoundElement implements OptionElement, LikertProperties {
  type: UIElementType = 'likert';
  rows: LikertRowElement[] = [...ELEMENT_DEFAULTS.likert.rows as LikertRowElement[]];
  options: TextImageLabel[] = [...ELEMENT_DEFAULTS.likert.options as TextImageLabel[]];
  firstColumnSizeRatio: number = ELEMENT_DEFAULTS.likert.firstColumnSizeRatio as number;
  label: string = ELEMENT_DEFAULTS.likert.label as string;
  label2: string = ELEMENT_DEFAULTS.likert.label2 as string;
  stickyHeader: boolean = ELEMENT_DEFAULTS.likert.stickyHeader as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.likert);
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
    firstLineColoring: boolean;
    firstLineColoringColor: string;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.likert),
      lineHeight: ELEMENT_DEFAULTS.likert.lineHeight as number,
      lineColoring: ELEMENT_DEFAULTS.likert.lineColoring as boolean,
      lineColoringColor: ELEMENT_DEFAULTS.likert.lineColoringColor as string,
      firstLineColoring: ELEMENT_DEFAULTS.likert.firstLineColoring as boolean,
      firstLineColoringColor: ELEMENT_DEFAULTS.likert.firstLineColoringColor as string
    };

  static title: string = 'Optionentabelle';
  static icon: string = 'margin';

  constructor(element?: Partial<LikertProperties>, idService?: AbstractIDService) {
    super({ type: 'likert', ...element }, idService);
    if (isLikertProperties(element)) {
      this.options = [...element.options];
      this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      this.rows = element.rows.map(row => new LikertRowElement(
        ModelNormalizer.normalizeElement(row as Record<string, unknown>) as any,
        idService
      ));
      this.label = element.label;
      this.label2 = element.label2;
      this.stickyHeader = element.stickyHeader;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Likert instantiation', element);
    }
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }

  setProperty(property: string, value: UIElementValue): void {
    super.setProperty(property, value);
    if (property === 'rows') {
      this.rows = value as LikertRowElement[];
      if (this.rows.length) {
        this.rows[this.rows.length - 1]
          .setProperty('isRelevantForPresentationComplete', this.isRelevantForPresentationComplete);
      }
    }
    if (property === 'options') {
      this.getChildElements()
        .forEach(childElement => childElement
          .setProperty('columnCount', this.options.length));
    }
    if (property === 'readOnly') {
      this.getChildElements()
        .forEach(childElement => childElement
          .setProperty('readOnly', value));
    }
    if (property === 'isRelevantForPresentationComplete') {
      this.getChildElements()
        .forEach(childElement => childElement
          .setProperty('isRelevantForPresentationComplete', value));
    }
  }

  getChildElements(): UIElement[] {
    return this.rows;
  }

  getVariableInfos(): VariableInfo[] {
    return [...super.getVariableInfos(), ...this.rows.map(row => row.getVariableInfoOfRow(this.options))];
  }

  getBlueprint(): LikertElement {
    return {
      ...this, rows: this.rows.map(el => el.getBlueprint()), id: undefined, alias: undefined
    };
  }
}

export interface LikertProperties extends UIElementProperties {
  rows: LikertRowElement[];
  options: TextImageLabel[];
  firstColumnSizeRatio: number;
  label: string;
  label2: string;
  stickyHeader: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
    firstLineColoring: boolean;
    firstLineColoringColor: string;
  };
}

function isLikertProperties(blueprint?: Partial<LikertProperties>): blueprint is LikertProperties {
  if (!blueprint) return false;
  return blueprint.rows !== undefined &&
    blueprint.options !== undefined &&
    blueprint.firstColumnSizeRatio !== undefined &&
    blueprint.label !== undefined &&
    blueprint.label2 !== undefined &&
    blueprint.stickyHeader !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined &&
    blueprint.styling?.lineColoring !== undefined &&
    blueprint.styling?.lineColoringColor !== undefined &&
    blueprint.styling?.firstLineColoring !== undefined &&
    blueprint.styling?.firstLineColoringColor !== undefined;
}
