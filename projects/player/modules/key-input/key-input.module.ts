import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'common/shared.module';
import { KeypadComponent } from './components/keypad/keypad.component';
import { KeypadKeyComponent } from './components/keypad-key/keypad-key.component';
import { KeypadLayoutComponent } from './components/keypad-layout/keypad-layout.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { KeyboardKeyComponent } from './components/keyboard-key/keyboard-key.component';
import { GetAlternativeKeyPipe } from './pipes/get-alternative-key.pipe';
import { GetLayoutClassPipe } from './pipes/get-layout-class.pipe';
import { CharacterIconComponent } from './components/character-icon/character-icon.component';

@NgModule({
  declarations: [
    KeypadComponent,
    KeypadKeyComponent,
    KeypadLayoutComponent,
    KeyboardComponent,
    KeyboardKeyComponent,
    GetAlternativeKeyPipe,
    GetLayoutClassPipe,
    CharacterIconComponent
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
