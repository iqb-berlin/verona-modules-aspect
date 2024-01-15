import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

export type TextInputComponentType =
  TextAreaComponent | TextFieldComponent | SpellCorrectComponent | TextFieldSimpleComponent;
