import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'common/shared.module';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { KeypadComponent } from './components/keypad/keypad.component';
import { KeypadKeyComponent } from './components/keypad-key/keypad-key.component';
import { KeypadLayoutComponent } from './components/keypad-layout/keypad-layout.component';

@NgModule({
  declarations: [
    KeypadComponent,
    KeypadKeyComponent,
    KeypadLayoutComponent,
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
