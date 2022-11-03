import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'common/shared.module';
import { KeypadComponent } from './components/keypad/keypad.component';
import { KeypadKeyComponent } from './components/keypad-key/keypad-key.component';
import { KeypadLayoutComponent } from './components/keypad-layout/keypad-layout.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { KeyboardKeyComponent } from './components/keyboard-key/keyboard-key.component';

@NgModule({
  declarations: [
    KeypadComponent,
    KeypadKeyComponent,
    KeypadLayoutComponent,
    KeyboardComponent,
    KeyboardKeyComponent
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
