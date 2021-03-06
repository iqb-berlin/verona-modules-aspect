import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { KeypadComponent } from './components/keypad/keypad.component';
import { KeypadKeyComponent } from './components/keypad-key/keypad-key.component';
import { KeypadFrenchComponent } from './components/keypad-french/keypad-french.component';
import { KeypadMathComponent } from './components/keypad-math/keypad-math.component';
import { SharedModule } from 'common/shared.module';

@NgModule({
  declarations: [
    KeypadComponent,
    KeypadKeyComponent,
    KeypadFrenchComponent,
    KeypadMathComponent,
    KeyboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    KeypadComponent,
    KeyboardComponent
  ]
})
export class KeyInputModule {}
