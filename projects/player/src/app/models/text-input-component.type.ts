import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math/text-area-math.component';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';

export type TextInputComponentType =
  TextAreaComponent | TextFieldComponent | SpellCorrectComponent | TextFieldSimpleComponent | TextAreaMathComponent;
