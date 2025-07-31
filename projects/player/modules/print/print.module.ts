import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintLayoutComponent } from 'player/modules/print/components/print-layout/print-layout.component';
import { PrintPageComponent } from 'player/modules/print/components/print-page/print-page.component';
import { PrintSectionComponent } from 'player/modules/print/components/print-section/print-section.component';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { PrintElementComponent } from 'player/modules/print/components/print-element/print-element.component';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkConnectedOverlay, CdkOverlayOrigin, CdkScrollable } from '@angular/cdk/overlay';
import { PrintLabelComponent } from 'player/modules/print/components/print-label/print-label.component';

@NgModule({
  declarations: [
    PrintLayoutComponent,
    PrintPageComponent,
    PrintSectionComponent,
    PrintElementComponent,
    PrintLabelComponent
  ],
  imports: [
    CommonModule,
    MeasurePipe,
    MatIconButton,
    MatTooltip,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    CdkScrollable
  ],
  exports: [
    PrintLayoutComponent
  ]
})
export class PrintModule { }
