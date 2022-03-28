import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout';

import { KeyboardComponent } from './components/keyboard.component';

@NgModule({
  declarations: [
    KeyboardComponent
  ],
  exports: [
    KeyboardComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FlexModule
  ]
})
export class KeyboardModule { }
