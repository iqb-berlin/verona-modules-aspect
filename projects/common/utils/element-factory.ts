import { UIElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { ButtonElement } from 'common/models/elements/button/button';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { MathTableElement } from 'common/models/elements/input-elements/math-table';
import { TextAreaMathElement } from 'common/models/elements/input-elements/text-area-math';
import { TriggerElement } from 'common/models/elements/trigger/trigger';
import { TableElement } from 'common/models/elements/compound-elements/table/table';
import { MarkingPanelElement } from 'common/models/elements/text/marking-panel';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { ModelNormalizer } from 'common/utils/model-normalizer';
import { ModelRegistry } from 'common/utils/model-registry';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table/widget-periodic-table';
import { WidgetCalcElement } from 'common/models/elements/widget-calc/widget-calc';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor/widget-molecule-editor';

export abstract class ElementFactory {
  private static elementClasses: Record<string, Type<UIElement>>;

  private static get ELEMENT_CLASSES(): Record<string, Type<UIElement>> {
    if (!this.elementClasses) {
      this.elementClasses = {
        text: TextElement,
        'marking-panel': MarkingPanelElement,
        button: ButtonElement,
        trigger: TriggerElement,
        'text-field': TextFieldElement,
        'text-field-simple': TextFieldSimpleElement,
        'text-area': TextAreaElement,
        checkbox: CheckboxElement,
        dropdown: DropdownElement,
        radio: RadioButtonGroupElement,
        image: ImageElement,
        audio: AudioElement,
        video: VideoElement,
        likert: LikertElement,
        'likert-row': LikertRowElement,
        'radio-group-images': RadioButtonGroupComplexElement,
        'drop-list': DropListElement,
        cloze: ClozeElement,
        slider: SliderElement,
        'spell-correct': SpellCorrectElement,
        frame: FrameElement,
        'toggle-button': ToggleButtonElement,
        geometry: GeometryElement,
        'hotspot-image': HotspotImageElement,
        'math-field': MathFieldElement,
        'math-table': MathTableElement,
        'text-area-math': TextAreaMathElement,
        table: TableElement,
        'widget-periodic-table': WidgetPeriodicTableElement,
        'widget-calc': WidgetCalcElement,
        'widget-molecule-editor': WidgetMoleculeEditorElement
      };
    }
    return this.elementClasses;
  }

  static createElement(element: { type: UIElementType } & Partial<UIElementProperties>, idService?: AbstractIDService)
    : UIElement {
    const normalizedElement = ModelNormalizer.normalizeElement(element as Record<string, unknown>);
    if (!normalizedElement.id) {
      if (idService) {
        normalizedElement.id = idService.getAndRegisterNewID(normalizedElement.type as UIElementType);
        normalizedElement.alias = idService.getAndRegisterNewID(normalizedElement.type as UIElementType, true);
      } else {
        // Fallback for tests or simple instantiation where no idService is available
        const randomId = Math.random().toString(36).substring(2, 9);
        normalizedElement.id = `${normalizedElement.type}_${randomId}`;
        normalizedElement.alias = `${normalizedElement.type}_alias_${randomId}`;
      }
    }
    const elementType = normalizedElement.type as UIElementType;
    const ElementClass = ElementFactory.ELEMENT_CLASSES[elementType];
    if (!ElementClass) {
      throw new Error(`Unknown element type '${String(elementType)}' in ElementFactory.createElement`);
    }
    return new ElementClass(
      normalizedElement as unknown as UIElementProperties, idService
    );
  }
}

ModelRegistry.createElement = ElementFactory.createElement;
