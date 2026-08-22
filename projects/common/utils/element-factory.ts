import { UIElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { ButtonElement } from 'common/models/elements/action-group-elements/button';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-input-group-elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/text-input-group-elements/text-area';
import { CheckboxElement } from 'common/models/elements/input-group-elements/checkbox';
import { DropdownElement } from 'common/models/elements/input-group-elements/dropdown';
import { RadioButtonGroupElement } from 'common/models/elements/input-group-elements/radio-button-group';
import { ImageElement } from 'common/models/elements/interactive-group-elements/image';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { VideoElement } from 'common/models/elements/media-player-group-elements/video';
import { LikertElement } from 'common/models/elements/compound-group-elements/likert/likert';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-group-elements/radio-button-group-complex';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { ClozeElement } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { SliderElement } from 'common/models/elements/input-group-elements/slider';
import { SpellCorrectElement } from 'common/models/elements/text-input-group-elements/spell-correct';
import { FrameElement } from 'common/models/elements/base-group-elements/frame';
import { ToggleButtonElement } from 'common/models/elements/input-group-elements/toggle-button';
import { GeometryElement } from 'common/models/elements/external-app-group-elements/geometry';
import { HotspotImageElement } from 'common/models/elements/input-group-elements/hotspot-image';
import { MathFieldElement } from 'common/models/elements/text-input-group-elements/math-field';
import { MathTableElement } from 'common/models/elements/interactive-group-elements/math-table';
import { TextAreaMathElement } from 'common/models/elements/text-input-group-elements/text-area-math';
import { TriggerElement } from 'common/models/elements/action-group-elements/trigger';
import { TableElement } from 'common/models/elements/compound-group-elements/table/table';
import { MarkingPanelElement } from 'common/models/elements/interactive-group-elements/marking-panel';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementDraft } from 'common/models/ui-element-interfaces';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { ModelNormalizer } from 'common/utils/model-normalizer';
import { ModelRegistry } from 'common/utils/model-registry';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-group-elements/widget-periodic-table';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-group-elements/widget-molecule-editor';

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
        'widget-molecule-editor': WidgetMoleculeEditorElement
      };
    }
    return this.elementClasses;
  }

  static createElement(element: UIElementDraft, idService?: AbstractIDService)
    : UIElement {
    /* The id the normalizer takes on trust is minted here: a draft on its way in need not carry one,
       and everything past this point does (#1308). */
    const normalizedElement = ModelNormalizer.normalizeElement(element);
    if (!normalizedElement.id) {
      if (idService) {
        normalizedElement.id = idService.getAndRegisterNewID(normalizedElement.type);
        normalizedElement.alias = idService.getAndRegisterNewID(normalizedElement.type, true);
      } else {
        // Fallback for tests or simple instantiation where no idService is available
        const randomId = Math.random().toString(36).substring(2, 9);
        normalizedElement.id = `${normalizedElement.type}_${randomId}`;
        normalizedElement.alias = `${normalizedElement.type}_alias_${randomId}`;
      }
    }
    return new ElementFactory.ELEMENT_CLASSES[element.type](normalizedElement, idService);
  }
}

ModelRegistry.createElement = ElementFactory.createElement;
