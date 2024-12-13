import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MathInputComponent } from 'common/math-editor/math-input.component';

@NgModule({
  declarations: [
    MathInputComponent
  ],
  imports: [
    CommonModule,
    MatButtonToggleModule
  ],
  exports: [
    MathInputComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MathEditorModule {}
