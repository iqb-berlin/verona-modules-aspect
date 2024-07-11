import { Type } from '@angular/core';
import {
  CompoundElement, UIElement,
  PositionedUIElement, UIElementValue, OptionElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertComponent } from 'common/components/compound-elements/likert/likert.component';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import { VariableInfo } from '@iqb/responses';

export class LikertElement extends CompoundElement implements OptionElement, LikertProperties {
  type: UIElementType = 'likert';
  rows: LikertRowElement[] = [];
  options: TextImageLabel[] = [];
  firstColumnSizeRatio: number = 5;
  label: string = 'Optionentabelle Beschriftung';
  label2: string = 'Beschriftung Erste Spalte';
  stickyHeader: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
    firstLineColoring: boolean;
    firstLineColoringColor: string;
  };

  static title: string = 'Optionentabelle';
  static icon: string = 'margin';

  constructor(element?: LikertProperties) {
    super(element);
    if (element && isValid(element)) {
      this.options = [...element.options];
      this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      this.rows = element.rows.map(row => new LikertRowElement(row));
      this.label = element.label;
      this.label2 = element.label2;
      this.stickyHeader = element.stickyHeader;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Likert instantiation', element);
      }
      if (element?.options !== undefined) this.options = element.options;
      if (element?.firstColumnSizeRatio !== undefined) this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      if (element?.rows !== undefined) this.rows = element.rows.map(row => new LikertRowElement(row));
      if (element?.label !== undefined) this.label = element.label;
      if (element?.label2 !== undefined) this.label2 = element.label2;
      if (element?.stickyHeader !== undefined) this.stickyHeader = element.stickyHeader;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 250,
        height: 200,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 35, unit: 'px' },
        ...element?.position
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps({
          backgroundColor: 'white',
          ...element?.styling
        }),
        lineHeight: element?.styling?.lineHeight || 135,
        lineColoring: element?.styling?.lineColoring !== undefined ? element?.styling.lineColoring : true,
        lineColoringColor: element?.styling?.lineColoringColor || '#c9e0e0',
        firstLineColoring: element?.styling?.firstLineColoring || false,
        firstLineColoringColor: element?.styling?.firstLineColoringColor || '#c7f3d0'
      };
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

  getElementComponent(): Type<ElementComponent> {
    return LikertComponent;
  }

  getChildElements(): UIElement[] {
    return this.rows;
  }

  getDuplicate(): LikertElement {
    return new LikertElement(this);
  }

  getVariableInfos(): VariableInfo[] {
    return this.rows.map(row => row.getVariableInfoOfRow(this.options));
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

function isValid(blueprint?: LikertProperties): boolean {
  if (!blueprint) return false;
  return blueprint.rows !== undefined &&
    blueprint.options !== undefined &&
    blueprint.firstColumnSizeRatio !== undefined &&
    blueprint.label !== undefined &&
    blueprint.label2 !== undefined &&
    blueprint.stickyHeader !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined &&
    blueprint.styling.lineColoring !== undefined &&
    blueprint.styling.lineColoringColor !== undefined &&
    blueprint.styling.firstLineColoring !== undefined &&
    blueprint.styling.firstLineColoringColor !== undefined;
}
