import { TextAreaComponent } from 'common/components/text-input-group/text-area/text-area.component';
import { TextFieldComponent } from 'common/components/text-input-group/text-field/text-field.component';
import { SpellCorrectComponent } from 'common/components/text-input-group/spell-correct/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-group/text-field-simple/text-field-simple.component';
import { TextAreaMathComponent } from 'common/components/text-input-group/text-area-math/text-area-math.component';

export type TextInputComponentType =
  TextAreaComponent | TextFieldComponent | SpellCorrectComponent | TextFieldSimpleComponent | TextAreaMathComponent;
