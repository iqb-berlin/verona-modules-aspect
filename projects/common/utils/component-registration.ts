import { ComponentRegistry } from 'common/utils/component-registry';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { ButtonComponent } from 'common/components/action-group-elements/button/button.component';
import { TextFieldComponent } from 'common/components/text-input-group-elements/text-field/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/text-input-group-elements/text-field-simple/text-field-simple.component';
import { TextAreaComponent } from 'common/components/text-input-group-elements/text-area/text-area.component';
import { CheckboxComponent } from 'common/components/input-group-elements/checkbox/checkbox.component';
import { DropdownComponent } from 'common/components/input-group-elements/dropdown/dropdown.component';
import {
  RadioButtonGroupComponent
} from 'common/components/input-group-elements/radio-button-group/radio-button-group.component';
import { ImageComponent } from 'common/components/interactive-group-elements/image/image.component';
import { AudioComponent } from 'common/components/media-player-group-elements/audio/audio.component';
import { VideoComponent } from 'common/components/media-player-group-elements/video/video.component';
import { LikertComponent } from 'common/components/compound-group-elements/likert/likert.component';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-group-elements/likert-radio-button-group/likert-radio-button-group.component';
import {
  RadioGroupImagesComponent
} from 'common/components/input-group-elements/radio-group-images/radio-group-images.component';
import { DropListComponent } from 'common/components/input-group-elements/drop-list/drop-list.component';
import { ClozeComponent } from 'common/components/compound-group-elements/cloze/cloze.component';
import { TableComponent } from 'common/components/compound-group-elements/table/table.component';
import { HotspotImageComponent } from 'common/components/input-group-elements/hotspot-image/hotspot-image.component';
import { SliderComponent } from 'common/components/input-group-elements/slider/slider.component';
import {
  SpellCorrectComponent
} from 'common/components/text-input-group-elements/spell-correct/spell-correct.component';
import { FrameComponent } from 'common/components/base-group-elements/frame/frame.component';
import {
  ToggleButtonComponent
} from 'common/components/input-group-elements/toggle-button/toggle-button.component';
import { GeometryComponent } from 'common/components/external-app-group-elements/geometry/geometry.component';
import { MathFieldComponent } from 'common/components/text-input-group-elements/math-field/math-field.component';
import { MathTableComponent } from 'common/components/interactive-group-elements/math-table/math-table.component';
import {
  TextAreaMathComponent
} from 'common/components/text-input-group-elements/text-area-math/text-area-math.component';
import { TriggerComponent } from 'common/components/action-group-elements/trigger/trigger.component';
import {
  WidgetMoleculeEditorComponent
} from 'common/components/widget-group-elements/widget-molecule-editor/widget-molecule-editor.component';
import {
  WidgetPeriodicTableComponent
} from 'common/components/widget-group-elements/widget-periodic-table/widget-periodic-table.component';

export function registerComponents(): void {
  ComponentRegistry.registerComponents({
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
    table: TableComponent,
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
    'widget-molecule-editor': WidgetMoleculeEditorComponent,
    'widget-periodic-table': WidgetPeriodicTableComponent
  });
}
