import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'common/shared.module';
import { MergedMarkerComponent } from './components/merged-marker/merged-marker.component';
import { OptionListPanelComponent } from './components/option-list-panel/option-list-panel.component';
import { SizeInputPanelComponent } from './components/size-input-panel/size-input-panel.component';
import { NumberFieldModule } from './directives/number-field.module';
import { IsCompressibleImagePipe } from './pipes/is-compressible-image.pipe';

/**
 * Leaf controls of the editor that more than one feature area needs.
 *
 * All of them are used by the properties panel and from outside it, so none can be declared by
 * one of those without making it a dependency of the other — the number field directive sat in the
 * panel's folder while two dialogs outside it pulled the module in. Add something here only when a
 * second place actually needs it — this is not a dumping ground for shared-looking things.
 *
 * The directive keeps a module of its own, re-exported here, so it has a single owner: its spec
 * declares a host component of its own, and that host's NgModule has to import the directive
 * rather than declare it a second time.
 */
@NgModule({
  declarations: [
    MergedMarkerComponent,
    OptionListPanelComponent,
    SizeInputPanelComponent,
    IsCompressibleImagePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
    SharedModule,
    NumberFieldModule
  ],
  exports: [
    MergedMarkerComponent,
    OptionListPanelComponent,
    SizeInputPanelComponent,
    IsCompressibleImagePipe,
    NumberFieldModule
  ]
})
export class EditorSharedModule { }
