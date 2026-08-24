import { TextAreaComponent } from 'common/components/text-input-group-elements/text-area/text-area.component';
import { TextFieldComponent } from 'common/components/text-input-group-elements/text-field/text-field.component';
import {
  SpellCorrectComponent
} from 'common/components/text-input-group-elements/spell-correct/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/text-input-group-elements/text-field-simple/text-field-simple.component';
import {
  TextAreaMathComponent
} from 'common/components/text-input-group-elements/text-area-math/text-area-math.component';

export type TextInputComponentType =
  TextAreaComponent | TextFieldComponent | SpellCorrectComponent | TextFieldSimpleComponent | TextAreaMathComponent;
