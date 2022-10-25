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
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';

export abstract class ElementFactory {
  static ELEMENT_CLASSES: Record<string, Type<UIElement>> = {
    text: TextElement,
    button: ButtonElement,
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
    'radio-group-images': RadioButtonGroupComplexElement,
    'drop-list': DropListElement,
    'drop-list-simple': DropListSimpleElement,
    cloze: ClozeElement,
    slider: SliderElement,
    'spell-correct': SpellCorrectElement,
    frame: FrameElement,
    'toggle-button': ToggleButtonElement,
    geometry: GeometryElement,
    'hotspot-image': HotspotImageElement
  };

  static createElement(element: { type: string } & Partial<UIElement>): UIElement {
    return new ElementFactory.ELEMENT_CLASSES[element.type](element);
  }
}
