import { ComponentRegistry } from 'common/utils/component-registry';
import { TextComponent } from 'common/components/text-group/text/text.component';
import { ButtonComponent } from 'common/components/action-group/button/button.component';
import { TextFieldComponent } from 'common/components/text-input-group/text-field/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-group/text-field-simple/text-field-simple.component';
import { TextAreaComponent } from 'common/components/text-input-group/text-area/text-area.component';
import { CheckboxComponent } from 'common/components/input-group/checkbox/checkbox.component';
import { DropdownComponent } from 'common/components/input-group/dropdown/dropdown.component';
import { RadioButtonGroupComponent } from 'common/components/input-group/radio-button-group/radio-button-group.component';
import { ImageComponent } from 'common/components/interactive-group/image/image.component';
import { AudioComponent } from 'common/components/media-player-group/audio/audio.component';
import { VideoComponent } from 'common/components/media-player-group/video/video.component';
import { LikertComponent } from 'common/components/compound-group/likert/likert.component';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-group/likert-radio-button-group/likert-radio-button-group.component';
import { RadioGroupImagesComponent } from 'common/components/input-group/radio-group-images/radio-group-images.component';
import { DropListComponent } from 'common/components/input-group/drop-list/drop-list.component';
import { ClozeComponent } from 'common/components/compound-group/cloze/cloze.component';
import { TableComponent } from 'common/components/compound-group/table/table.component';
import { HotspotImageComponent } from 'common/components/input-group/hotspot-image/hotspot-image.component';
import { SliderComponent } from 'common/components/input-group/slider/slider.component';
import { SpellCorrectComponent } from 'common/components/text-input-group/spell-correct/spell-correct.component';
import { FrameComponent } from 'common/components/base-group/frame/frame.component';
import {
  ToggleButtonComponent
} from 'common/components/compound-group/toggle-button/toggle-button.component';
import { GeometryComponent } from 'common/components/external-app-group/geometry/geometry.component';
import { MathFieldComponent } from 'common/components/text-input-group/math-field/math-field.component';
import { MathTableComponent } from 'common/components/interactive-group/math-table/math-table.component';
import { TextAreaMathComponent } from 'common/components/text-input-group/text-area-math/text-area-math.component';
import { TriggerComponent } from 'common/components/action-group/trigger/trigger.component';
import {
  WidgetMoleculeEditorComponent
} from 'common/components/widget-group/widget-molecule-editor/widget-molecule-editor.component';
import { WidgetPeriodicTableComponent } from 'common/components/widget-group/widget-periodic-table/widget-periodic-table.component';

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
