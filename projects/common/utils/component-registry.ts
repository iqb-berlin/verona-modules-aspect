import { Type } from '@angular/core';
import { UIElementType } from 'common/interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';
import { ButtonComponent } from 'common/components/button/button.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';
import { DropdownComponent } from 'common/components/input-elements/dropdown.component';
import { RadioButtonGroupComponent } from 'common/components/input-elements/radio-button-group.component';
import { ImageComponent } from 'common/components/media-elements/image.component';
import { VideoComponent } from 'common/components/media-elements/video.component';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import { LikertComponent } from 'common/components/compound-elements/likert/likert.component';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';
import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';
import { SliderComponent } from 'common/components/input-elements/slider.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { FrameComponent } from 'common/components/frame/frame.component';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math/text-area-math.component';
import { TriggerComponent } from 'common/components/trigger/trigger.component';
import { MarkingPanelComponent } from 'common/components/text/marking-panel.component';
import { WidgetCalcComponent } from 'common/components/widget-calc/widget-calc.component';
import {
  WidgetMoleculeEditorComponent
} from 'common/components/widget-molecule-editor/widget-molecule-editor.component';
import { WidgetPeriodicTableComponent } from 'common/components/widget-periodic-table/widget-periodic-table.component';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-elements/likert/likert-radio-button-group.component';

export abstract class ComponentRegistry {
  private static components: { [type in UIElementType]?: Type<ElementComponent> } = {
    text: TextComponent,
    button: ButtonComponent,
    'text-field': TextFieldComponent,
    'text-field-simple': TextFieldSimpleComponent,
    'text-area': TextAreaComponent,
    checkbox: CheckboxComponent,
    dropdown: DropdownComponent,
    radio: RadioButtonGroupComponent,
    image: ImageComponent,
    audio: AudioComponent,
    video: VideoComponent,
    likert: LikertComponent,
    'likert-row': LikertRadioButtonGroupComponent,
    'radio-group-images': RadioGroupImagesComponent,
    'drop-list': DropListComponent,
    cloze: ClozeComponent,
    'hotspot-image': HotspotImageComponent,
    slider: SliderComponent,
    'spell-correct': SpellCorrectComponent,
    frame: FrameComponent,
    'toggle-button': ToggleButtonComponent,
    geometry: GeometryComponent,
    'math-field': MathFieldComponent,
    'math-table': MathTableComponent,
    'text-area-math': TextAreaMathComponent,
    trigger: TriggerComponent,
    'marking-panel': MarkingPanelComponent,
    'widget-calc': WidgetCalcComponent,
    'widget-molecule-editor': WidgetMoleculeEditorComponent,
    'widget-periodic-table': WidgetPeriodicTableComponent
  };

  static getComponent(type: UIElementType): Type<ElementComponent> {
    const component = ComponentRegistry.components[type];
    if (!component) {
      throw new Error(`Component for type ${type} not found in ComponentRegistry`);
    }
    return component;
  }
}
